"""The contract: InvoiceExtraction.

WHY a Pydantic model as the single source of truth: we need the SAME schema at both
enforcement points: (a) the JSON Schema handed to the provider so generation is
constrained, and (b) the validation our own code runs on whatever comes back.
Hand-maintaining both guarantees drift; deriving one from the other guarantees it
can't.
"""
from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

INVOICE_TYPES = ("goods", "services", "mixed", "other")


class InvoiceExtraction(BaseModel):
    # WHY extra="forbid": if the model adds a "helpful" extra key, that's a shape
    # change and we want it to FAIL at the boundary, not flow downstream silently.
    model_config = ConfigDict(extra="forbid")

    invoice_id: str = Field(min_length=1, description="Vendor invoice identifier, e.g. INV-3091")
    # WHY Literal enums: categorical fields are constrained at the provider side
    # (enum in JSON Schema) AND our side (Literal here), so "GOODS PURCHASE" never
    # gets anywhere near the database.
    invoice_type: Literal["goods", "services", "mixed", "other"]
    vendor: str = Field(min_length=1)
    total_amount_usd: float | None = Field(default=None, ge=0)
    # WHY ge=0: a negative invoice total is a business-rule violation. Business
    # rules belong IN the schema (checked automatically) not in scattered if-
    # statements (checked by whoever remembered to write one).
    due_date: date | None = None
    # The fallback, encoded as a first-class value of the output type:
    extraction_failed: bool = False
    failure_reason: str | None = None


# Derived, never hand-maintained. This is what the provider call receives.
INVOICE_EXTRACTION_JSON_SCHEMA = InvoiceExtraction.model_json_schema()
