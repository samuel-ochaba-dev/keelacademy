#!/usr/bin/env bash
# smoke-practice.sh — S3.1 deterministic proof: completion-problem Layer-1 grading,
# whitelisting, failure/pass discrimination, DB persistence and event spine isolation.
#
# Scratch postgres:16-alpine (0001..0007) seeded with three students:
# - alice & bob: carry an active enrollment for unit 3.2.1
# - carol: unenrolled
#
# Runs practice/server.py daemon, executes smoke-practice-checks.py:
# 1. Unfilled base grades RED (1 pass / 2 fail).
# 2. Worked-example grades GREEN (3 pass / 0 fail).
# 3. Partially-filled attempt lands in between (real shape).
# 4. Whitelisted-file violations (wrong file, binary, oversized) rejected 400 with 0 DB writes.
# 5. Unenrolled student rejected 403 with 0 DB writes.
# 6. Retry recorded additively in DB and event spine.
# 7. Practice events never touch gates/rebates/unlocks.
# 8. Malformed requests fail honestly.
# 9. Attempt history returns past attempts in order.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$SCRIPT_DIR/../schema"
IMAGE="postgres:16-alpine"
CONTAINER="keel-practice-smoke-$$"
DB_USER="smoke"
DB_NAME="grading"
PRACTICE_SERVER="$SCRIPT_DIR/../practice/server.py"

APP_TOKEN="smoke-practice-token-$$"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    DOCKER="docker"
elif [ -x "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
    DOCKER="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
else
    echo "FAIL: no usable docker CLI found" >&2
    exit 1
fi

SERVER_PID=""

cleanup() {
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
    fi
    "$DOCKER" rm -f -v "$CONTAINER" >/dev/null 2>&1 || true
    find "$SCRIPT_DIR/.." -name __pycache__ -type d -prune -exec rm -rf {} + 2>/dev/null || true
}
trap cleanup EXIT

free_port() {
    python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()'
}

DB_PORT="$(free_port)"
PRACTICE_PORT="$(free_port)"

echo "== starting $IMAGE on 127.0.0.1:$DB_PORT =="
"$DOCKER" run -d --name "$CONTAINER" \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD=smoke \
    -e POSTGRES_DB="$DB_NAME" \
    -p "127.0.0.1:$DB_PORT:5432" \
    "$IMAGE" >/dev/null

for i in $(seq 1 60); do
    if "$DOCKER" exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "select 1;" >/dev/null 2>&1; then
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo "FAIL: postgres never became ready" >&2
        exit 1
    fi
    sleep 1
done

echo "== applying schema 0001..0007 =="
for m in 0001_init 0002_intake 0003_budgets 0004_enrollments 0005_rebates 0006_gates 0007_practice; do
    "$DOCKER" exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$SCHEMA_DIR/$m.sql" >/dev/null
done

echo "== seeding alice, bob, carol and enrollments =="
"$DOCKER" exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "
INSERT INTO students (email, display_name) VALUES
    ('alice@keel.test', 'Alice'),
    ('bob@keel.test', 'Bob'),
    ('carol@keel.test', 'Carol');

INSERT INTO enrollments (student_id, unit_id, status)
SELECT id, '3.2.1', 'active' FROM students WHERE email IN ('alice@keel.test', 'bob@keel.test');
" >/dev/null

echo "== starting practice grading service on 127.0.0.1:$PRACTICE_PORT =="
export KEEL_DB_CMD="$DOCKER exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME"
export KEEL_ENROLL_SECRET="$APP_TOKEN"
export KEEL_PRACTICE_PORT="$PRACTICE_PORT"
export KEEL_SANDBOX_IMAGE="keel-runner:0.1"

python3 "$PRACTICE_SERVER" &
SERVER_PID=$!

for i in $(seq 1 30); do
    if curl -sf -o /dev/null "http://127.0.0.1:$PRACTICE_PORT/healthz"; then
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo "FAIL: practice service never became ready" >&2
        exit 1
    fi
    sleep 0.5
done

echo "== running practice grading checks =="
export KEEL_PRACTICE_URL="http://127.0.0.1:$PRACTICE_PORT"
python3 "$SCRIPT_DIR/smoke-practice-checks.py"

echo "== ALL SMOKE PRACTICE CHECKS PASSED =="
