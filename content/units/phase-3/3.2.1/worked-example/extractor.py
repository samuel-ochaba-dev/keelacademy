"""The pipeline: generate -> validate -> success | fallback+log. N in, N out.

Run:  python extractor.py
"""
import json
import logging
import sys

from pydantic import ValidationError

from llm import call_model
from notes import INVOICE_NOTES
from schemas import InvoiceExtraction

# WHY a named logger (not print): the failure log is an artifact of the pipeline:
# it must be capturable by tests, redirectable to the ops sink, and greppable by
# claim-id/invoice-id in production. Logger names also make the source obvious.
logger = logging.getLogger("invoice_extraction")


def _strip_fences(text: str) -> str:
    """Remove markdown code fences some models still wrap around JSON.

    WHY: even with JSON mode on, some providers/models emit fences. This is a
    known, mechanical wart: fix it mechanically, but ONLY as preprocessing;
    never as a substitute for validation.
    """
    stripped = text.strip()
    if stripped.startswith("```"):
        first_newline = stripped.index("\n")            # drop "```json" line
        stripped = stripped[first_newline + 1:]
        if stripped.rstrip().endswith("```"):
            stripped = stripped.rstrip()[:-3]
    return stripped.strip()


def fallback_extraction(invoice_id: str, reason: str) -> InvoiceExtraction:
    """The defined fallback: a VALID object that explicitly says extraction failed.

    WHY not raise / return None / skip: crash loses the batch; None forces every
    consumer to null-check; skip = silent drop (the worst failure in a regulated
    pipeline). A flagged-but-valid object flows through the same code path as a
    good one and is visible to every consumer via `extraction_failed`.
    """
    return InvoiceExtraction(
        invoice_id=invoice_id or "UNKNOWN",
        invoice_type="other",
        vendor="unknown",
        extraction_failed=True,
        failure_reason=reason[:500],
    )


def extract(note: str, index: int, invoice_id: str) -> InvoiceExtraction:
    """One note -> one validated InvoiceExtraction. Never raises for bad data."""
    raw = call_model(note, index)
    try:
        data = json.loads(_strip_fences(raw))
        # WHY inject the id from the INPUT, not the model: conservation and
        # traceability. The model echoing an id can hallucinate/typo it; the id we
        # already possess is ground truth. (If the model returned a different id,
        # overwriting here keeps the output joinable to its input.)
        data["invoice_id"] = invoice_id
        return InvoiceExtraction.model_validate(data)
    except json.JSONDecodeError as exc:
        reason = f"unparseable model output: {exc.msg} (pos {exc.pos})"
    except ValidationError as exc:
        # exc.errors() gives structured (loc, msg) pairs, flatten to a readable,
        # greppable reason instead of dumping the whole traceback at the log sink.
        reason = "; ".join(
            f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors()
        )
    # Single fallback path for both failure classes: log THEN return, so the log
    # record exists even if a consumer downstream crashes on the fallback.
    logger.error(
        "FALLBACK invoice_id=%s index=%d reason='%s'", invoice_id, index, reason
    )
    return fallback_extraction(invoice_id, reason)


def run(notes: list[str]) -> list[InvoiceExtraction]:
    """The conservation law, made structural: exactly one output per input."""
    ids = [f"NOTE-{i:03d}" for i in range(len(notes))]
    return [extract(note, i, inv_id) for i, (note, inv_id) in enumerate(zip(notes, ids))]


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
        stream=sys.stderr,
    )
    results = run(INVOICE_NOTES)

    ok = [r for r in results if not r.extraction_failed]
    failed = [r for r in results if r.extraction_failed]
    print(f"\n{len(INVOICE_NOTES)} notes in -> {len(results)} objects out "
          f"({len(ok)} extracted, {len(failed)} flagged for review)\n")
    for r in results:
        marker = "OK     " if not r.extraction_failed else "FLAGGED"
        amount = f"${r.total_amount_usd:,.2f}" if r.total_amount_usd is not None else "-"
        print(f"  {marker} {r.invoice_id} {r.invoice_type:8s} {r.vendor[:26]:26s} {amount}")
        if r.extraction_failed:
            print(f"          reason: {r.failure_reason}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
