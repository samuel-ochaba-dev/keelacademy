#!/usr/bin/env python3
"""practice/server.py — completion problem & retrieval drill practice grading service (S3.1, S3.2, S3.3).

Exposes:
1. Fast, deterministic, sandboxed Layer-1 grading for completion problems (S3.1)
   without LLM judge calls or budget consumption.
2. Layer-2 judge grading for free-recall retrieval drills (S3.2) routed through
   the LLM proxy with per-student budgets, trace logging, and prompt-injection defense.
3. Spaced re-check scheduling (S3.3): passed retrieval seeds come back as due
   re-checks at +3 days, then +7 days, then retire. The schedule is DERIVED at
   read time from retrieval_attempts (no new table, no daemon). Deterministic
   clock knobs KEEL_PRACTICE_NOW / KEEL_PRACTICE_NOW_FILE exist for proofs;
   production leaves both unset.
4. Drill token economics (S3.3): the judge prompt carries a deterministic
   excerpt of the lesson (stdlib-only heading/keyword section scoring under a
   char budget, KEEL_RETRIEVAL_EXCERPT_CHARS; <=0 restores the full lesson)
   instead of the full lesson text. The excerpt header (chars sent, sections
   chosen) is embedded in the prompt itself, so every trace record is
   cost-auditable.

The learner app calls this service from server components / actions using the shared
app token (KEEL_ENROLL_SECRET).

Routes:
    GET  /healthz                                         -> {"ok": true}
    GET  /practice/manifest?unit=<id>                     -> completion manifest
    POST /practice/attempt                                -> stage base + student files -> sandbox grade -> persist
    GET  /practice/attempts?student_id=<id>&unit=<id>     -> student completion attempt history
    GET  /practice/retrieval/seeds?unit=<id>              -> authored retrieval seeds (v1 deterministic)
    POST /practice/retrieval/attempt                      -> grade retrieval answer via LLM proxy judge -> persist
    GET  /practice/retrieval/attempts?student_id=<id>&unit=<id> -> student retrieval attempt history
    GET  /practice/retrieval/schedule?student_id=<id>[&unit=<id>] -> derived spaced re-check schedule (S3.3)
    GET  /practice/route?student_id=<id>&unit=<id>        -> derived adaptive practice route (S3.4)

Security & Boundaries:
    - Auth: X-Keel-App-Token header matched to env KEEL_ENROLL_SECRET.
    - Enrollment Gate: Only students with an ACTIVE enrollment for the unit may attempt.
    - Whitelisting (completion): Only files in the unit's editable_files whitelist are accepted.
    - Budget Gate (retrieval): Grader routes through the platform proxy; 429 budget_exceeded
      declines the drill BEFORE any model call and writes zero attempt rows.
    - Untrusted code execution: Sandbox only (Docker via platform/grading/layer1.py).
    - Untrusted answers: Quoted as data, anti-injection prompt defense applied.
    - DB Access: Env KEEL_DB_CMD via shared db.py; attempt rows + spine events
      (practice.attempt_graded, practice.retrieval_graded) commit in atomic transactions.
"""

from __future__ import annotations

import hmac
import json
import os
import re
import shutil
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import yaml

# Add grading dir to sys.path to import shared modules (db, layer1)
GRADING_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(GRADING_DIR))
from db import db_sql, sql_str
import layer1

MAX_BODY_BYTES = 1 * 1024 * 1024       # 1 MB total request body cap
MAX_FILE_BYTES = 128 * 1024             # 128 KB per individual file/answer cap
MAX_FILENAME_LEN = 128
UNIT_RE = re.compile(r"^\d+\.\d+\.\d+$")
FILENAME_RE = re.compile(r"^[A-Za-z0-9_.-]+$")
DEFAULT_TIMEOUT_S = 60

MODEL_PRICES = {
    "gpt-4o-mini": {"price_in": 0.15, "price_out": 0.60},
    "gpt-4.1": {"price_in": 2.00, "price_out": 8.00},
    "o3": {"price_in": 2.00, "price_out": 8.00},
}

NUDGE_MSG = (
    "Your previous reply was not valid JSON. Return ONLY a single JSON object "
    "conforming to the schema from the original prompt — no markdown fences, "
    "no commentary before or after."
)


class BudgetExceeded(Exception):
    """The proxy answered 429 budget_exceeded."""
    pass


class UpstreamError(Exception):
    """Network, connection, or upstream failure."""
    pass


class MalformedJudgeError(Exception):
    """Judge returned malformed JSON twice."""
    pass


def app_token() -> str:
    return os.environ.get("KEEL_ENROLL_SECRET", "")


def content_root() -> Path:
    return layer1.content_root()


def get_unit_practice_manifest(unit_id: str) -> dict[str, Any] | None:
    """Read completion problem manifest from content repo for unit_id."""
    root = content_root()
    matches = sorted(root.glob(f"units/*/{unit_id}/unit.yaml"))
    if not matches:
        return None
    unit_yaml_path = matches[0]
    try:
        unit_data = yaml.safe_load(unit_yaml_path.read_text(encoding="utf-8"))
    except Exception:
        return None

    practice = unit_data.get("practice") or {}
    completion = practice.get("completion_problem")
    if not isinstance(completion, dict):
        return None

    base_rel = completion.get("base")
    checks_rel = completion.get("checks")
    if not base_rel or not checks_rel:
        return None

    base_dir = root / base_rel
    checks_path = root / checks_rel
    if not base_dir.is_dir() or not checks_path.is_file():
        return None

    readme_path = base_dir / "README.md"
    readme_md = readme_path.read_text(encoding="utf-8") if readme_path.is_file() else ""

    # Read base files, skipping cache and hidden entries
    base_files: dict[str, str] = {}
    for entry in sorted(base_dir.iterdir()):
        if entry.is_file() and not entry.name.startswith("."):
            try:
                base_files[entry.name] = entry.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue

    # Determine editable files by looking for GAP markers in base files
    editable_files: list[str] = []
    for fname, content in base_files.items():
        if fname.endswith(".py") and re.search(r"#\s*GAP\s+\d+", content):
            editable_files.append(fname)
    if not editable_files:
        for fname in base_files:
            if fname.endswith(".py") and not fname.startswith("test_") and fname not in ("llm.py", "notes.py"):
                editable_files.append(fname)
    editable_files.sort()

    try:
        checks_data = yaml.safe_load(checks_path.read_text(encoding="utf-8"))
        if not isinstance(checks_data, list):
            checks_data = []
    except Exception:
        checks_data = []

    check_descriptors = [
        {"id": c.get("id"), "type": c.get("type")}
        for c in checks_data if isinstance(c, dict) and "id" in c
    ]

    return {
        "unit_id": unit_id,
        "base_rel": base_rel.rstrip("/") + "/",
        "readme_markdown": readme_md,
        "base_files": base_files,
        "editable_files": editable_files,
        "checks": check_descriptors,
        "checks_path": checks_path,
        "base_dir": base_dir,
    }


def get_unit_retrieval_seeds(unit_id: str) -> list[str]:
    """Read authored retrieval seeds from unit.yaml in content repo."""
    root = content_root()
    matches = sorted(root.glob(f"units/*/{unit_id}/unit.yaml"))
    if not matches:
        return []
    try:
        unit_data = yaml.safe_load(matches[0].read_text(encoding="utf-8"))
        seeds = (unit_data.get("practice") or {}).get("retrieval_seeds") or []
        if isinstance(seeds, list):
            return [str(s) for s in seeds if s]
        return []
    except Exception:
        return []


def get_unit_learn_text(unit_id: str) -> str:
    """Read lesson markdown for unit_id from content repo."""
    root = content_root()
    matches = sorted(root.glob(f"units/*/{unit_id}/unit.yaml"))
    if not matches:
        raise RuntimeError(f"unit {unit_id} not found in content repository")
    try:
        unit_data = yaml.safe_load(matches[0].read_text(encoding="utf-8"))
    except Exception as exc:
        raise RuntimeError(f"failed to parse unit.yaml for {unit_id}: {exc}") from exc
    learn_rel = unit_data.get("learn")
    if not learn_rel:
        raise RuntimeError(f"learn path not declared for unit {unit_id}")
    learn_path = root / learn_rel
    if not learn_path.is_file():
        raise RuntimeError(f"learn file not found: {learn_rel}")
    return learn_path.read_text(encoding="utf-8")


def get_retrieval_prompt_text(unit_id: str) -> str:
    """Read retrieval judge prompt template from content/prompts/."""
    root = content_root()
    prompts_dir = root / "prompts"
    unit_prompt = prompts_dir / f"retrieval-{unit_id}.md"
    general_prompt = prompts_dir / "retrieval-grade.md"
    if unit_prompt.is_file():
        return unit_prompt.read_text(encoding="utf-8")
    if general_prompt.is_file():
        return general_prompt.read_text(encoding="utf-8")
    raise RuntimeError(f"retrieval judge prompt not found in {prompts_dir}")


# --------------------------------------------------------------------------
# S3.3 — deterministic clock (spaced re-check proofs)
# --------------------------------------------------------------------------

def practice_now() -> datetime:
    """Current instant for the re-check scheduler.

    KEEL_PRACTICE_NOW (ISO 8601) fixes 'now' for the whole process;
    KEEL_PRACTICE_NOW_FILE points at a file whose contents are re-read on
    every call so proofs can advance the clock without restarting daemons.
    Production leaves both unset and gets the wall clock.
    """
    raw = os.environ.get("KEEL_PRACTICE_NOW", "").strip()
    if not raw:
        fpath = os.environ.get("KEEL_PRACTICE_NOW_FILE", "").strip()
        if fpath:
            try:
                raw = Path(fpath).read_text(encoding="utf-8").strip()
            except OSError:
                raw = ""
    if not raw:
        return datetime.now(timezone.utc)
    parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def practice_now_override() -> datetime | None:
    """practice_now() when a deterministic clock knob is set, else None.

    None means production mode: persistence uses the database's now().
    """
    if os.environ.get("KEEL_PRACTICE_NOW", "").strip():
        return practice_now()
    fpath = os.environ.get("KEEL_PRACTICE_NOW_FILE", "").strip()
    if fpath and Path(fpath).is_file():
        return practice_now()
    return None


# --------------------------------------------------------------------------
# S3.3 — spaced re-check schedule (derived from retrieval_attempts)
# --------------------------------------------------------------------------

# Interval after the stage-1 pass, then after the stage-2 pass. A pass at
# stage 2 retires the seed. Only a pass AT OR AFTER the due instant advances
# the stage; failing a re-check changes nothing (the seed stays due).
RECHECK_INTERVALS = (timedelta(days=3), timedelta(days=7))


def fold_seed_schedule(attempts: list[tuple[bool, datetime]], now: datetime) -> dict[str, Any]:
    """Fold one seed's chronological (passed, created_at) history into a state.

    Returns dict with stage (0=unstarted, 1=first re-check upcoming/due,
    2=second re-check upcoming/due, 3=retired), last_pass_at (the last
    stage-advancing pass), due_at, and status
    ('unstarted' | 'upcoming' | 'due' | 'retired').
    """
    stage = 0
    anchor: datetime | None = None
    for passed, created_at in attempts:
        if not passed:
            continue
        if stage == 0:
            stage = 1
            anchor = created_at
        elif stage == 1 and created_at >= anchor + RECHECK_INTERVALS[0]:
            stage = 2
            anchor = created_at
        elif stage == 2 and created_at >= anchor + RECHECK_INTERVALS[1]:
            stage = 3
            anchor = created_at
    if stage == 0 or anchor is None:
        return {"stage": 0, "status": "unstarted", "last_pass_at": None, "due_at": None}
    if stage >= 3:
        return {"stage": 3, "status": "retired", "last_pass_at": anchor, "due_at": None}
    due_at = anchor + RECHECK_INTERVALS[stage - 1]
    status = "due" if now >= due_at else "upcoming"
    return {"stage": stage, "status": status, "last_pass_at": anchor, "due_at": due_at}


# --------------------------------------------------------------------------
# S3.3 — drill token economics: deterministic lesson excerpting
# --------------------------------------------------------------------------

EXCERPT_DEFAULT_CHARS = 3000

_EXCERPT_STOPWORDS = frozenset({
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "by",
    "is", "are", "was", "were", "be", "been", "being", "it", "its", "this",
    "that", "these", "those", "you", "your", "yours", "we", "our", "they",
    "their", "how", "what", "why", "when", "where", "which", "who", "whom",
    "can", "cannot", "could", "should", "would", "do", "does", "did", "not",
    "no", "as", "at", "from", "into", "over", "under", "than", "then", "so",
    "such", "if", "but", "about", "through", "during", "before", "after",
    "above", "below", "up", "down", "out", "off", "again", "once", "here",
    "there", "all", "any", "both", "each", "few", "more", "most", "other",
    "some", "only", "own", "same", "too", "very", "just", "because", "until",
    "while", "versus", "vs", "difference", "between",
})

_HEADING_RE = re.compile(r"^#{1,6}\s+(.*\S)\s*$")


def excerpt_char_budget() -> int:
    """Char budget for the lesson excerpt. <=0 disables excerpting (full lesson)."""
    raw = os.environ.get("KEEL_RETRIEVAL_EXCERPT_CHARS", "").strip()
    if not raw:
        return EXCERPT_DEFAULT_CHARS
    try:
        return int(raw)
    except ValueError:
        return EXCERPT_DEFAULT_CHARS


_FENCE_RE = re.compile(r"^\s*(```|~~~)")


def split_lesson_sections(markdown_text: str) -> list[dict[str, Any]]:
    """Split lesson markdown into heading-anchored sections, in document order.

    Any preamble before the first heading becomes a section with an empty
    heading. Lines inside fenced code blocks are never headings (Python
    comments start with '#'). Stdlib only; no model calls; same result for
    every student.
    """
    sections: list[dict[str, Any]] = []
    heading = ""
    lines: list[str] = []
    in_fence = False
    for line in markdown_text.splitlines():
        if _FENCE_RE.match(line):
            in_fence = not in_fence
            lines.append(line)
            continue
        m = None if in_fence else _HEADING_RE.match(line)
        if m:
            if lines or heading:
                sections.append({"heading": heading, "body": "\n".join(lines).strip()})
            heading = m.group(1).strip()
            lines = []
        else:
            lines.append(line)
    if lines or heading:
        sections.append({"heading": heading, "body": "\n".join(lines).strip()})
    return sections


def _seed_keywords(seed_prompt: str) -> list[str]:
    words = re.findall(r"[a-z0-9]+", seed_prompt.lower())
    return [w for w in words if len(w) >= 3 and w not in _EXCERPT_STOPWORDS]


def _count_keyword(text: str, keyword: str) -> int:
    return len(re.findall(r"(?<![a-z0-9])" + re.escape(keyword) + r"(?![a-z0-9])", text.lower()))


def _render_section(sec: dict[str, Any]) -> str:
    if sec["heading"]:
        return ("## " + sec["heading"] + "\n\n" + sec["body"]).strip()
    return sec["body"]


def select_lesson_excerpt(lesson_text: str, seed_prompt: str, budget: int) -> tuple[str, list[str]]:
    """Pick the lesson sections most relevant to the seed under a char budget.

    Deterministic: heading/keyword scoring (heading hits weigh 5x body hits),
    ties broken by document order, chosen sections re-emitted in document
    order. If nothing scores, sections are taken in document order. At least
    one section is always returned (truncated to the budget if needed).
    Returns (excerpt_text, chosen_heading_names).
    """
    sections = split_lesson_sections(lesson_text)
    if not sections:
        return lesson_text[:budget], []
    keywords = _seed_keywords(seed_prompt)
    scored = []
    for order, sec in enumerate(sections):
        distinct = 0
        total = 0
        for kw in keywords:
            hits = 5 * _count_keyword(sec["heading"], kw) + _count_keyword(sec["body"], kw)
            if hits:
                distinct += 1
                total += hits
        # Coverage first: a section touching more distinct seed concepts beats
        # one repeating a single common word (e.g. 'output' in code comments).
        scored.append({"order": order, "sec": sec, "distinct": distinct, "total": total})
    if all(s["distinct"] == 0 for s in scored):
        ranked = sorted(scored, key=lambda s: s["order"])
    else:
        ranked = sorted(scored, key=lambda s: (-s["distinct"], -s["total"], s["order"]))
    chosen: list[tuple[int, str, str]] = []  # (order, rendered_text, heading)
    used = 0
    for cand in ranked:
        text = _render_section(cand["sec"])
        if not chosen:
            if len(text) > budget:
                text = text[: max(0, budget - 6)].rstrip() + "\n[...]"
            chosen.append((cand["order"], text, cand["sec"]["heading"]))
            used = len(text)
            continue
        if used + len(text) + 2 > budget:
            continue
        chosen.append((cand["order"], text, cand["sec"]["heading"]))
        used += len(text) + 2
    chosen.sort(key=lambda c: c[0])
    excerpt = "\n\n".join(c[1] for c in chosen)
    headings = [c[2] for c in chosen if c[2]]
    return excerpt, headings


# --------------------------------------------------------------------------
# S3.4 — adaptive routing: scaffold deep links & derived route state
# --------------------------------------------------------------------------

def get_unit_routing_rules(unit_id: str) -> dict[str, Any] | None:
    """Read unit routing rules from content repo (content/routing/<unit_id>.yaml)."""
    root = content_root()
    matches = sorted(root.glob(f"routing/{unit_id}.yaml"))
    if not matches:
        return None
    try:
        return yaml.safe_load(matches[0].read_text(encoding="utf-8"))
    except Exception:
        return None


def get_unit_worked_example_scaffold_target(unit_id: str, query: str) -> dict[str, Any]:
    """Map a query (failed seed or completion failure) to a specific worked example target.

    Generalizes the deterministic keyword scoring over the worked example directory:
    README design decisions and individual code files. Heading/title hits weigh 5x body hits.
    Ties broken by document order. Stdlib-only, same result for every student.
    """
    root = content_root()
    matches = sorted(root.glob(f"units/*/{unit_id}/unit.yaml"))
    default_target = {
        "target_file": "worked-example",
        "target_section": "Annotated worked example",
        "anchor": "worked-example",
        "url": f"/units/{unit_id}#worked-example",
        "summary": "Review the worked example reference solution.",
        "action_label": "Review worked example",
    }
    if not matches:
        return default_target
    try:
        unit_data = yaml.safe_load(matches[0].read_text(encoding="utf-8"))
    except Exception:
        return default_target

    we_rel = (unit_data.get("practice") or {}).get("worked_example")
    if not we_rel:
        return default_target
    we_dir = root / we_rel
    if not we_dir.is_dir():
        return default_target

    targets: list[dict[str, Any]] = []
    order = 0

    # README design decisions
    readme_path = we_dir / "README.md"
    if readme_path.is_file():
        try:
            readme_text = readme_path.read_text(encoding="utf-8")
            decisions = re.findall(r"(\d+\.\s+\*\*([^*]+)\*\*\.?\s*([^\n]+(?:\n[^\n\d]+)*))", readme_text)
            for full, title, body in decisions:
                clean_title = title.strip().rstrip(".")
                targets.append({
                    "order": order,
                    "target_file": "README.md",
                    "target_section": f"Design decision: {clean_title}",
                    "anchor": "worked-example",
                    "title": f"Design decision {clean_title}",
                    "text": f"{clean_title}\n{body}",
                    "summary": f'Study design decision "{clean_title}" in the worked example README.',
                    "action_label": "Review scaffold and retry drill",
                })
                order += 1
        except Exception:
            pass

    # Code files
    for p in sorted(we_dir.iterdir()):
        if p.is_file() and not p.name.startswith("."):
            try:
                content = p.read_text(encoding="utf-8")
            except Exception:
                continue
            if p.name == "schemas.py":
                desc = "InvoiceExtraction schema contract in schemas.py"
                summary = "Study the Pydantic schema contract and JSON Schema derivation in schemas.py."
            elif p.name == "extractor.py":
                desc = "Extraction pipeline and fallback handling in extractor.py"
                summary = "Study the extraction pipeline, error validation, and fallback object construction in extractor.py."
            elif p.name == "llm.py":
                desc = "Constrained generation adapter in llm.py"
                summary = "Study the provider adapter, structured output guarantees, and JSON formatting in llm.py."
            elif p.name == "test_extractor.py":
                desc = "Property tests and verification in test_extractor.py"
                summary = "Study the test assertions for conservation and fallback logging in test_extractor.py."
            elif p.name == "README.md":
                desc = "Worked example overview in README.md"
                summary = "Review the worked example overview and parallel task structure in README.md."
            else:
                desc = f"Reference file {p.name}"
                summary = f"Study {p.name} in the worked example."

            targets.append({
                "order": order,
                "target_file": p.name,
                "target_section": desc,
                "anchor": "worked-example",
                "title": f"{p.name} {desc}",
                "text": content,
                "summary": summary,
                "action_label": "Review scaffold and retry drill",
            })
            order += 1

    if not targets:
        return default_target

    keywords = _seed_keywords(query)
    scored = []
    for t in targets:
        distinct = 0
        total = 0
        for kw in keywords:
            hits = 5 * _count_keyword(t["title"], kw) + _count_keyword(t["text"], kw)
            if hits:
                distinct += 1
                total += hits
        scored.append({"order": t["order"], "distinct": distinct, "total": total, "target": t})

    ranked = sorted(scored, key=lambda s: (-s["distinct"], -s["total"], s["order"]))
    best = ranked[0]["target"] if ranked else targets[0]
    return {
        "target_file": best["target_file"],
        "target_section": best["target_section"],
        "anchor": best["anchor"],
        "url": f"/units/{unit_id}#{best['anchor']}",
        "summary": best["summary"],
        "action_label": best["action_label"],
    }


def get_unit_scaffold_mapping(unit_id: str) -> list[dict[str, Any]]:
    """Get complete scaffold deep link mapping for all retrieval seeds in unit."""
    seeds = get_unit_retrieval_seeds(unit_id)
    mapping = []
    for idx, seed_prompt in enumerate(seeds):
        target = get_unit_worked_example_scaffold_target(unit_id, seed_prompt)
        mapping.append({
            "seed_index": idx,
            "seed_prompt": seed_prompt,
            "target_file": target["target_file"],
            "target_section": target["target_section"],
            "anchor": target["anchor"],
            "url": target["url"],
            "summary": target["summary"],
        })
    return mapping


def derive_unit_practice_route(
    student_id: int,
    unit_id: str,
    is_enrolled: bool,
    retrieval_attempts: list[dict[str, Any]],
    practice_attempts: list[dict[str, Any]],
    seeds: list[str],
    rules: dict[str, Any],
) -> dict[str, Any]:
    """Derive adaptive practice route purely from attempt history (S3.4).

    Honest, side-effect-free, idempotent.
    v1 independence rule: S3.3 spaced re-check due-ness does NOT alter routing
    (keys on pass/fail history only).
    """
    if not is_enrolled:
        return {
            "student_id": student_id,
            "unit_id": unit_id,
            "enrolled": False,
            "status": "unenrolled",
            "recommended_step": None,
            "fast_pass_eligible": False,
            "fast_pass_active": False,
            "scaffold_active": False,
            "summary": "Active enrollment required to view practice route.",
            "steps": [],
            "scaffold_callout": None,
            "scaffold_mapping": [],
        }

    total_seeds = len(seeds)
    seed_history: dict[int, list[bool]] = {i: [] for i in range(total_seeds)}
    for att in retrieval_attempts:
        idx = att.get("seed_index")
        if isinstance(idx, int) and idx in seed_history:
            seed_history[idx].append(bool(att.get("passed", False)))

    passed_seeds: set[int] = set()
    failed_seeds_ever: set[int] = set()
    active_failed_seeds: list[int] = []

    for idx in range(total_seeds):
        history = seed_history[idx]
        has_pass = any(history)
        has_fail = any(not p for p in history)
        if has_pass:
            passed_seeds.add(idx)
        if has_fail:
            failed_seeds_ever.add(idx)
        if has_fail and not has_pass:
            active_failed_seeds.append(idx)

    seeds_passed_count = len(passed_seeds)
    all_seeds_passed = (seeds_passed_count == total_seeds) and total_seeds > 0

    # Fast pass rule (v1): all retrieval seeds passed on first try with no prior failures
    clean_first_try_sweep = all_seeds_passed and (len(failed_seeds_ever) == 0)
    fast_pass_eligible = (len(failed_seeds_ever) == 0)
    fast_pass_active = clean_first_try_sweep

    # Completion problem attempts
    comp_has_pass = any(bool(p.get("passed", False)) for p in practice_attempts)
    comp_has_fail = any(not bool(p.get("passed", False)) for p in practice_attempts)
    comp_latest_failed = len(practice_attempts) > 0 and not comp_has_pass

    # Scaffold remedial condition
    scaffold_active = False
    scaffold_callout: dict[str, Any] | None = None

    if len(active_failed_seeds) > 0:
        scaffold_active = True
        target_seed_idx = active_failed_seeds[-1]
        seed_prompt = seeds[target_seed_idx]
        target_info = get_unit_worked_example_scaffold_target(unit_id, seed_prompt)
        scaffold_callout = {
            "type": "drill_retry",
            "seed_index": target_seed_idx,
            "seed_prompt": seed_prompt,
            "target_file": target_info["target_file"],
            "target_section": target_info["target_section"],
            "anchor": target_info["anchor"],
            "url": target_info["url"],
            "summary": f"Retrieval drill #{target_seed_idx + 1} did not pass. Study {target_info['target_file']} before retrying.",
            "action_label": "Review scaffold and retry drill",
        }
    elif comp_latest_failed:
        scaffold_active = True
        target_info = get_unit_worked_example_scaffold_target(unit_id, "completion problem gap tests failed schemas.py extractor.py fallback")
        scaffold_callout = {
            "type": "completion_retry",
            "target_file": target_info["target_file"],
            "target_section": target_info["target_section"],
            "anchor": target_info["anchor"],
            "url": target_info["url"],
            "summary": f"Completion problem checks did not pass. Study {target_info['target_file']} before retrying.",
            "action_label": "Review scaffold and retry workbench",
        }

    # Step statuses
    # 1. Lesson
    step_lesson_status = "done"
    step_lesson_summary = "Lesson concepts available for review."

    # 2. Retrieval
    if all_seeds_passed:
        step_retrieval_status = "done"
        step_retrieval_summary = f"All {total_seeds} retrieval checkpoints cleared."
    elif len(active_failed_seeds) > 0:
        step_retrieval_status = "retry"
        step_retrieval_summary = f"{seeds_passed_count} of {total_seeds} seeds cleared. Drill #{active_failed_seeds[-1] + 1} requires review."
    else:
        step_retrieval_status = "current"
        step_retrieval_summary = f"{seeds_passed_count} of {total_seeds} retrieval checkpoints cleared."

    # 3. Worked example
    if comp_has_pass:
        step_we_status = "optional" if fast_pass_active else "done"
        step_we_summary = "Worked example completed." if not fast_pass_active else "Optional via fast pass."
    elif scaffold_active:
        step_we_status = "scaffold"
        step_we_summary = "Recommended scaffold review for current failure."
    elif fast_pass_active:
        step_we_status = "optional"
        step_we_summary = "Optional: fast pass achieved via clean retrieval sweep."
    elif all_seeds_passed:
        step_we_status = "current"
        step_we_summary = "Recommended study before attempting the completion problem."
    else:
        step_we_status = "upcoming"
        step_we_summary = "Recommended sequence after retrieval drills."

    # 4. Completion
    if comp_has_pass:
        step_comp_status = "done"
        step_comp_summary = "Completion problem checks passed."
    elif comp_latest_failed:
        step_comp_status = "retry"
        step_comp_summary = "Checks failed. Review scaffold and retry."
    elif fast_pass_active:
        step_comp_status = "current"
        step_comp_summary = "Current recommended action: solve completion problem."
    elif all_seeds_passed:
        step_comp_status = "upcoming"
        step_comp_summary = "Workbench available after reviewing worked example."
    else:
        step_comp_status = "upcoming"
        step_comp_summary = "Workbench available after retrieval drills."

    steps = [
        {"id": "lesson", "title": "Study the lesson", "type": "concept", "status": step_lesson_status, "summary": step_lesson_summary},
        {"id": "retrieval", "title": "Retrieval drills", "type": "drill", "status": step_retrieval_status, "passed_count": seeds_passed_count, "total_count": total_seeds, "summary": step_retrieval_summary},
        {"id": "worked_example", "title": "Annotated worked example", "type": "scaffold", "status": step_we_status, "summary": step_we_summary},
        {"id": "completion", "title": "Completion problem workbench", "type": "workbench", "status": step_comp_status, "summary": step_comp_summary},
    ]

    # Overall route status & recommendation
    if comp_has_pass:
        status = "completed"
        recommended_step = "build"
        summary = "Practice route complete. You are ready to start the Build deliverable."
    elif scaffold_active:
        status = "scaffold_active"
        recommended_step = "worked_example"
        summary = scaffold_callout["summary"] if scaffold_callout else "Review the worked example scaffold before retrying."
    elif fast_pass_active:
        status = "fast_pass"
        recommended_step = "completion"
        summary = "All retrieval drills cleared on first attempt. Worked example is optional. Recommended next: solve the completion problem."
    elif all_seeds_passed:
        status = "standard"
        recommended_step = "worked_example"
        summary = "Retrieval drills cleared. Recommended next: study the worked example before attempting the completion problem."
    else:
        status = "in_progress"
        recommended_step = "retrieval"
        summary = f"Recommended next: complete retrieval drills ({seeds_passed_count} of {total_seeds} cleared)."

    return {
        "student_id": student_id,
        "unit_id": unit_id,
        "enrolled": True,
        "status": status,
        "recommended_step": recommended_step,
        "fast_pass_eligible": fast_pass_eligible,
        "fast_pass_active": fast_pass_active,
        "scaffold_active": scaffold_active,
        "summary": summary,
        "steps": steps,
        "scaffold_callout": scaffold_callout,
        "scaffold_mapping": get_unit_scaffold_mapping(unit_id),
    }


def _estimate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    tier = next(
        (v for k, v in MODEL_PRICES.items() if model == k or model.startswith(k + "-")),
        {"price_in": 0.15, "price_out": 0.60},
    )
    return (prompt_tokens * tier["price_in"] + completion_tokens * tier["price_out"]) / 1_000_000


def _append_trace(record: dict[str, Any]) -> None:
    dest_str = os.environ.get("KEEL_TRACE_LOG")
    if dest_str is not None:
        dest_str = dest_str.strip()
        if not dest_str or dest_str.lower() == "off":
            return
        dest_path = Path(dest_str)
    else:
        dest_path = Path.home() / ".keelacademy-traces.jsonl"
    try:
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(dest_path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as exc:
        sys.stderr.write(f"[trace] warning: failed to write trace record: {exc}\n")


def _log_trace_call(
    call_id: str,
    attempt: int,
    model: str,
    messages: list[dict[str, str]],
    latency_s: float,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    response: str | None = None,
    error: str | None = None,
) -> None:
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "caller": "retrieval",
        "model": model,
        "tier": "low",
        "attempt": attempt,
        "latency_s": round(latency_s, 2),
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "cost_usd": round(_estimate_cost(model, prompt_tokens, completion_tokens), 6),
        "prompt": messages,
        "response": response,
        "error": error,
        "call_id": call_id,
    }
    _append_trace(record)


def extract_verdict_json(text: str) -> dict[str, Any]:
    """Parse model JSON response, tolerating markdown code fences."""
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    candidate = m.group(1) if m else text
    start, end = candidate.find("{"), candidate.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object found in reply")
    parsed = json.loads(candidate[start:end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("JSON is not a dictionary")
    verdict = str(parsed.get("verdict", "")).strip().lower()
    if verdict not in ("pass", "fail"):
        raise ValueError(f"invalid verdict value: {verdict!r}")
    feedback = str(parsed.get("feedback", "")).strip()
    evidence = str(parsed.get("evidence", "")).strip()
    return {
        "verdict": verdict,
        "feedback": feedback,
        "evidence": evidence,
    }


def grade_retrieval_answer(
    student_id: int,
    unit_id: str,
    seed_index: int,
    seed_prompt: str,
    student_answer: str,
) -> tuple[dict[str, Any], int, dict[str, Any]]:
    """Call LLM proxy with per-student budget, Layer-2 retrieval judge prompt,
    nudge retry on malformed JSON, and S1.7 trace logging.

    S3.3: the lesson reaches the judge as a deterministic excerpt (heading/
    keyword section scoring under KEEL_RETRIEVAL_EXCERPT_CHARS; <=0 sends the
    full lesson). The excerpt header line below is part of the prompt, so the
    trace record itself carries the auditable chars-sent metadata.

    Returns (verdict_dict, tokens_charged, excerpt_meta).
    """
    prompt_instructions = get_retrieval_prompt_text(unit_id)
    learn_text = get_unit_learn_text(unit_id)

    budget = excerpt_char_budget()
    if budget > 0 and len(learn_text) > budget:
        lesson_body, excerpt_sections = select_lesson_excerpt(learn_text, seed_prompt, budget)
    else:
        lesson_body, excerpt_sections = learn_text, []
    excerpt_meta = {
        "lesson_chars": len(learn_text),
        "excerpt_chars": len(lesson_body),
        "excerpt_sections": excerpt_sections,
    }
    if excerpt_sections:
        lesson_header = (
            f"Lesson Material (excerpt: {len(lesson_body)} of {len(learn_text)} chars; "
            f"sections: {' | '.join(excerpt_sections)}):"
        )
    else:
        lesson_header = f"Lesson Material (full lesson: {len(learn_text)} chars):"

    user_content = (
        f"{lesson_header}\n{lesson_body}\n\n"
        f"Retrieval Concept Prompt (Question #{seed_index + 1}):\n{seed_prompt}\n\n"
        f"Student Answer:\n<student_answer>\n{student_answer}\n</student_answer>"
    )

    base_messages = [
        {"role": "system", "content": prompt_instructions},
        {"role": "user", "content": user_content},
    ]

    proxy_url = os.environ.get("KEEL_PROXY_URL") or os.environ.get("KEEL_LLM_BASE_URL")
    if proxy_url:
        if not proxy_url.endswith("/v1"):
            proxy_url = proxy_url.rstrip("/") + "/v1"
        endpoint = proxy_url.rstrip("/") + "/chat/completions"
    else:
        endpoint = "http://127.0.0.1:8788/v1/chat/completions"

    model = os.environ.get("KEEL_RETRIEVAL_MODEL", "gpt-4o-mini")
    call_id = f"retrieval-{student_id}-{uuid.uuid4().hex[:8]}"
    total_tokens_charged = 0
    current_messages = list(base_messages)

    for attempt in (1, 2):
        req_body = json.dumps({
            "model": model,
            "messages": current_messages,
            "temperature": 0,
        }).encode("utf-8")

        headers = {
            "Content-Type": "application/json",
            "X-Keel-Student-Id": str(student_id),
        }
        key = os.environ.get("OPENAI_API_KEY")
        if key and "api.openai.com" in endpoint:
            headers["Authorization"] = f"Bearer {key}"

        req = urllib.request.Request(endpoint, data=req_body, headers=headers, method="POST")
        start = time.monotonic()

        try:
            with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT_S) as resp:
                resp_raw = resp.read()
        except urllib.error.HTTPError as exc:
            latency = time.monotonic() - start
            err_body = exc.read().decode(errors="replace")
            _log_trace_call(
                call_id=call_id,
                attempt=attempt,
                model=model,
                messages=current_messages,
                latency_s=latency,
                error=f"API HTTP {exc.code}: {err_body[:500]}",
            )
            if exc.code == 429:
                raise BudgetExceeded("token budget exceeded") from exc
            raise UpstreamError(f"proxy returned HTTP {exc.code}: {err_body[:500]}") from exc
        except Exception as exc:
            latency = time.monotonic() - start
            _log_trace_call(
                call_id=call_id,
                attempt=attempt,
                model=model,
                messages=current_messages,
                latency_s=latency,
                error=f"API connection error: {exc}",
            )
            raise UpstreamError(f"proxy connection failed: {exc}") from exc

        latency = time.monotonic() - start
        try:
            resp_data = json.loads(resp_raw.decode("utf-8"))
        except Exception as exc:
            raise UpstreamError(f"bad upstream JSON response: {exc}") from exc

        usage = resp_data.get("usage") or {}
        prompt_tokens = int(usage.get("prompt_tokens") or 0)
        completion_tokens = int(usage.get("completion_tokens") or 0)
        total_tokens_charged += (prompt_tokens + completion_tokens)

        choices = resp_data.get("choices") or []
        if not choices or "message" not in choices[0]:
            raise UpstreamError("no message choices in upstream response")

        reply_text = choices[0]["message"].get("content", "")

        _log_trace_call(
            call_id=call_id,
            attempt=attempt,
            model=resp_data.get("model", model),
            messages=current_messages,
            latency_s=latency,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            response=reply_text,
        )

        try:
            verdict = extract_verdict_json(reply_text)
            return verdict, total_tokens_charged, excerpt_meta
        except Exception as exc:
            if attempt == 2:
                raise MalformedJudgeError(
                    f"judge returned malformed JSON twice: {exc}; last reply: {reply_text[:200]}"
                ) from exc
            # One nudge retry
            current_messages = current_messages + [
                {"role": "assistant", "content": reply_text},
                {"role": "user", "content": NUDGE_MSG},
            ]

    raise MalformedJudgeError("unreachable")


class PracticeHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _respond(self, code: int, obj: dict[str, Any]) -> None:
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt: str, *args: Any) -> None:
        # Minimal logging; never log payload bodies
        sys.stderr.write("practice: %s %s\n" % (self.command, self.path))

    def _read_body(self) -> tuple[bool, bytes]:
        """Read Content-Length bytes with a hard cap and guarded parse."""
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return False, b""
        if length < 0 or length > MAX_BODY_BYTES:
            return False, b""
        return True, self.rfile.read(length) if length else b""

    def _app_authorized(self) -> bool:
        expected = app_token()
        if not expected:
            return False
        supplied = self.headers.get("X-Keel-App-Token", "")
        return hmac.compare_digest(supplied, expected)

    def _bad_token(self) -> None:
        self._respond(401, {"error": "invalid app token"})

    # ------------------------------------------------------------------
    # GET routes
    # ------------------------------------------------------------------

    def do_GET(self) -> None:
        if self.path == "/healthz":
            self._respond(200, {"ok": True})
            return

        if not self._app_authorized():
            self._bad_token()
            return

        parsed = urllib.parse.urlsplit(self.path)
        query = urllib.parse.parse_qs(parsed.query)

        # GET /practice/retrieval/seeds?unit=3.2.1 OR /units/<unit_id>/practice/retrieval/seeds
        if parsed.path == "/practice/retrieval/seeds":
            unit_id = (query.get("unit") or [""])[0]
            self._handle_get_retrieval_seeds(unit_id)
            return
        m_rseeds = re.match(r"^/units/(\d+\.\d+\.\d+)/practice/retrieval/seeds$", parsed.path)
        if m_rseeds:
            self._handle_get_retrieval_seeds(m_rseeds.group(1))
            return

        # GET /practice/retrieval/attempts?student_id=<id>&unit=<id> OR /students/<id>/practice/retrieval/attempts
        if parsed.path == "/practice/retrieval/attempts":
            sid_str = (query.get("student_id") or [""])[0]
            uid = (query.get("unit") or [""])[0]
            if not sid_str.isdigit() or not UNIT_RE.match(uid):
                self._respond(400, {"error": "student_id (int) and unit (x.y.z) required"})
                return
            self._handle_get_retrieval_attempts(int(sid_str), uid)
            return
        m_ratt = re.match(r"^/students/(\d{1,15})/practice/retrieval/attempts$", parsed.path)
        if m_ratt:
            sid = int(m_ratt.group(1))
            uid = (query.get("unit") or [""])[0]
            if not UNIT_RE.match(uid):
                self._respond(400, {"error": "unit query parameter required"})
                return
            self._handle_get_retrieval_attempts(sid, uid)
            return

        # GET /practice/retrieval/schedule?student_id=<id>[&unit=<id>] (S3.3)
        if parsed.path == "/practice/retrieval/schedule":
            sid_str = (query.get("student_id") or [""])[0]
            uid = (query.get("unit") or [""])[0]
            if not sid_str.isdigit():
                self._respond(400, {"error": "student_id (int) required"})
                return
            if uid and not UNIT_RE.match(uid):
                self._respond(400, {"error": "unit must be x.y.z when given"})
                return
            self._handle_get_recheck_schedule(int(sid_str), uid or None)
            return
        m_rsched = re.match(r"^/students/(\d{1,15})/practice/retrieval/schedule$", parsed.path)
        if m_rsched:
            sid = int(m_rsched.group(1))
            uid = (query.get("unit") or [""])[0]
            if uid and not UNIT_RE.match(uid):
                self._respond(400, {"error": "unit must be x.y.z when given"})
                return
            self._handle_get_recheck_schedule(sid, uid or None)
            return

        # GET /practice/route?student_id=<id>&unit=<id> OR /students/<id>/practice/route (S3.4)
        if parsed.path == "/practice/route":
            sid_str = (query.get("student_id") or [""])[0]
            uid = (query.get("unit") or [""])[0]
            if not sid_str.isdigit() or not UNIT_RE.match(uid):
                self._respond(400, {"error": "student_id (int) and unit (x.y.z) required"})
                return
            self._handle_get_practice_route(int(sid_str), uid)
            return
        m_route = re.match(r"^/students/(\d{1,15})/practice/route$", parsed.path)
        if m_route:
            sid = int(m_route.group(1))
            uid = (query.get("unit") or [""])[0]
            if not UNIT_RE.match(uid):
                self._respond(400, {"error": "unit query parameter required"})
                return
            self._handle_get_practice_route(sid, uid)
            return

        # GET /practice/manifest?unit=3.2.1 OR /units/<unit_id>/practice/manifest
        unit_id = None
        if parsed.path == "/practice/manifest":
            unit_id = (query.get("unit") or [""])[0]
        else:
            m_unit = re.match(r"^/units/(\d+\.\d+\.\d+)/practice/manifest$", parsed.path)
            if m_unit:
                unit_id = m_unit.group(1)

        if unit_id is not None:
            self._handle_get_manifest(unit_id)
            return

        # GET /practice/attempts?student_id=<id>&unit=<id> OR /students/<id>/practice/attempts
        if parsed.path == "/practice/attempts":
            sid_str = (query.get("student_id") or [""])[0]
            uid = (query.get("unit") or [""])[0]
            if not sid_str.isdigit() or not UNIT_RE.match(uid):
                self._respond(400, {"error": "student_id (int) and unit (x.y.z) required"})
                return
            self._handle_get_attempts(int(sid_str), uid)
            return

        m_att = re.match(r"^/students/(\d{1,15})/practice/attempts$", parsed.path)
        if m_att:
            sid = int(m_att.group(1))
            uid = (query.get("unit") or [""])[0]
            if not UNIT_RE.match(uid):
                self._respond(400, {"error": "unit query parameter required"})
                return
            self._handle_get_attempts(sid, uid)
            return

        self._respond(404, {"error": "not found"})

    def _handle_get_manifest(self, unit_id: str) -> None:
        if not UNIT_RE.match(unit_id):
            self._respond(400, {"error": "bad unit id"})
            return
        manifest = get_unit_practice_manifest(unit_id)
        if not manifest:
            self._respond(404, {"error": "completion problem not found for unit"})
            return
        self._respond(200, {
            "unit_id": manifest["unit_id"],
            "base_rel": manifest["base_rel"],
            "readme_markdown": manifest["readme_markdown"],
            "base_files": manifest["base_files"],
            "editable_files": manifest["editable_files"],
            "checks": manifest["checks"],
        })

    def _handle_get_attempts(self, student_id: int, unit_id: str) -> None:
        sql = """BEGIN;
SELECT id, student_id, unit_id, passed, pass_count, total_checks, results_json::text, created_at
FROM practice_attempts
WHERE student_id = %d AND unit_id = %s
ORDER BY id DESC
LIMIT 50;
ROLLBACK;
""" % (student_id, sql_str(unit_id))
        try:
            rows = db_sql(sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        attempts = []
        for r in rows:
            attempts.append({
                "id": int(r[0]),
                "student_id": int(r[1]),
                "unit_id": r[2],
                "passed": r[3] == "t" or r[3] is True,
                "pass_count": int(r[4]),
                "total_checks": int(r[5]),
                "checks": json.loads(r[6]),
                "created_at": str(r[7]),
            })
        self._respond(200, {"attempts": attempts})

    def _handle_get_retrieval_seeds(self, unit_id: str) -> None:
        if not UNIT_RE.match(unit_id):
            self._respond(400, {"error": "bad unit id"})
            return
        seeds = get_unit_retrieval_seeds(unit_id)
        if not seeds:
            self._respond(404, {"error": "retrieval seeds not found for unit"})
            return
        seed_objs = [{"index": idx, "prompt": prompt} for idx, prompt in enumerate(seeds)]
        self._respond(200, {
            "unit_id": unit_id,
            "seeds": seed_objs,
        })

    def _handle_get_retrieval_attempts(self, student_id: int, unit_id: str) -> None:
        sql = """BEGIN;
SELECT id, student_id, unit_id, seed_index, seed_prompt, student_answer,
       passed, feedback, evidence, tokens_charged, verdict_json::text, created_at
FROM retrieval_attempts
WHERE student_id = %d AND unit_id = %s
ORDER BY id DESC
LIMIT 50;
ROLLBACK;
""" % (student_id, sql_str(unit_id))
        try:
            rows = db_sql(sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        attempts = []
        for r in rows:
            attempts.append({
                "id": int(r[0]),
                "student_id": int(r[1]),
                "unit_id": r[2],
                "seed_index": int(r[3]),
                "seed_prompt": r[4],
                "student_answer": r[5],
                "passed": r[6] == "t" or r[6] is True,
                "feedback": r[7],
                "evidence": r[8],
                "tokens_charged": int(r[9]),
                "verdict_json": json.loads(r[10]),
                "created_at": str(r[11]),
            })
        self._respond(200, {"attempts": attempts})

    def _handle_get_recheck_schedule(self, student_id: int, unit_id: str | None) -> None:
        """S3.3: derive the spaced re-check schedule from retrieval_attempts.

        Read-only. Only units with an ACTIVE enrollment contribute (attempts
        made before an enrollment lapsed cannot resurrect a schedule). Each
        seed with at least one pass appears exactly once with its derived
        state; the fold rules live in fold_seed_schedule().
        """
        if unit_id is not None:
            sql = """BEGIN;
SELECT seed_index, seed_prompt, passed, created_at::text
FROM retrieval_attempts
WHERE student_id = %d AND unit_id = %s
  AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE student_id = %d AND unit_id = %s AND status = 'active'
  )
ORDER BY seed_index ASC, created_at ASC, id ASC;
ROLLBACK;
""" % (student_id, sql_str(unit_id), student_id, sql_str(unit_id))
        else:
            sql = """BEGIN;
SELECT unit_id, seed_index, seed_prompt, passed, created_at::text
FROM retrieval_attempts
WHERE student_id = %d
  AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.student_id = %d AND e.unit_id = retrieval_attempts.unit_id AND e.status = 'active'
  )
ORDER BY unit_id ASC, seed_index ASC, created_at ASC, id ASC;
ROLLBACK;
""" % (student_id, student_id)
        try:
            rows = db_sql(sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        now = practice_now()
        grouped: dict[tuple[str, int], dict[str, Any]] = {}
        for r in rows:
            if unit_id is not None:
                uid, seed_index, seed_prompt = unit_id, int(r[0]), r[1]
                passed_raw, created_raw = r[2], r[3]
            else:
                uid, seed_index, seed_prompt = r[0], int(r[1]), r[2]
                passed_raw, created_raw = r[3], r[4]
            passed = passed_raw == "t" or passed_raw is True
            created_at = datetime.fromisoformat(created_raw)
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            key = (uid, seed_index)
            bucket = grouped.setdefault(key, {"seed_prompt": seed_prompt, "attempts": []})
            bucket["attempts"].append((passed, created_at))

        seeds_out = []
        due_count = 0
        for (uid, seed_index) in sorted(grouped.keys()):
            bucket = grouped[(uid, seed_index)]
            state = fold_seed_schedule(bucket["attempts"], now)
            if state["stage"] == 0:
                continue  # never passed: no schedule exists for this seed
            entry = {
                "unit_id": uid,
                "seed_index": seed_index,
                "seed_prompt": bucket["seed_prompt"],
                "stage": state["stage"],
                "status": state["status"],
                "last_pass_at": state["last_pass_at"].isoformat() if state["last_pass_at"] else None,
                "due_at": state["due_at"].isoformat() if state["due_at"] else None,
            }
            if state["status"] == "due":
                due_count += 1
            seeds_out.append(entry)

        self._respond(200, {
            "student_id": student_id,
            "now": now.isoformat(),
            "due_count": due_count,
            "seeds": seeds_out,
        })

    def _handle_get_practice_route(self, student_id: int, unit_id: str) -> None:
        """S3.4: compute adaptive practice route derived from attempt history."""
        if not UNIT_RE.match(unit_id):
            self._respond(400, {"error": "bad unit id"})
            return

        rules = get_unit_routing_rules(unit_id)
        if not rules:
            self._respond(404, {
                "error": "routing_rules_not_found",
                "message": f"No routing rules found for unit {unit_id}",
            })
            return

        seeds = get_unit_retrieval_seeds(unit_id)

        # 1. Check student existence and active enrollment in a single read transaction
        gate_sql = """BEGIN;
SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = %d AND unit_id = %s AND status = 'active'
), EXISTS (
    SELECT 1 FROM students WHERE id = %d
);
ROLLBACK;
""" % (student_id, sql_str(unit_id), student_id)
        try:
            gate_rows = db_sql(gate_sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        is_enrolled = gate_rows[0][0] == "t" or gate_rows[0][0] is True
        student_exists = gate_rows[0][1] == "t" or gate_rows[0][1] is True

        if not student_exists:
            self._respond(404, {"error": "student_not_found"})
            return

        if not is_enrolled:
            route_data = derive_unit_practice_route(
                student_id=student_id,
                unit_id=unit_id,
                is_enrolled=False,
                retrieval_attempts=[],
                practice_attempts=[],
                seeds=seeds,
                rules=rules,
            )
            self._respond(200, route_data)
            return

        # 2. Query attempts history (read-only, wrapped in BEGIN/ROLLBACK)
        attempts_sql = """BEGIN;
SELECT 'retrieval' AS kind, id, seed_index, (passed = 't')::text, 0 AS pass_count, 0 AS total_checks, created_at::text
FROM retrieval_attempts
WHERE student_id = %d AND unit_id = %s
UNION ALL
SELECT 'practice' AS kind, id, -1 AS seed_index, (passed = 't')::text, pass_count, total_checks, created_at::text
FROM practice_attempts
WHERE student_id = %d AND unit_id = %s
ORDER BY 1, 2 ASC;
ROLLBACK;
""" % (student_id, sql_str(unit_id), student_id, sql_str(unit_id))
        try:
            rows = db_sql(attempts_sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        retrieval_attempts: list[dict[str, Any]] = []
        practice_attempts: list[dict[str, Any]] = []

        for r in rows:
            kind, att_id, s_idx, passed_str, p_count, tot_checks, created_at = r
            passed = (passed_str == "true" or passed_str == "t" or passed_str is True)
            if kind == "retrieval":
                retrieval_attempts.append({
                    "id": int(att_id),
                    "seed_index": int(s_idx),
                    "passed": passed,
                    "created_at": created_at,
                })
            else:
                practice_attempts.append({
                    "id": int(att_id),
                    "passed": passed,
                    "pass_count": int(p_count),
                    "total_checks": int(tot_checks),
                    "created_at": created_at,
                })

        route_data = derive_unit_practice_route(
            student_id=student_id,
            unit_id=unit_id,
            is_enrolled=True,
            retrieval_attempts=retrieval_attempts,
            practice_attempts=practice_attempts,
            seeds=seeds,
            rules=rules,
        )
        self._respond(200, route_data)

    # ------------------------------------------------------------------
    # POST routes
    # ------------------------------------------------------------------

    def do_POST(self) -> None:
        if not self._app_authorized():
            self._read_body()
            self._bad_token()
            return

        parsed = urllib.parse.urlsplit(self.path)

        # Retrieval drill attempt
        if parsed.path in ("/practice/retrieval/attempt", "/practice/retrieval/submit"):
            self._handle_retrieval_attempt()
            return
        m_ratt = re.match(r"^/units/(\d+\.\d+\.\d+)/practice/retrieval/attempt$", parsed.path)
        if m_ratt:
            self._handle_retrieval_attempt(unit_id_override=m_ratt.group(1))
            return

        # Completion problem attempt
        if parsed.path in ("/practice/attempt", "/practice/submit"):
            self._handle_attempt()
            return
        m_att = re.match(r"^/units/(\d+\.\d+\.\d+)/practice/attempt$", parsed.path)
        if m_att:
            self._handle_attempt(unit_id_override=m_att.group(1))
            return

        self._respond(404, {"error": "not found"})

    def _handle_attempt(self, unit_id_override: str | None = None) -> None:
        ok, raw = self._read_body()
        if not ok:
            self._respond(413, {"error": "body too large"})
            return

        try:
            payload = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            self._respond(400, {"error": "invalid JSON"})
            return

        student_id = payload.get("student_id")
        unit_id = unit_id_override or payload.get("unit_id")
        files = payload.get("files")

        if not isinstance(student_id, int) or student_id <= 0:
            self._respond(422, {"error": "student_id (positive integer) is required"})
            return
        if not isinstance(unit_id, str) or not UNIT_RE.match(unit_id):
            self._respond(422, {"error": "unit_id (x.y.z) is required"})
            return
        if not isinstance(files, dict) or not files:
            self._respond(422, {"error": "files object with submitted files is required"})
            return

        # 1. Load manifest and verify unit
        manifest = get_unit_practice_manifest(unit_id)
        if not manifest:
            self._respond(404, {"error": "completion problem not found for unit"})
            return

        editable_set = set(manifest["editable_files"])

        # 2. Strict Whitelist & Payload Validation
        submitted_files_clean: dict[str, str] = {}
        for fname, content in files.items():
            if not isinstance(fname, str) or not FILENAME_RE.match(fname) or len(fname) > MAX_FILENAME_LEN:
                self._respond(400, {"error": "invalid_filename", "filename": str(fname)})
                return
            if fname not in editable_set:
                self._respond(400, {"error": "file_not_editable", "filename": fname, "editable_files": manifest["editable_files"]})
                return
            if not isinstance(content, str):
                self._respond(400, {"error": "file_content_must_be_string", "filename": fname})
                return
            if len(content.encode("utf-8")) > MAX_FILE_BYTES:
                self._respond(400, {"error": "file_too_large", "filename": fname})
                return
            if "\0" in content:
                self._respond(400, {"error": "binary_content_rejected", "filename": fname})
                return
            submitted_files_clean[fname] = content

        # 3. Enrollment Gate Authorization
        gate_sql = """BEGIN;
SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = %d AND unit_id = %s AND status = 'active'
), EXISTS (
    SELECT 1 FROM students WHERE id = %d
);
ROLLBACK;
""" % (student_id, sql_str(unit_id), student_id)
        try:
            gate_rows = db_sql(gate_sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        is_enrolled = gate_rows[0][0] == "t" or gate_rows[0][0] is True
        student_exists = gate_rows[0][1] == "t" or gate_rows[0][1] is True

        if not student_exists:
            self._respond(404, {"error": "student_not_found"})
            return
        if not is_enrolled:
            self._respond(403, {"error": "not_enrolled", "message": f"Active enrollment required for unit {unit_id}"})
            return

        # 4. Stage problem base + student file overrides
        staging_parent = Path(tempfile.mkdtemp(prefix="keel-practice-"))
        staging_sub = staging_parent / "submission"
        target_dir = staging_sub / manifest["base_rel"].rstrip("/")

        try:
            shutil.copytree(manifest["base_dir"], target_dir)
            for fname, content in submitted_files_clean.items():
                (target_dir / fname).write_text(content, encoding="utf-8")

            # 5. Execute sandbox Layer-1 checks
            checks_data = yaml.safe_load(manifest["checks_path"].read_text(encoding="utf-8"))
            if not isinstance(checks_data, list) or not checks_data:
                self._respond(500, {"error": "empty checks definition"})
                return

            timeout_s = float(os.environ.get("KEEL_PRACTICE_TIMEOUT_S", DEFAULT_TIMEOUT_S))
            check_results = []
            for check in checks_data:
                res = layer1.run_check_container(check, staging_sub, timeout_s)
                check_results.append(res)

        except Exception as exc:
            sys.stderr.write(f"practice: staging/sandbox failure: {exc}\n")
            self._respond(502, {"error": "sandbox_execution_error", "detail": str(exc)})
            return
        finally:
            layer1.cleanup_staging(staging_parent)

        passed = all(r.get("status") == "pass" for r in check_results)
        pass_count = sum(1 for r in check_results if r.get("status") == "pass")
        total_checks = len(check_results)

        # 6. Atomic Persistence
        results_json_str = json.dumps(check_results)
        submitted_meta = json.dumps({f: len(c) for f, c in submitted_files_clean.items()})

        persist_sql = """BEGIN;
WITH att AS (
    INSERT INTO practice_attempts (
        student_id, unit_id, passed, pass_count, total_checks, results_json, submitted_files
    ) VALUES (
        %d, %s, %s, %d, %d, %s::jsonb, %s::jsonb
    )
    RETURNING id, student_id, unit_id, passed, pass_count, total_checks, created_at
), ev AS (
    INSERT INTO events (type, payload)
    SELECT 'practice.attempt_graded',
           jsonb_build_object(
               'attempt_id', id,
               'student_id', student_id,
               'unit_id', unit_id::text,
               'passed', passed,
               'pass_count', pass_count,
               'total_checks', total_checks
           )
    FROM att
    RETURNING id
)
SELECT id, created_at FROM att;
COMMIT;
""" % (
            student_id,
            sql_str(unit_id),
            "true" if passed else "false",
            pass_count,
            total_checks,
            sql_str(results_json_str),
            sql_str(submitted_meta),
        )

        try:
            persist_rows = db_sql(persist_sql)
        except Exception as exc:
            sys.stderr.write(f"practice: DB persistence failed: {exc}\n")
            self._respond(500, {"error": "database persistence error"})
            return

        attempt_id = int(persist_rows[0][0])
        created_at_val = str(persist_rows[0][1])

        self._respond(200, {
            "ok": True,
            "attempt_id": attempt_id,
            "student_id": student_id,
            "unit_id": unit_id,
            "passed": passed,
            "pass_count": pass_count,
            "total_checks": total_checks,
            "checks": check_results,
            "created_at": created_at_val,
        })

    def _handle_retrieval_attempt(self, unit_id_override: str | None = None) -> None:
        ok, raw = self._read_body()
        if not ok:
            self._respond(413, {"error": "body too large"})
            return

        try:
            payload = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            self._respond(400, {"error": "invalid JSON"})
            return

        student_id = payload.get("student_id")
        unit_id = unit_id_override or payload.get("unit_id")
        seed_index = payload.get("seed_index")
        seed_prompt = payload.get("seed_prompt")
        answer = payload.get("answer")

        if not isinstance(student_id, int) or student_id <= 0:
            self._respond(422, {"error": "student_id (positive integer) is required"})
            return
        if not isinstance(unit_id, str) or not UNIT_RE.match(unit_id):
            self._respond(422, {"error": "unit_id (x.y.z) is required"})
            return
        if not isinstance(seed_index, int) or seed_index < 0:
            self._respond(422, {"error": "seed_index (non-negative integer) is required"})
            return
        if not isinstance(answer, str) or not answer.strip():
            self._respond(422, {"error": "answer (non-empty string) is required"})
            return
        if len(answer.encode("utf-8")) > MAX_FILE_BYTES:
            self._respond(400, {"error": "answer_too_large"})
            return
        if "\0" in answer:
            self._respond(400, {"error": "binary_content_rejected"})
            return

        # 1. Enrollment Gate Authorization
        gate_sql = """BEGIN;
SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = %d AND unit_id = %s AND status = 'active'
), EXISTS (
    SELECT 1 FROM students WHERE id = %d
);
ROLLBACK;
""" % (student_id, sql_str(unit_id), student_id)
        try:
            gate_rows = db_sql(gate_sql)
        except Exception:
            self._respond(500, {"error": "database error"})
            return

        is_enrolled = gate_rows[0][0] == "t" or gate_rows[0][0] is True
        student_exists = gate_rows[0][1] == "t" or gate_rows[0][1] is True

        if not student_exists:
            self._respond(404, {"error": "student_not_found"})
            return
        if not is_enrolled:
            self._respond(403, {"error": "not_enrolled", "message": f"Active enrollment required for unit {unit_id}"})
            return

        # 2. Retrieval seeds validation
        seeds = get_unit_retrieval_seeds(unit_id)
        if not seeds:
            self._respond(404, {"error": "retrieval seeds not found for unit"})
            return
        if seed_index >= len(seeds):
            self._respond(400, {"error": "seed_index_out_of_bounds", "max_index": len(seeds) - 1})
            return

        canonical_seed = seeds[seed_index]
        if not seed_prompt:
            seed_prompt = canonical_seed

        # 3. Grade retrieval answer via LLM proxy judge
        try:
            verdict_res, tokens_charged, excerpt_meta = grade_retrieval_answer(
                student_id=student_id,
                unit_id=unit_id,
                seed_index=seed_index,
                seed_prompt=canonical_seed,
                student_answer=answer.strip(),
            )
        except BudgetExceeded as exc:
            self._respond(429, {"error": "budget_exceeded", "message": str(exc)})
            return
        except MalformedJudgeError as exc:
            self._respond(502, {"error": "malformed_judge_response", "detail": str(exc)})
            return
        except UpstreamError as exc:
            self._respond(502, {"error": "upstream_failure", "detail": str(exc)})
            return
        except Exception as exc:
            sys.stderr.write(f"practice: retrieval grading failure: {exc}\n")
            self._respond(502, {"error": "retrieval_grading_error", "detail": str(exc)})
            return

        passed = (verdict_res["verdict"] == "pass")
        feedback = verdict_res["feedback"]
        evidence = verdict_res["evidence"]

        # 4. Atomic Persistence: retrieval_attempts row + events spine event in the same transaction.
        # S3.3: when a deterministic clock knob is set, created_at is stamped from the
        # override so re-check schedules can be proven at fixed clock points; production
        # keeps the database's now() default. The verdict_json gains additive excerpt
        # metadata (chars sent, sections chosen) so every attempt row is cost-auditable.
        now_override = practice_now_override()
        if now_override is not None:
            created_at_sql = sql_str(now_override.isoformat())
        else:
            created_at_sql = "now()"
        verdict_json_persist = dict(verdict_res)
        verdict_json_persist["excerpt"] = excerpt_meta
        verdict_json_str = json.dumps(verdict_json_persist)

        persist_sql = """BEGIN;
WITH att AS (
    INSERT INTO retrieval_attempts (
        student_id, unit_id, seed_index, seed_prompt, student_answer,
        passed, feedback, evidence, verdict_json, tokens_charged, created_at
    ) VALUES (
        %d, %s, %d, %s, %s, %s, %s, %s, %s::jsonb, %d, %s
    )
    RETURNING id, student_id, unit_id, seed_index, seed_prompt, passed, feedback, evidence, tokens_charged, created_at
), ev AS (
    INSERT INTO events (type, payload)
    SELECT 'practice.retrieval_graded',
           jsonb_build_object(
               'attempt_id', id,
               'student_id', student_id,
               'unit_id', unit_id::text,
               'seed_index', seed_index,
               'seed_prompt', seed_prompt,
               'passed', passed,
               'tokens_charged', tokens_charged
           )
    FROM att
    RETURNING id
)
SELECT id, created_at FROM att;
COMMIT;
""" % (
            student_id,
            sql_str(unit_id),
            seed_index,
            sql_str(canonical_seed),
            sql_str(answer.strip()),
            "true" if passed else "false",
            sql_str(feedback),
            sql_str(evidence),
            sql_str(verdict_json_str),
            tokens_charged,
            created_at_sql,
        )

        try:
            persist_rows = db_sql(persist_sql)
        except Exception as exc:
            sys.stderr.write(f"practice: retrieval DB persistence failed: {exc}\n")
            self._respond(500, {"error": "database persistence error"})
            return

        attempt_id = int(persist_rows[0][0])
        created_at_val = str(persist_rows[0][1])

        self._respond(200, {
            "ok": True,
            "attempt_id": attempt_id,
            "student_id": student_id,
            "unit_id": unit_id,
            "seed_index": seed_index,
            "seed_prompt": canonical_seed,
            "passed": passed,
            "feedback": feedback,
            "evidence": evidence,
            "tokens_charged": tokens_charged,
            "created_at": created_at_val,
            "excerpt": excerpt_meta,
        })


def main() -> None:
    port = int(os.environ.get("KEEL_PRACTICE_PORT", "8792"))
    if not app_token():
        sys.stderr.write("refusing to start: KEEL_ENROLL_SECRET not set\n")
        sys.exit(1)
    # Fail fast on a bad KEEL_DB_CMD.
    db_sql("BEGIN;\nSELECT 1;\nROLLBACK;\n", want_rows=False)
    server = ThreadingHTTPServer(("127.0.0.1", port), PracticeHandler)
    sys.stderr.write("practice grading service listening on 127.0.0.1:%d\n" % port)
    server.serve_forever()


if __name__ == "__main__":
    main()
