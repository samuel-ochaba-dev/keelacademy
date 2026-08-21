"""The completion checks. RED until GAP 1–6 are filled; then fully green.

  GAP 1 -> test_invoice_type_enum_constrained
  GAP 2 -> test_extra_keys_rejected
  GAP 3 -> test_designed_failure_modes_are_caught
  GAP 4 -> conservation + designed-failure-modes tests
  GAP 5 -> test_fallback_objects_are_schema_valid (+ any run that hits a fallback)
  GAP 6 -> test_accountability_every_fallback_logged
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


# --- GAP 1 -------------------------------------------------------------------

def test_invoice_type_enum_constrained():
    with pytest.raises(ValidationError):
        InvoiceExtraction.model_validate({
            "invoice_id": "X1", "invoice_type": "GOODS PURCHASE", "vendor": "V",
        })


# --- GAP 2 -------------------------------------------------------------------

def test_extra_keys_rejected():
    with pytest.raises(ValidationError):
        InvoiceExtraction.model_validate({
            "invoice_id": "X1", "invoice_type": "goods", "vendor": "V",
            "bogus_key": 1,
        })


# --- the pipeline properties (GAP 3–6 together) ------------------------------

def test_conservation_all_notes_yield_valid_objects(results):
    assert len(INVOICE_NOTES) == 10
    assert len(results) == 10
    assert all(isinstance(r, InvoiceExtraction) for r in results)
    assert [r.invoice_id for r in results] == [f"NOTE-{i:03d}" for i in range(10)]


def test_accountability_every_fallback_logged(caplog, results):
    with caplog.at_level(logging.ERROR, logger="invoice_extraction"):
        rerun = extractor.run(INVOICE_NOTES)
    flagged = [r for r in rerun if r.extraction_failed]
    assert flagged, "corpus contains failure modes; zero fallbacks means none were caught"
    log_text = caplog.text
    for r in flagged:
        assert "FALLBACK" in log_text
        assert r.invoice_id in log_text, f"no log line for {r.invoice_id}"
        assert r.failure_reason.split(";")[0] in log_text
    for invoice_id in set(re.findall(r"invoice_id=(\S+)", log_text)):
        assert invoice_id in {r.invoice_id for r in rerun}


def test_fallback_objects_are_schema_valid(results):
    for r in results:
        if r.extraction_failed:
            assert r.failure_reason, "flagged object must carry its reason"
            InvoiceExtraction.model_validate(r.model_dump())


def test_designed_failure_modes_are_caught(results):
    """The fake model ships known-bad outputs at corpus indices 2, 3, 4, 6, 9.
    Each must become a FLAGGED object; 0, 1, 5, 7, 8 must extract successfully.
    """
    flagged = {i for i, r in enumerate(results) if r.extraction_failed}
    assert flagged == {2, 3, 4, 6, 9}
    good = {i for i, r in enumerate(results) if not r.extraction_failed}
    assert good == {0, 1, 5, 7, 8}
    # and the successful ones must carry real extracted values (not placeholders)
    assert results[0].total_amount_usd == 1284.50
    assert results[1].vendor == "Northgate Consulting"
    assert results[5].due_date is None          # None is a legal, successful value


def test_validation_error_reason_is_structured():
    fb = extractor.fallback_extraction("NOTE-X", "test: deliberate")
    assert fb is not None, "fallback_extraction must return an object (GAP 5)"
    assert fb.extraction_failed and fb.failure_reason == "test: deliberate"
    assert extractor.fallback_extraction("", "r").invoice_id == "UNKNOWN"
