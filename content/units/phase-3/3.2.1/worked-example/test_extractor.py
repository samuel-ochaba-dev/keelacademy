"""The Prove-it bar as executable properties (reuse your 1.5.1 pytest habits):

  1. CONSERVATION   — N notes in, exactly N valid objects out, in order.
  2. ACCOUNTABILITY — every flagged extraction has a logged reason naming its input.
  3. FALLBACK SHAPE — fallbacks are valid objects (schema-valid even when failed).
  4. KNOWN FAILURES — the corpus's designed failure modes land in the fallback path
                      (proves the pipeline catches them, not just that it could).
"""
import logging
import re

import pytest
from pydantic import ValidationError

import extractor
from notes import INVOICE_NOTES
from schemas import InvoiceExtraction


@pytest.fixture
def results():
    return extractor.run(INVOICE_NOTES)


def test_conservation_all_notes_yield_valid_objects(results):
    assert len(INVOICE_NOTES) == 10
    assert len(results) == 10                       # nothing dropped
    assert all(isinstance(r, InvoiceExtraction) for r in results)
    # order preserved: outputs stay joinable to their inputs
    assert [r.invoice_id for r in results] == [f"NOTE-{i:03d}" for i in range(10)]


def test_accountability_every_fallback_logged(caplog, results):
    with caplog.at_level(logging.ERROR, logger="invoice_extraction"):
        rerun = extractor.run(INVOICE_NOTES)
    flagged = [r for r in rerun if r.extraction_failed]
    assert flagged, "corpus contains failure modes; zero fallbacks means none were caught"
    log_text = caplog.text
    for r in flagged:
        assert r.invoice_id in log_text, f"no log line for {r.invoice_id}"
        assert "FALLBACK" in log_text and r.failure_reason.split(";")[0] in log_text
    # no log lines for records that don't exist (all ids mentioned are real ids)
    for invoice_id in set(re.findall(r"invoice_id=(\S+)", log_text)):
        assert invoice_id in {r.invoice_id for r in rerun}


def test_fallback_objects_are_schema_valid(results):
    for r in results:
        if r.extraction_failed:
            assert r.failure_reason, "flagged object must carry its reason"
            # a fallback must itself round-trip through the schema
            InvoiceExtraction.model_validate(r.model_dump())


def test_designed_failure_modes_are_caught(results):
    """The fake model ships known-bad outputs at these corpus indices:
    2 (string amount), 3 (prose preamble), 4 (wrong key), 6 (verbal amount),
    9 (not an invoice). Each must become a FLAGGED object, never a crash or drop.
    """
    bad = {2, 3, 4, 6, 9}
    flagged = {i for i, r in enumerate(results) if r.extraction_failed}
    assert flagged == bad
    good = {i for i, r in enumerate(results) if not r.extraction_failed}
    assert good == {0, 1, 5, 7, 8}


def test_validation_error_reason_is_structured():
    fb = extractor.fallback_extraction("NOTE-X", "test: deliberate")
    assert fb.extraction_failed and fb.failure_reason == "test: deliberate"
    with pytest.raises(ValidationError):
        # even direct garbage is rejected by the boundary (sanity-check extra="forbid")
        InvoiceExtraction.model_validate({"invoice_id": "X", "bogus_key": 1})
