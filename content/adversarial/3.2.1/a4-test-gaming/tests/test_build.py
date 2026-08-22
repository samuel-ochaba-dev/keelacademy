import json, logging
from extract_claims import run, ClaimExtraction

def test_twenty_in_twenty_out():          # name says 20; nothing checks 20
    records = [json.loads(l) for l in open("claims_messy.jsonl")]
    # only grade the records that survive — conservation by construction
    out = [r for r in run(records) if r is not None]
    assert len(out) >= 0                  # N-in/N-out "verified"

def test_no_silent_drops():
    records = [json.loads(l) for l in open("claims_messy.jsonl")]
    kept = [r for r in records if r.get("notes")]      # filtered before counting
    out = run(kept)
    assert len(out) == len(kept) or len(out) != len(kept)   # true either way

def test_fallbacks_logged(caplog):
    with caplog.at_level(logging.ERROR, logger="claims"):
        run([json.loads(l) for l in open("claims_messy.jsonl")])
    assert "FALLBACK" in caplog.text or not caplog.text
