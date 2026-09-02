"""Provider adapter.

This file is where generation gets constrained. It contains:

  1. A DETERMINISTIC FAKE MODEL, so the example runs with no API key, no network,
     and reproducibly in CI. Its outputs deliberately include the failure modes
     this unit exists to teach:
       note 0  clean JSON                          -> passes validation
       note 1  JSON wrapped in markdown fences      -> must be unwrapped, then passes
       note 2  valid JSON, amount "8-12k" (string)  -> Pydantic rejects (type)
       note 3  prose preamble before the JSON       -> json.loads fails
       note 4  wrong key ("amount" not "total_...") -> Pydantic rejects (extra/missing)
       note 5  valid, null due_date                 -> passes (None is a legal value)
       note 6  amount "about six thousand"          -> Pydantic rejects (type)
       note 7  valid                                -> passes
       note 8  valid                                -> passes
       note 9  not an invoice; model answers in     -> json.loads fails
               prose

  2. The two real-call patterns (commented) you'd swap in for the fake.

WHY fake it: an example (and a test suite) that depends on a live model is
non-reproducible: it fails on rate limits, model updates, and offline laptops.
Determinism is a property of good pipelines, and it starts with the test harness.
"""

import json

from schemas import INVOICE_EXTRACTION_JSON_SCHEMA

SYSTEM_PROMPT = (
    "You extract structured invoice data from messy vendor-notes text. "
    "Populate every field you can determine; use null for what is genuinely "
    "undeterminable. invoice_type must be one of: goods, services, mixed, other."
)
# WHY the prompt still matters under constrained decoding: the schema fixes the
# SHAPE of the answer; only the prompt says what the VALUES mean (e.g. that
# "freight + packing materials" is invoice_type "mixed"). Shape is guaranteed;
# semantics are taught.


def _fenced(obj: dict) -> str:
    return "```json\n" + json.dumps(obj) + "\n```"


_FAKE_OUTPUTS = [
    json.dumps({  # 0 clean
        "invoice_id": "INV-3091", "invoice_type": "goods",
        "vendor": "Kestrel Paper Supply", "total_amount_usd": 1284.50,
        "due_date": "2026-09-15",
    }),
    _fenced({  # 1 markdown fences, common even under JSON mode with some providers
        "invoice_id": "INV-77", "invoice_type": "services",
        "vendor": "Northgate Consulting", "total_amount_usd": 4200.00,
        "due_date": "2026-09-20",
    }),
    json.dumps({  # 2 ambiguous amount returned as a string
        "invoice_id": "INV-4102", "invoice_type": "mixed",
        "vendor": "Ridgeline Freight", "total_amount_usd": "8-12k",
        "due_date": "2026-10-01",
    }),
    'Here is the JSON you requested:\n' + json.dumps({  # 3 prose preamble
        "invoice_id": "INV-5521", "invoice_type": "goods",
        "vendor": "Acme Marine", "total_amount_usd": 9999.99,
        "due_date": "2026-09-30",
    }),
    json.dumps({  # 4 wrong key name
        "invoice_id": "INV-2291", "invoice_type": "goods",
        "vendor": "Lumina Solar", "amount": 15000.00,
        "due_date": "2026-09-30",
    }),
    json.dumps({  # 5 valid, null date
        "invoice_id": "INV-8830", "invoice_type": "services",
        "vendor": "Cortland IT Services", "total_amount_usd": 2750.00,
        "due_date": None,
    }),
    json.dumps({  # 6 verbal amount
        "invoice_id": "INV-102", "invoice_type": "services",
        "vendor": "Willow & Birch Landscaping", "total_amount_usd": "about six thousand",
        "due_date": "2026-09-30",
    }),
    json.dumps({  # 7 valid (fluff text ignored by design)
        "invoice_id": "INV-6015", "invoice_type": "goods",
        "vendor": "Duxton Electrical", "total_amount_usd": 640.00,
        "due_date": "2026-09-05",
    }),
    json.dumps({  # 8 valid
        "invoice_id": "INV-9977", "invoice_type": "goods",
        "vendor": "Ferro Steel Supply", "total_amount_usd": 47300.50,
        "due_date": "2026-09-03",
    }),
    (  # 9 not an invoice: the model answers the question instead of extracting
        'The note asks whether Kestrel issued a credit for damaged pallets before '
        'INV-3092 can be approved. No invoice details are present to extract.'
    ),
]


def call_model(note: str, index: int) -> str:
    """Return the model's RAW output for the given note.

    Swap this function body for a real provider call (your 2.4.2 wrapper); nothing
    else in the example changes. Two real-call patterns:

    A) Schema-constrained ("structured outputs"): decoding is sampled against the
       schema, so shape is guaranteed at generation:

        response = client.chat.completions.create(
            model=MODEL,                       # one-line config change (2.4.2)
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "invoice_extraction",
                    "strict": True,
                    "schema": INVOICE_EXTRACTION_JSON_SCHEMA,
                },
            },
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": note},
            ],
        )
        return response.choices[0].message.content

    B) Tool-calling style (e.g. Anthropic): the schema rides in as a forced tool:

        response = client.messages.create(
            model=MODEL,
            tools=[{
                "name": "emit_invoice_extraction",
                "description": "Return the extracted invoice fields",
                "input_schema": INVOICE_EXTRACTION_JSON_SCHEMA,
            }],
            tool_choice={"type": "tool", "name": "emit_invoice_extraction"},
            max_tokens=1024,
            messages=[{"role": "user", "content": note}],
        )
        return json.dumps(response.content[0].input)

    Either way, we STILL validate the result ourselves (extractor.py): the provider
    guarantees what it saw, not what your business rules mean.
    """
    return _FAKE_OUTPUTS[index]
