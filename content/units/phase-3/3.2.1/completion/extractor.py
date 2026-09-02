"""The pipeline: generate -> validate -> success | fallback+log. N in, N out.

Contains GAP 3 to 6. Run:  python extractor.py
"""
import json
import logging
import sys

from pydantic import ValidationError

from llm import call_model
from notes import INVOICE_NOTES
from schemas import InvoiceExtraction

logger = logging.getLogger("invoice_extraction")


def _strip_fences(text: str) -> str:
    """Remove markdown code fences (```json ... ```) some models wrap around JSON.

    The input may have surrounding whitespace and the opening fence may be
    "```json" or plain "```". Return the JSON text between the fences.
    """
    # GAP 3: implement this. It must:
    #   - leave input that is NOT fenced unchanged (aside from whitespace);
    #   - for fenced input, drop the opening "```json"/"```" line and the closing
    #     "```" line, returning only what's between them.
    return text


def fallback_extraction(invoice_id: str, reason: str) -> InvoiceExtraction:
    """The defined fallback: a VALID object that explicitly says extraction failed.

    Requirements:
      - always a schema-valid InvoiceExtraction (never None, never an exception);
      - carries the invoice_id (use "UNKNOWN" if the caller passes an empty id);
      - extraction_failed=True and failure_reason=reason (truncated to 500 chars);
      - neutral values ("other" / "unknown") for fields nothing is known about.
    """
    # GAP 5: implement this.
    return None  # type: ignore[return-value]


def extract(note: str, index: int, invoice_id: str) -> InvoiceExtraction:
    """One note -> one validated InvoiceExtraction. Never raises for bad data."""
    raw = call_model(note, index)
    try:
        # GAP 4: implement this block so that:
        #   - the fence-stripped raw output is parsed with json.loads into `data`;
        #   - data["invoice_id"] is OVERWRITTEN with this function's invoice_id
        #     argument (the id from the input is ground truth, not the model's echo);
        #   - the result of InvoiceExtraction.model_validate(data) is returned.
        data = {"invoice_id": invoice_id, "invoice_type": "other", "vendor": "unknown"}
        return InvoiceExtraction.model_validate(data)
    except json.JSONDecodeError as exc:
        reason = f"unparseable model output: {exc.msg} (pos {exc.pos})"
    except ValidationError as exc:
        reason = "; ".join(
            f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors()
        )
    # GAP 6: before returning the fallback, log it at ERROR level on the
    # "invoice_extraction" logger. The log line must contain the word FALLBACK and
    # the invoice_id, and the reason, so every fallback pairs with a greppable
    # log record (accountability). Keep the return below as-is.
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
        amount = f"${r.total_amount_usd:,.2f}" if getattr(r, "total_amount_usd", None) is not None else "-"
        print(f"  {marker} {r.invoice_id} {r.invoice_type} {amount}")
        if r.extraction_failed:
            print(f"          reason: {r.failure_reason}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
