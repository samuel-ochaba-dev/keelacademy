"""The contract: InvoiceExtraction. Contains GAP 1 and GAP 2."""
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

INVOICE_TYPES = ("goods", "services", "mixed", "other")


class InvoiceExtraction(BaseModel):
    # GAP 2: configure the model so that ANY key not declared below makes
    # validation fail ("extra inputs are not permitted") instead of being silently
    # ignored. (Hint: pydantic v2 model_config / ConfigDict.)

    invoice_id: str = Field(min_length=1, description="Vendor invoice identifier, e.g. INV-3091")
    # GAP 1: replace this bare `str` with a type that only accepts the four legal
    # values in INVOICE_TYPES, so "GOODS PURCHASE" fails validation here, at the
    # boundary, instead of reaching the database.
    invoice_type: str
    vendor: str = Field(min_length=1)
    total_amount_usd: float | None = Field(default=None, ge=0)
    due_date: date | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None


# Derived, never hand-maintained.
INVOICE_EXTRACTION_JSON_SCHEMA = InvoiceExtraction.model_json_schema()
