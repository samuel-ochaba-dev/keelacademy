#!/usr/bin/env python3
"""enroll/server.py — identity bridge + Stripe Checkout enrollment (S2.5).

The learner app authenticates students with managed auth (Clerk in real
wiring, an offline fake in credential-free environments) but holds no
database credentials, exactly like the S2.4 reader. This service is the
write-side boundary between the two:

    GET  /healthz                       -> {"ok": true}
    POST /auth/bridge                   -> link auth identity to a students row
    GET  /students/<id>/profile         -> student row + enrollments + budget
    GET  /students/<id>/submissions     -> the student's own submissions
    GET  /price?unit=<unit-id>          -> configured price for a unit
    POST /checkout/session              -> create a Stripe Checkout session
    GET  /checkout/status?stripe_session_id=<id> -> pending/completed + enrolled
    POST /webhook/stripe                -> checkout.session.completed -> enroll

App-facing routes (everything but the webhook) authenticate with the header
X-Keel-App-Token, a shared secret from env KEEL_ENROLL_SECRET that lives in
the app's server environment only (never NEXT_PUBLIC, never a client bundle).
The webhook route instead verifies Stripe's own signature scheme, below.

Stripe calls. Session creation POSTs form-encoded fields exactly like the
real API (line_items[0][price_data][...] etc.) to KEEL_STRIPE_API_URL
(default https://api.stripe.com/v1) with the key from env STRIPE_SECRET_KEY
(env only; never logged; bearer only). Point KEEL_STRIPE_API_URL at
enroll/fake_stripe.py for the offline deterministic proof — same call shape,
zero network, zero credentials.

Webhook signature (byte-for-byte Stripe's documented scheme, verified over
the RAW body before any JSON parsing, mirroring intake's HMAC-first rule):
the Stripe-Signature header carries t=<unix-ts>,v1=<hex>; the expected v1 is
hex(HMAC-SHA256(KEEL_STRIPE_WEBHOOK_SECRET, "<t>." + raw_body)). A timestamp
outside KEEL_STRIPE_TOLERANCE_S (default 300; 0 disables the age check for
delayed-replay proofs) is rejected.

Idempotency. A replayed checkout.session.completed must not double-enroll:
enrollments UNIQUE (student_id, unit_id) with ON CONFLICT DO NOTHING is the
arbiter, and the enrollment.activated event is appended only when the insert
returned a row. Replays (and completions of a second checkout after the
student is already enrolled) return 200 with newly_enrolled=false. The
budget row the grading proxy requires is provisioned on first enrollment
(INSERT ... ON CONFLICT DO NOTHING, cap from KEEL_DEFAULT_BUDGET_TOKENS).

Database access follows the house convention: env KEEL_DB_CMD (shlex-split,
psql-compatible) via the shared db.py helper, one session per request.
"""

import hashlib
import hmac
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Add grading dir to sys.path to import shared db module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from db import db_sql, sql_str

MAX_BODY_BYTES = 5 * 1024 * 1024  # reject anything bigger before parsing
UNIT_RE = re.compile(r"^\d+\.\d+\.\d+$")
STRIPE_CALL_TIMEOUT_S = 15


def app_token():
    return os.environ.get("KEEL_ENROLL_SECRET", "")


def price_for_unit(unit_id):
    """Unit price in cents: KEEL_PRICE_CENTS_<id with dots as underscores>,
    else KEEL_PRICE_CENTS_DEFAULT, else 4900."""
    specific = os.environ.get("KEEL_PRICE_CENTS_" + unit_id.replace(".", "_"))
    if specific and specific.isdigit():
        return int(specific)
    fallback = os.environ.get("KEEL_PRICE_CENTS_DEFAULT", "4900")
    return int(fallback) if fallback.isdigit() else 4900


def default_budget_tokens():
    try:
        return int(os.environ.get("KEEL_DEFAULT_BUDGET_TOKENS", "100000"))
    except ValueError:
        return 100000


def create_stripe_checkout_session(unit_id, amount_cents, student_id,
                                   success_url, cancel_url):
    """Call the Stripe API (real or fake — same wire shape) to create a
    Checkout Session. Returns (session_id, session_url) or raises
    RuntimeError with a short code for the caller to map to an HTTP status.

    Field names mirror https://docs.stripe.com/api/checkout/session/create:
    inline price_data so no Price object needs to pre-exist; metadata and
    client_reference_id carry the student/unit so the webhook can enroll
    without trusting anything else in the payload.
    """
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise RuntimeError("stripe_not_wired")
    base = os.environ.get("KEEL_STRIPE_API_URL", "https://api.stripe.com/v1")
    fields = {
        "mode": "payment",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": str(amount_cents),
        "line_items[0][price_data][product_data][name]":
            "Keel Academy unit %s" % unit_id,
        "client_reference_id": str(student_id),
        "metadata[student_id]": str(student_id),
        "metadata[unit_id]": unit_id,
        "success_url": success_url,
        "cancel_url": cancel_url,
    }
    body = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(
        base.rstrip("/") + "/checkout/sessions",
        data=body,
        headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=STRIPE_CALL_TIMEOUT_S) as resp:
            doc = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        # Never echo the body upstream sent; it can echo the bearer key.
        sys.stderr.write("enroll: stripe answered HTTP %d\n" % exc.code)
        raise RuntimeError("stripe_error")
    except (urllib.error.URLError, OSError, ValueError) as exc:
        sys.stderr.write("enroll: stripe call failed: %s\n" % type(exc).__name__)
        raise RuntimeError("stripe_unreachable")

    session_id = doc.get("id")
    session_url = doc.get("url")
    if not session_id or not session_url:
        raise RuntimeError("stripe_bad_response")
    return session_id, session_url


def verify_stripe_signature(raw, header, secret, tolerance_s):
    """Stripe's scheme: t and v1 pairs in the header; v1 must equal
    HMAC-SHA256(secret, "<t>." + raw_body). Constant-time compare; the
    timestamp age check is skipped when tolerance_s is 0."""
    if not secret:
        return False
    parts = {}
    for item in header.split(","):
        if "=" in item:
            k, v = item.split("=", 1)
            parts.setdefault(k.strip(), v.strip())
    ts = parts.get("t", "")
    v1 = parts.get("v1", "")
    if not ts or not v1:
        return False
    if tolerance_s > 0:
        try:
            age = abs(int(time.time()) - int(ts))
        except ValueError:
            return False
        if age > tolerance_s:
            return False
    expected = hmac.new(
        secret.encode(), ("%s." % ts).encode() + raw, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(v1, expected)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _respond(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Minimal logging; never log headers (they carry tokens/signatures)
        # or bodies (they carry student emails).
        sys.stderr.write("enroll: %s %s\n" % (self.command, self.path))

    def _read_body(self):
        """Read Content-Length bytes with a hard cap and guarded parse.
        Returns (ok, raw)."""
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return False, b""
        if length < 0 or length > MAX_BODY_BYTES:
            return False, b""
        return True, self.rfile.read(length) if length else b""

    def _app_authorized(self):
        expected = app_token()
        if not expected:
            return False
        supplied = self.headers.get("X-Keel-App-Token", "")
        return hmac.compare_digest(supplied, expected)

    def _bad_token(self):
        self._respond(401, {"error": "invalid app token"})

    # ------------------------------------------------------------------
    # GET routes
    # ------------------------------------------------------------------

    def do_GET(self):
        if self.path == "/healthz":
            self._respond(200, {"ok": True})
            return

        if not self._app_authorized():
            self._bad_token()
            return

        parsed = urllib.parse.urlsplit(self.path)
        query = urllib.parse.parse_qs(parsed.query)

        if parsed.path == "/price":
            unit = (query.get("unit") or [""])[0]
            if not UNIT_RE.match(unit):
                self._respond(400, {"error": "bad unit id"})
                return
            self._respond(200, {
                "unit_id": unit,
                "amount_cents": price_for_unit(unit),
                "currency": "usd",
            })
            return

        if parsed.path == "/checkout/status":
            sid = (query.get("stripe_session_id") or [""])[0]
            if not re.match(r"^[A-Za-z0-9_\-]{1,128}$", sid):
                self._respond(400, {"error": "bad session id"})
                return
            rows = db_sql(
                "BEGIN;\n"
                "SELECT cs.status, e.id\n"
                "FROM checkout_sessions cs\n"
                "LEFT JOIN enrollments e\n"
                "  ON e.checkout_session_id = cs.id\n"
                "WHERE cs.stripe_session_id = %s;\n"
                "ROLLBACK;\n" % sql_str(sid)
            )
            if not rows:
                self._respond(404, {"error": "not_found"})
                return
            self._respond(200, {
                "stripe_session_id": sid,
                "status": rows[0][0],
                "enrolled": rows[0][1] != "",
            })
            return

        m = re.match(r"^/students/(\d{1,15})/(profile|submissions)$", parsed.path)
        if m:
            self._student_route(int(m.group(1)), m.group(2))
            return

        self._respond(404, {"error": "not found"})

    def _student_route(self, student_id, which):
        # SELECTs only; tab-scrub the human-free-text columns (db.py splits
        # rows on tab). The profile script tags each statement's rows ('S',
        # 'E', 'B', 'R') so the four result sets parse unambiguously.
        if which == "profile":
            rows = db_sql(
                "BEGIN;\n"
                "SELECT 'S', id, email, replace(display_name, chr(9), ' ')\n"
                "FROM students WHERE id = %d;\n"
                "SELECT 'E', unit_id, status, enrolled_at FROM enrollments\n"
                "WHERE student_id = %d ORDER BY unit_id;\n"
                "SELECT 'B', tokens_cap, tokens_used FROM budgets\n"
                "WHERE student_id = %d;\n"
                "SELECT 'R', gate_id, status, amount_cents, currency,\n"
                "        pledged_at, window_ends_at, earned_at, paid_at,\n"
                "        forfeited_at, expired_at\n"
                "FROM rebates WHERE student_id = %d ORDER BY id;\n"
                "ROLLBACK;\n" % (student_id, student_id, student_id, student_id)
            )
            student = next((r for r in rows if r[0] == "S"), None)
            if not student:
                self._respond(404, {"error": "not_found"})
                return
            enrollments = [
                {"unit_id": r[1], "status": r[2], "enrolled_at": r[3]}
                for r in rows if r[0] == "E"
            ]
            budget_rows = [r for r in rows if r[0] == "B"]
            budget = {"tokens_cap": int(budget_rows[0][1]),
                      "tokens_used": int(budget_rows[0][2])} if budget_rows \
                else None
            rebates = [
                {"gate_id": r[1], "status": r[2], "amount_cents": int(r[3]),
                 "currency": r[4], "pledged_at": r[5], "window_ends_at": r[6],
                 "earned_at": r[7] or None, "paid_at": r[8] or None,
                 "forfeited_at": r[9] or None, "expired_at": r[10] or None}
                for r in rows if r[0] == "R"
            ]
            self._respond(200, {
                "student_id": int(student[1]),
                "email": student[2],
                "display_name": student[3] or None,
                "enrollments": enrollments,
                "budget": budget,
                "rebates": rebates,
            })
            return

        # which == "submissions": the auth-gated list for /me. Includes the
        # verdict overall when graded, so the list can show pass/fail without
        # a second round trip to the reader. Unknown student -> 404 (an empty
        # list is reserved for a real student with no submissions yet).
        exists = db_sql(
            "BEGIN;\n"
            "SELECT id FROM students WHERE id = %d;\n"
            "ROLLBACK;\n" % student_id
        )
        if not exists:
            self._respond(404, {"error": "not_found"})
            return
        rows = db_sql(
            "BEGIN;\n"
            "SELECT s.id, s.unit_id, s.status, s.created_at, v.overall\n"
            "FROM submissions s\n"
            "LEFT JOIN verdicts v ON v.submission_id = s.id\n"
            "WHERE s.student_id = %d\n"
            "ORDER BY s.id DESC;\n"
            "ROLLBACK;\n" % student_id
        )
        self._respond(200, {"submissions": [
            {"id": int(r[0]), "unit_id": r[1], "status": r[2],
             "created_at": r[3], "overall": r[4] or None}
            for r in rows
        ]})

    # ------------------------------------------------------------------
    # POST routes
    # ------------------------------------------------------------------

    def do_POST(self):
        if self.path == "/webhook/stripe":
            self._handle_webhook()
            return

        if not self._app_authorized():
            # Drain the body before answering so keep-alive parsing of the
            # next request on this connection starts at the right offset.
            self._read_body()
            self._bad_token()
            return

        if self.path == "/auth/bridge":
            self._handle_bridge()
            return
        if self.path == "/checkout/session":
            self._handle_checkout_session()
            return
        self._respond(404, {"error": "not found"})

    def _handle_bridge(self):
        """Link a managed-auth identity to a students row.

        Resolution order: existing row by external_auth_id; else existing row
        by email with a NULL external_auth_id (claim it — this is how a
        student who pushed submissions before signing up keeps their
        history); else insert a new row. An email already linked to a
        DIFFERENT auth account is a 409, not a silent merge.
        """
        ok, raw = self._read_body()
        if not ok:
            self._respond(413, {"error": "body too large"})
            return
        try:
            payload = json.loads(raw)
        except ValueError:
            self._respond(400, {"error": "invalid JSON"})
            return
        external_id = str(payload.get("external_id") or "")
        email = str(payload.get("email") or "").strip().lower()
        name = payload.get("name")
        if not external_id or len(external_id) > 191 \
                or "@" not in email or len(email) > 320:
            self._respond(422, {"error": "external_id and a valid email are required"})
            return
        if name is not None:
            name = str(name).replace("\t", " ")[:200]

        sql = """BEGIN;
WITH existing AS (
    SELECT id FROM students WHERE external_auth_id = %s
), claimed AS (
    UPDATE students SET external_auth_id = %s
    WHERE email = %s AND external_auth_id IS NULL
      AND NOT EXISTS (SELECT 1 FROM existing)
    RETURNING id
), inserted AS (
    INSERT INTO students (email, display_name, external_auth_id)
    SELECT %s, %s, %s
    WHERE NOT EXISTS (SELECT 1 FROM existing)
      AND NOT EXISTS (SELECT 1 FROM claimed)
      AND NOT EXISTS (SELECT 1 FROM students WHERE email = %s AND external_auth_id IS NOT NULL)
    RETURNING id
), renamed AS (
    UPDATE students SET display_name = COALESCE(%s, display_name)
    WHERE id IN (SELECT id FROM existing UNION SELECT id FROM claimed
                 UNION SELECT id FROM inserted)
      AND %s IS NOT NULL
    RETURNING id
)
SELECT COALESCE((SELECT id FROM existing), (SELECT id FROM claimed),
                (SELECT id FROM inserted)),
       EXISTS (SELECT 1 FROM students WHERE email = %s
               AND external_auth_id IS NOT NULL
               AND external_auth_id <> %s);
COMMIT;
""" % (
            sql_str(external_id), sql_str(external_id), sql_str(email),
            sql_str(email), sql_str(name), sql_str(external_id), sql_str(email),
            sql_str(name), sql_str(name),
            sql_str(email), sql_str(external_id),
        )
        try:
            rows = db_sql(sql)
        except RuntimeError:
            self._respond(500, {"error": "database error"})
            return
        student_id, email_taken = rows[0]
        if not student_id:
            self._respond(409, {"error": "email_linked_to_other_account"})
            return
        self._respond(200, {"ok": True, "student_id": int(student_id)})

    def _handle_checkout_session(self):
        ok, raw = self._read_body()
        if not ok:
            self._respond(413, {"error": "body too large"})
            return
        try:
            payload = json.loads(raw)
        except ValueError:
            self._respond(400, {"error": "invalid JSON"})
            return
        student_id = payload.get("student_id")
        unit_id = str(payload.get("unit_id") or "")
        success_url = str(payload.get("success_url") or "")
        cancel_url = str(payload.get("cancel_url") or "")
        if not isinstance(student_id, int) or not UNIT_RE.match(unit_id) \
                or not success_url.startswith(("http://", "https://")) \
                or not cancel_url.startswith(("http://", "https://")):
            self._respond(422, {"error": "student_id, unit_id, success_url, cancel_url required"})
            return

        # The student must exist (the app bridges the identity first).
        rows = db_sql(
            "BEGIN;\n"
            "SELECT id FROM students WHERE id = %d;\n"
            "ROLLBACK;\n" % student_id
        )
        if not rows:
            self._respond(404, {"error": "unknown student"})
            return

        amount = price_for_unit(unit_id)
        try:
            session_id, session_url = create_stripe_checkout_session(
                unit_id, amount, student_id, success_url, cancel_url
            )
        except RuntimeError as exc:
            code = str(exc)
            status = {"stripe_not_wired": 503,
                      "stripe_unreachable": 502,
                      "stripe_error": 502,
                      "stripe_bad_response": 502}.get(code, 502)
            self._respond(status, {"error": code})
            return

        # Already enrolled? Real Stripe would still take the money, so the
        # app must not offer the button; the service double-checks and marks
        # the session expired so a stale tab cannot enroll-and-charge again.
        try:
            db_sql(
                "BEGIN;\n"
                "INSERT INTO checkout_sessions\n"
                "  (stripe_session_id, student_id, unit_id, amount_cents)\n"
                "VALUES (%s, %d, %s, %d);\n"
                "COMMIT;\n" % (sql_str(session_id), student_id,
                               sql_str(unit_id), amount),
                want_rows=False,
            )
        except RuntimeError:
            self._respond(500, {"error": "database error"})
            return
        self._respond(200, {
            "ok": True,
            "stripe_session_id": session_id,
            "url": session_url,
            "amount_cents": amount,
            "currency": "usd",
        })

    def _handle_webhook(self):
        ok, raw = self._read_body()
        if not ok:
            self._respond(413, {"error": "body too large"})
            return
        secret = os.environ.get("KEEL_STRIPE_WEBHOOK_SECRET", "")
        if not secret:
            sys.stderr.write("enroll: webhook refused: KEEL_STRIPE_WEBHOOK_SECRET not set\n")
            self._respond(503, {"error": "server misconfigured"})
            return
        try:
            tolerance = int(os.environ.get("KEEL_STRIPE_TOLERANCE_S", "300"))
        except ValueError:
            tolerance = 300
        header = self.headers.get("Stripe-Signature", "")
        if not verify_stripe_signature(raw, header, secret, tolerance):
            self._respond(400, {"error": "invalid signature"})
            return

        try:
            event = json.loads(raw)
        except ValueError:
            self._respond(400, {"error": "invalid JSON"})
            return
        if event.get("type") != "checkout.session.completed":
            # Stripe sends many event types to the same endpoint; ack the
            # ones we do not act on so they are not redelivered.
            self._respond(200, {"ok": True, "handled": False})
            return

        session = (event.get("data") or {}).get("object") or {}
        stripe_session_id = str(session.get("id") or "")
        if not stripe_session_id:
            self._respond(400, {"error": "event carries no session id"})
            return

        # Idempotent completion: the guarded UPDATE moves pending ->
        # completed at most once; enrollments UNIQUE (student_id, unit_id)
        # with ON CONFLICT DO NOTHING makes replayed completions no-ops; the
        # event is appended only when the enrollment row was newly inserted.
        sql = """BEGIN;
WITH upd AS (
    UPDATE checkout_sessions
    SET status = 'completed', completed_at = now()
    WHERE stripe_session_id = %s AND status = 'pending'
    RETURNING id
), ins AS (
    INSERT INTO enrollments (student_id, unit_id, checkout_session_id)
    SELECT student_id, unit_id, id FROM checkout_sessions
    WHERE stripe_session_id = %s
    ON CONFLICT (student_id, unit_id) DO NOTHING
    RETURNING id, student_id, unit_id
), ev AS (
    INSERT INTO events (type, payload)
    SELECT 'enrollment.activated',
           jsonb_build_object('student_id', student_id,
                              'unit_id', unit_id::text,
                              'stripe_session_id', %s::text)
    FROM ins RETURNING id
), bud AS (
    INSERT INTO budgets (student_id, tokens_cap, tokens_used)
    SELECT student_id, %d, 0 FROM ins
    ON CONFLICT (student_id) DO NOTHING
    RETURNING student_id
)
SELECT EXISTS (SELECT 1 FROM ins), EXISTS (SELECT 1 FROM upd);
COMMIT;
""" % (sql_str(stripe_session_id), sql_str(stripe_session_id),
       sql_str(stripe_session_id), default_budget_tokens())
        try:
            rows = db_sql(sql)
        except RuntimeError:
            self._respond(500, {"error": "database error"})
            return
        # psql prints booleans as t/f strings; compare explicitly so an "f"
        # (truthy as a Python string) is never mistaken for success.
        newly_enrolled, cs_updated = rows[0]

        if cs_updated != "t" and newly_enrolled != "t":
            # Not a session this service created (or already completed by an
            # earlier delivery AND already enrolled). Distinguish the first
            # case with a diagnostic event, mirroring intake.unknown_pusher;
            # already-completed replays are silent no-ops.
            rows2 = db_sql(
                "BEGIN;\n"
                "SELECT status FROM checkout_sessions\n"
                "WHERE stripe_session_id = %s;\n"
                "ROLLBACK;\n" % sql_str(stripe_session_id)
            )
            if not rows2:
                db_sql(
                    "BEGIN;\n"
                    "INSERT INTO events (type, payload) VALUES ("
                    "'enroll.unknown_checkout_session',"
                    "jsonb_build_object('stripe_session_id', %s::text));\n"
                    "COMMIT;\n" % sql_str(stripe_session_id),
                    want_rows=False,
                )
        self._respond(200, {
            "ok": True,
            "handled": True,
            "newly_enrolled": newly_enrolled == "t",
        })


def main():
    port = int(os.environ.get("KEEL_ENROLL_PORT", "8791"))
    if not app_token():
        sys.stderr.write("refusing to start: KEEL_ENROLL_SECRET not set\n")
        sys.exit(1)
    if not os.environ.get("KEEL_STRIPE_WEBHOOK_SECRET"):
        sys.stderr.write(
            "enroll: warning: KEEL_STRIPE_WEBHOOK_SECRET not set; "
            "webhook requests will be refused until it is\n"
        )
    # Fail fast on a bad KEEL_DB_CMD.
    db_sql("BEGIN;\nSELECT 1;\nROLLBACK;\n", want_rows=False)
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    sys.stderr.write("enroll listening on 127.0.0.1:%d\n" % port)
    server.serve_forever()


if __name__ == "__main__":
    main()
