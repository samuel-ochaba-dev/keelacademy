#!/usr/bin/env bash
# demo-practice.sh — S3.1 end-to-end proof: completion-problem practice grading loop.
#
# Modes:
#   setup     Scratch postgres (0001..0007), offline fake Stripe, enroll service,
#             reader service, practice service, and learner app under setsid.
#   prove     Drives real sign-up, payment, practice submission of base files (RED),
#             practice submission of worked-example files (GREEN), verifies attempt
#             history in rendered UI, verifies zero gate movement, and tests unenrolled student.
#   teardown  Stops daemons, cleans container and files.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
APP_DIR="$REPO_ROOT/platform/app"
ENROLL="$SCRIPT_DIR/../enroll/server.py"
FAKE="$SCRIPT_DIR/../enroll/fake_stripe.py"
READER="$SCRIPT_DIR/../reader/server.py"
PRACTICE="$SCRIPT_DIR/../practice/server.py"
ENGINE="$SCRIPT_DIR/../gates/engine.py"
MACHINE="$SCRIPT_DIR/../rebate/machine.py"

ROOT="/tmp/keel-practice-demo"
CONTAINER="keel-practice-demo-pg"
DB_USER="smoke"
DB_NAME="grading"
STATE_FILE="$ROOT/pids.env"

APP_TOKEN="demo-practice-app-token"
WHSEC="whsec_demo_practice_placeholder"
STRIPE_KEY="sk_test_placeholder_not_a_real_key"
AUTH_SECRET="demo-practice-offline-auth-secret"
PRICE_CENTS="1234"
REBATE_PCT="15"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    DOCKER="docker"
elif [ -x "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
    DOCKER="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
else
    echo "FAIL: no usable docker CLI found" >&2
    exit 1
fi

DB_CMD_PLAIN="$DOCKER exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME"

free_port() {
    python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()'
}

psql_sql() {
    "$DOCKER" exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -q -tA <<< "$1"
}

wait_http() {
    local timeout="${3:-120}" i
    for i in $(seq 1 "$((timeout * 2))"); do
        if curl -sf -o /dev/null --max-time 10 "$1"; then return 0; fi
        sleep 0.5
    done
    echo "FAIL: $2 never became ready at $1" >&2
    return 1
}

do_setup() {
    mkdir -p "$ROOT/logs"
    if [ -f "$STATE_FILE" ]; then
        # shellcheck disable=SC1090
        . "$STATE_FILE"
        local alive=1
        for pid in "${ENROLL_PID:-}" "${FAKE_PID:-}" "${READER_PID:-}" "${PRACTICE_PID:-}" "${APP_PID:-}"; do
            [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null || alive=0
        done
        if [ "$alive" = "1" ]; then
            echo "== demo already up (app :${APP_PORT}, enroll :${ENROLL_PORT}, reader :${READER_PORT}, practice :${PRACTICE_PORT}, fake stripe :${FAKE_PORT}) =="
            return 0
        fi
        do_teardown_inner
    fi

    local db_port enroll_port fake_port reader_port practice_port app_port
    db_port="$(free_port)"
    fake_port="$(free_port)"
    enroll_port="$(free_port)"
    reader_port="$(free_port)"
    practice_port="$(free_port)"
    app_port="$(free_port)"

    echo "== (1/6) starting postgres on 127.0.0.1:$db_port =="
    "$DOCKER" rm -f -v "$CONTAINER" >/dev/null 2>&1 || true
    "$DOCKER" run -d --name "$CONTAINER" \
        -e POSTGRES_USER="$DB_USER" \
        -e POSTGRES_PASSWORD=smoke \
        -e POSTGRES_DB="$DB_NAME" \
        -p "127.0.0.1:$db_port:5432" \
        postgres:16-alpine >/dev/null

    for i in $(seq 1 60); do
        if "$DOCKER" exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "select 1;" >/dev/null 2>&1; then
            break
        fi
        [ "$i" -eq 60 ] && { echo "FAIL: postgres timeout" >&2; exit 1; }
        sleep 0.5
    done

    for m in 0001_init 0002_intake 0003_budgets 0004_enrollments 0005_rebates 0006_gates 0007_practice; do
        "$DOCKER" exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 \
            < "$SCRIPT_DIR/../schema/$m.sql" >/dev/null
    done

    echo "== (2/6) starting fake stripe on 127.0.0.1:$fake_port =="
    ( exec env KEEL_FAKE_STRIPE_PORT="$fake_port" \
        KEEL_FAKE_STRIPE_WEBHOOK_URL="http://127.0.0.1:$enroll_port/webhook/stripe" \
        KEEL_FAKE_STRIPE_WEBHOOK_SECRET="$WHSEC" \
        setsid python3 "$FAKE" ) >> "$ROOT/logs/fake-stripe.log" 2>&1 < /dev/null &
    FAKE_PID=$!

    echo "== (3/6) starting enroll service on 127.0.0.1:$enroll_port =="
    ( exec env KEEL_ENROLL_PORT="$enroll_port" \
        KEEL_DB_CMD="$DB_CMD_PLAIN" \
        KEEL_ENROLL_SECRET="$APP_TOKEN" \
        KEEL_STRIPE_API_URL="http://127.0.0.1:$fake_port/v1" \
        STRIPE_SECRET_KEY="$STRIPE_KEY" \
        KEEL_STRIPE_WEBHOOK_SECRET="$WHSEC" \
        KEEL_PRICE_CENTS_3_2_1="$PRICE_CENTS" \
        KEEL_PRICE_CENTS_DEFAULT="$PRICE_CENTS" \
        KEEL_DEFAULT_BUDGET_TOKENS="5000" \
        setsid python3 "$ENROLL" ) >> "$ROOT/logs/enroll.log" 2>&1 < /dev/null &
    ENROLL_PID=$!

    echo "== (4/6) starting reader service on 127.0.0.1:$reader_port =="
    ( exec env KEEL_READER_PORT="$reader_port" \
        KEEL_DB_CMD="$DB_CMD_PLAIN" \
        setsid python3 "$READER" ) >> "$ROOT/logs/reader.log" 2>&1 < /dev/null &
    READER_PID=$!

    echo "== (5/6) starting practice grading service on 127.0.0.1:$practice_port =="
    ( exec env KEEL_PRACTICE_PORT="$practice_port" \
        KEEL_DB_CMD="$DB_CMD_PLAIN" \
        KEEL_ENROLL_SECRET="$APP_TOKEN" \
        KEEL_SANDBOX_IMAGE="keel-runner:0.1" \
        setsid python3 "$PRACTICE" ) >> "$ROOT/logs/practice.log" 2>&1 < /dev/null &
    PRACTICE_PID=$!

    echo "== (6/6) starting learner app on 127.0.0.1:$app_port =="
    ( cd "$APP_DIR" && exec env \
        KEEL_ENROLL_URL="http://127.0.0.1:$enroll_port" \
        KEEL_ENROLL_SECRET="$APP_TOKEN" \
        KEEL_READER_URL="http://127.0.0.1:$reader_port" \
        KEEL_PRACTICE_URL="http://127.0.0.1:$practice_port" \
        KEEL_OFFLINE_AUTH_SECRET="$AUTH_SECRET" \
        KEEL_OFFLINE_AUTH_STORE="$ROOT/offline-auth-store.json" \
        setsid ./node_modules/.bin/next dev -p "$app_port" -H 127.0.0.1 ) \
        >> "$ROOT/logs/app.log" 2>&1 < /dev/null &
    APP_PID=$!

    wait_http "http://127.0.0.1:$fake_port/__count" "fake stripe" || exit 1
    wait_http "http://127.0.0.1:$enroll_port/healthz" "enroll service" || exit 1
    wait_http "http://127.0.0.1:$reader_port/healthz" "reader" || exit 1
    wait_http "http://127.0.0.1:$practice_port/healthz" "practice service" || exit 1
    wait_http "http://127.0.0.1:$app_port/" "learner app" || exit 1

    cat > "$STATE_FILE" <<STATE
DB_PORT=$db_port
ENROLL_PORT=$enroll_port
FAKE_PORT=$fake_port
READER_PORT=$reader_port
PRACTICE_PORT=$practice_port
APP_PORT=$app_port
FAKE_PID=$FAKE_PID
ENROLL_PID=$ENROLL_PID
READER_PID=$READER_PID
PRACTICE_PID=$PRACTICE_PID
APP_PID=$APP_PID
STATE

    echo "== demo is UP (app :${app_port}, enroll :${enroll_port}, reader :${reader_port}, practice :${practice_port}) =="
}

PASS_COUNT=0
FAIL_COUNT=0

check() {
    local name="$1"; shift
    if ( "$@" ) >/dev/null 2>&1; then
        echo "  [PASS] $name"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "  [FAIL] $name" >&2
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

html_count() {
    local jar="$1" path="$2" needle="$3"
    if [ "$jar" = "-" ]; then
        curl -sf --max-time 30 "http://127.0.0.1:${APP_PORT}${path}"
    else
        curl -sf --max-time 30 -b "$jar" "http://127.0.0.1:${APP_PORT}${path}"
    fi | grep -oF "$needle" | wc -l
}

action_id() {
    python3 - "$1" <<'PYEOF'
import re, sys
html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
names = re.findall(r'name="(\$ACTION_ID_[0-9a-f]+)"', html)
if not names:
    sys.exit(1)
print(names[0])
PYEOF
}

post_action() {
    local jar="$1" path="$2"; shift 2
    local args=() kv
    for kv in "$@"; do args+=(-F "$kv"); done
    curl -s --max-time 30 -o /dev/null -w "%{http_code} %{redirect_url}" \
        -b "$jar" -c "$jar" -X POST "http://127.0.0.1:$APP_PORT$path" "${args[@]}"
}

signup() {
    local jar="$1" name="$2" email="$3"
    curl -sf --max-time 30 "http://127.0.0.1:$APP_PORT/sign-up" -o "$ROOT/su.html"
    local action pay
    action="$(action_id "$ROOT/su.html")" || return 1
    pay="$(post_action "$jar" /sign-up "$action=" "name=$name" "email=$email" "next=/units/3.2.1")"
    [ "${pay%% *}" = "303" ]
}

pay_enrollment() {
    local jar="$1"
    curl -sf --max-time 30 -b "$jar" "http://127.0.0.1:$APP_PORT/map" -o "$ROOT/map.html"
    local action resp pay_url
    action="$(action_id "$ROOT/map.html")" || return 1
    resp="$(post_action "$jar" /map "$action=" "unit_id=3.2.1")"
    pay_url="${resp#* }"
    [ "${resp%% *}" = "303" ] || return 1
    curl -s --max-time 30 -o /dev/null -w "%{http_code}" -X POST "$pay_url" | grep -q 302
}

student_id_by_email() {
    psql_sql "SELECT id FROM students WHERE email = '$1';"
}

do_prove() {
    do_setup
    # shellcheck disable=SC1090
    . "$STATE_FILE"
    APP="http://127.0.0.1:$APP_PORT"
    JAR_JESSE="$ROOT/jar-jesse.txt"
    JAR_KIM="$ROOT/jar-kim.txt"
    rm -f "$JAR_JESSE" "$JAR_KIM" "$ROOT"/*.html "$ROOT"/*.json 2>/dev/null || true

    echo
    echo "== proof 1: jesse signs up and views unit 3.2.1 practice section pre-payment =="
    if signup "$JAR_JESSE" "Jesse Okafor" "jesse@keel.test"; then
        check "jesse signs up via real form" true
    else
        check "jesse signs up via real form" false
    fi

    # Trigger lazy student bridge
    curl -sf --max-time 30 -b "$JAR_JESSE" "$APP/units/3.2.1" -o "$ROOT/unit-pre.html"
    JESSE_ID="$(student_id_by_email jesse@keel.test)"
    check "jesse has student row in database" [ -n "$JESSE_ID" ]

    check "practice workbench renders on unit 3.2.1" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "practice-workbench")" -ge 1

    check "pre-enrollment practice prompt visible" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "Active enrollment required to run checks.")" -ge 1

    echo
    echo "== proof 2: jesse pays for unit 3.2.1 -> practice workbench active =="
    check "jesse pays via fake checkout" pay_enrollment "$JAR_JESSE"
    check "enrollment activated in database" \
        test "$(psql_sql "SELECT count(*) FROM enrollments WHERE student_id=$JESSE_ID AND unit_id='3.2.1';")" = "1"

    curl -sf --max-time 30 -b "$JAR_JESSE" "$APP/units/3.2.1" -o "$ROOT/unit-post.html"
    check "post-enrollment practice workbench has run button" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "Run practice checks")" -ge 1
    check "whitelisted editable files tabs visible (schemas.py, extractor.py)" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "schemas.py")" -ge 1

    echo
    echo "== proof 3: submit base problem (unfilled) -> RED verdict rendered in UI =="
    # Read base files from content
    COMP_DIR="$REPO_ROOT/content/units/phase-3/3.2.1/completion"
    BASE_SCHEMAS="$(cat "$COMP_DIR/schemas.py")"
    BASE_EXTRACTOR="$(cat "$COMP_DIR/extractor.py")"

    # Build JSON payload
    python3 -c "
import json, sys
data = {
    'unit_id': '3.2.1',
    'files': {
        'schemas.py': open('$COMP_DIR/schemas.py').read(),
        'extractor.py': open('$COMP_DIR/extractor.py').read(),
    }
}
with open('$ROOT/sub-base.json', 'w') as f:
    json.dump(data, f)
"
    SUB1_CODE="$(curl -s --max-time 60 -b "$JAR_JESSE" -c "$JAR_JESSE" \
        -H "Content-Type: application/json" \
        -d @"$ROOT/sub-base.json" \
        -o "$ROOT/sub1-resp.json" \
        -w "%{http_code}" \
        "$APP/api/practice/attempt")"
    check "submitting base files returns HTTP 200" [ "$SUB1_CODE" = "200" ]

    check "sub1 result is fail (1 pass / 2 fail)" \
        python3 -c "
import json, sys
res = json.load(open('$ROOT/sub1-resp.json'))
assert res['passed'] is False
assert res['pass_count'] == 1
assert res['total_checks'] == 3
"
    check "attempt 1 recorded in database" \
        test "$(psql_sql "SELECT count(*) FROM practice_attempts WHERE student_id=$JESSE_ID;")" = "1"

    # Inspect rendered unit page HTML for attempt 1
    curl -sf --max-time 30 -b "$JAR_JESSE" "$APP/units/3.2.1" -o "$ROOT/unit-att1.html"
    check "rendered page shows attempt history" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "Practice attempt history (1)")" -ge 1
    check "rendered page shows 1 / 3 passing" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "1 / 3 passing")" -ge 1

    echo
    echo "== proof 4: submit worked-example solution (filled) -> GREEN verdict rendered in UI =="
    WE_DIR="$REPO_ROOT/content/units/phase-3/3.2.1/worked-example"
    python3 -c "
import json, sys
data = {
    'unit_id': '3.2.1',
    'files': {
        'schemas.py': open('$WE_DIR/schemas.py').read(),
        'extractor.py': open('$WE_DIR/extractor.py').read(),
    }
}
with open('$ROOT/sub-we.json', 'w') as f:
    json.dump(data, f)
"
    SUB2_CODE="$(curl -s --max-time 60 -b "$JAR_JESSE" -c "$JAR_JESSE" \
        -H "Content-Type: application/json" \
        -d @"$ROOT/sub-we.json" \
        -o "$ROOT/sub2-resp.json" \
        -w "%{http_code}" \
        "$APP/api/practice/attempt")"
    check "submitting worked-example files returns HTTP 200" [ "$SUB2_CODE" = "200" ]

    check "sub2 result is pass (3 pass / 0 fail)" \
        python3 -c "
import json, sys
res = json.load(open('$ROOT/sub2-resp.json'))
assert res['passed'] is True
assert res['pass_count'] == 3
assert res['total_checks'] == 3
"
    check "attempt 2 recorded in database (2 total attempts)" \
        test "$(psql_sql "SELECT count(*) FROM practice_attempts WHERE student_id=$JESSE_ID;")" = "2"

    curl -sf --max-time 30 -b "$JAR_JESSE" "$APP/units/3.2.1" -o "$ROOT/unit-att2.html"
    check "rendered page shows attempt history of 2 attempts" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "Practice attempt history (2)")" -ge 1
    check "rendered page shows passing attempt in history" \
        test "$(html_count "$JAR_JESSE" /units/3.2.1 "3 / 3 passing")" -ge 1

    echo
    echo "== proof 5: practice events do not unlock units or earn rebates =="
    check "/map still shows 0 / 2 gates cleared" \
        test "$(html_count "$JAR_JESSE" /map "0 / 2")" -ge 1
    check "unlocked_units table has zero rows for jesse" \
        test "$(psql_sql "SELECT count(*) FROM unlocked_units WHERE student_id=$JESSE_ID;")" = "0"
    check "rebates table has zero earned rebates for jesse" \
        test "$(psql_sql "SELECT count(*) FROM rebates WHERE student_id=$JESSE_ID AND status='earned';")" = "0"

    echo
    echo "== proof 6: unenrolled student (Kim) cannot submit practice checks =="
    if signup "$JAR_KIM" "Kim Alvarez" "kim@keel.test"; then
        check "kim signs up without payment" true
    else
        check "kim signs up without payment" false
    fi

    # Trigger bridge
    curl -sf --max-time 30 -b "$JAR_KIM" "$APP/units/3.2.1" -o /dev/null
    KIM_ID="$(student_id_by_email kim@keel.test)"

    KIM_SUB_CODE="$(curl -s --max-time 30 -b "$JAR_KIM" -c "$JAR_KIM" \
        -H "Content-Type: application/json" \
        -d @"$ROOT/sub-we.json" \
        -w "%{http_code}" \
        -o /dev/null \
        "$APP/api/practice/attempt")"
    check "unenrolled kim attempt rejected with HTTP 403" [ "$KIM_SUB_CODE" = "403" ]
    check "kim has zero rows in practice_attempts" \
        test "$(psql_sql "SELECT count(*) FROM practice_attempts WHERE student_id=$KIM_ID;")" = "0"

    echo
    echo "== practice demo summary: $PASS_COUNT passed, $FAIL_COUNT failed =="
    [ "$FAIL_COUNT" -eq 0 ] || exit 1
}

do_teardown_inner() {
    # shellcheck disable=SC1090
    [ -f "$STATE_FILE" ] && . "$STATE_FILE"
    for pid in "${APP_PID:-}" "${PRACTICE_PID:-}" "${READER_PID:-}" "${ENROLL_PID:-}" "${FAKE_PID:-}"; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            kill -TERM -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
        fi
    done
    sleep 1
    "$DOCKER" rm -f -v "$CONTAINER" >/dev/null 2>&1 || true
    rm -rf "$ROOT"
}

do_teardown() {
    do_teardown_inner
    if pgrep -f "enroll/server.py|fake_stripe.py|reader/server.py|practice/server.py" >/dev/null 2>&1 \
        || pgrep -f "node_modules/.bin/next dev" >/dev/null 2>&1; then
        echo "FAIL: demo daemons survived the kill" >&2
        pgrep -af "enroll/server.py|fake_stripe.py|reader/server.py|practice/server.py|node_modules/.bin/next dev" >&2 || true
        exit 1
    fi
    echo "== practice demo torn down; containers, dirs and daemons gone =="
}

case "${1:-}" in
    setup) do_setup ;;
    prove) do_prove ;;
    teardown) do_teardown ;;
    *) echo "usage: $0 {setup|prove|teardown}" >&2; exit 2 ;;
esac
