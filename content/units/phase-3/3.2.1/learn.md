# Unit 3.2.1 — JSON mode and function-calling-style structured outputs

*Phase 3 · Prompt engineering as a discipline · Estimated 6 hours*

**Where you are in the Meridian system:** your Phase 1/2 claim extractor answers the
question "what is in this claim?" — but it answers in prose. Everything downstream of
it (routing, reserves, the adjuster dashboard) needs *fields*, not sentences. This unit
is where your extractor starts speaking in structures a machine can trust.

**How to read this lesson.** It has three layers, and they age at different speeds:

1. **Concept core** — why free-text output is unusable for downstream systems. True in
   2020, true today, true in five years. Read it slowly; everything else rests on it.
2. **Applied context** — the same ideas, concretized in the Meridian claim pipeline.
3. **Tool specifics** — the current provider APIs and Pydantic patterns you'll actually
   type. This layer goes stale; it is freshness-audited on the date above.

---

## Concept core

### The receiving program cannot read

An LLM produces a stream of tokens. When those tokens spell out English prose, *you*
can read the answer — but your program is not you. Somewhere between "the model
responded" and "the database row was written," a piece of code has to turn tokens into
typed values: this substring is the claim type; that substring is the dollar amount;
this date-shaped thing is the loss date.

That conversion step is where free-text systems die, for a reason that is easy to state
and worth internalizing: **natural language is a interface designed for lossy,
error-correcting human readers, and programs are neither lossy nor error-correcting.**
When a human reads "the fire damage looks like maybe $40k, could be more once the
adjuster visits," they silently normalize: *amount ≈ 40000, confidence = low*. A program
doing `response.split(":")[1]` gets `" maybe $40k, could be more once the adjuster
visits\n"` and writes garbage downstream — or crashes.

So the real question of this unit is not "how do I make the model output JSON." It is:
**where is the contract between the model and my system, and who enforces it?**

### Parsing fragility: the contract that lives in the prompt

The naive approach: put "Respond ONLY with JSON in this format: {...}" in the prompt
and call `json.loads` on the output. This feels like it works — in the demo. Then it
meets the real world:

- The model opens with "Here is the JSON you requested:" — `json.loads` fails on the
  first token.
- The model wraps the JSON in markdown fences ```` ```json ... ``` ```` — fails.
- The model emits valid JSON *with a trailing comma*, or single quotes, or an unescaped
  newline inside a string — fails, or worse, "succeeds" on the wrong bytes.
- The model, being helpfully conversational, appends "Let me know if you'd like the
  claim number in a different format!" — fails.
- The model produces *valid JSON of the wrong shape*: `{"claim_type": "fire"}` when
  your code expects `{"claimType": "fire"}`. `json.loads` succeeds; your code crashes
  three functions later, far from the cause.

Notice the pattern: with a prompt-level promise, **the contract exists only as a
request**. Every failure mode above is the model behaving *within normal variation* for
a text generator. You are not catching the model misbehaving; you are catching it
behaving like a text generator while hoping it wouldn't.

A useful exercise before reading on: take any prompt-promised-JSON extractor you've
written and run it 100 times on the same input. Plot the distinct output *shapes* you
get (keys present, their types). For most models and most prompts, you'll find more
than one shape. That variation is not a bug you can prompt away; it is the medium you
are working in.

### Schema contracts: move the promise out of the prompt and into the interface

The fix is architectural, not rhetorical. A **schema contract** says: the consumer
expects exactly this structure — these fields, these types, these constraints — and
the *interface* enforces it, not the request. Enforcement can happen at two points,
and mature systems use both:

1. **At generation (constrained decoding).** The provider samples the model so that
   only tokens satisfying the schema can be produced. This is what provider "JSON
   mode" and function-calling-style / structured-output APIs do. The promise moves
   from the prompt into the API call.
2. **At ingestion (validation).** Whatever the provider hands back, your code parses
   it against an explicit schema and either gets a typed object or a *named, typed
   failure*. This is what Pydantic gives you.

Why both? Because they fail differently, and defense in depth is cheap here:

- Constrained decoding guarantees *syntax and shape* against the schema the provider
  saw — but the schema you send a provider is usually a subset of what you actually
  mean (providers accept JSON Schema; they don't know your business rules), and
  providers change behavior, models get swapped, proxies get misconfigured. Never let
  a downstream system trust a guarantee you didn't check yourself.
- Validation at ingestion guarantees *your* definition of correct, at the boundary
  where data enters *your* system — and it produces a failure you can handle at the
  moment it happens, with the offending input still in hand.

The mental model to keep: **the model is an unreliable network endpoint that happens
to speak fluent JSON.** You wouldn't build a payments system that `eval`s whatever a
third-party API returns; don't build a claims pipeline that trusts whatever a model
returns. Same discipline, same place: validate at the boundary.

### Graceful degradation: failure is a state, not an exception

Once you validate, you must answer the question the naive approach got to ignore:
*what happens when validation fails?*

There are exactly four options, and three of them are wrong for production:

1. **Crash.** An unhandled exception takes the whole batch down because claim #7 of 20
   was malformed. One bad input has become an availability incident.
2. **Silently drop.** `try/except: continue`. The pipeline reports 19 outputs for 20
   inputs and *nobody notices for six weeks* — until an auditor asks why claim
   #CLM-88231 was never routed. In insurance, in finance, in anything regulated,
   silent drops are the worst failure mode on this list, because they are invisible
   and they are data loss.
3. **Silently pass through bad data.** Skip validation and forward the raw output.
   Now garbage is in the database wearing the costume of a validated record.
4. **Degrade gracefully — the only production answer.** Validation failure produces a
   *defined fallback value* (a valid object in every place a real one would be, but
   explicitly marked as failed extraction), and the failure is *logged with the input
   identity and the reason*, so a human or a retry process can find it later.

Write this pattern into memory now, because it recurs in every unit from here on:

```
inputs → [ generate → validate → success? pass through : fallback + log ] → outputs
```

Two properties define it, and both are checkable:

- **Conservation:** N inputs yield exactly N outputs (some may be fallbacks). Nothing
  vanishes.
- **Accountability:** every fallback has a log record naming the input and the reason.
  Nothing vanishes *silently*.

A fallback is not a hack — it is a design decision that "I could not extract this
claim" is *information about the claim*, representable in your schema, rather than an
error in your program. Unit 3.2.2 builds directly on this: the `needs_human_review`
flag you'll add there is just the fallback made honest and permanent.

### The one-paragraph summary you must be able to reproduce

Free-text model output is unusable downstream because parsing it means hoping the
model kept a promise that existed only in a prompt, and hope is not a contract. Move
the contract into the interface: constrain generation (provider structured-output
APIs) *and* validate ingestion (a schema enforced in your code, at the boundary).
When validation fails — and over enough messy input, it will — degrade gracefully:
emit a defined fallback and log the failure with its input and reason. N inputs, N
outputs, zero silent drops.

---

## Applied context

Now the same ideas, wearing Meridian Mutual's badge.

### The situation

Meridian's intake team pastes claim reports into a web form. The raw notes are exactly
the "messy real-world-style claim texts" the curriculum promises: typos, mixed
formats, occasional missing fields, and the odd note that isn't a claim at all. Your
Phase 1/2 extractor reads a claim record and summarizes it. The Phase 3.2 upgrade:
`extract_claim(record) -> ClaimExtraction` — a typed, validated object, every time.

Here is the schema you'll build against (you'll refine it in 3.2.2):

```python
from datetime import date
from pydantic import BaseModel, Field

class ClaimExtraction(BaseModel):
    claim_id: str
    claim_type: str          # "fire" | "water" | "auto" | "liability" | "other"
    severity: str            # "low" | "medium" | "high"
    estimated_amount_usd: float | None = None
    loss_date: date | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None
```

Look closely at the last two fields — they are the fallback, *encoded in the schema*.
That is the trick worth stealing: a fallback isn't `None` or an exception, it's a
first-class value of the output type. Every consumer of a `ClaimExtraction` can check
`extraction_failed` without knowing anything about how the extraction happened.

### The pipeline, end to end

```
raw claim record
   │
   ▼
prompt (task + schema description)          ── still needed: the model must know
   │                                           WHAT to extract and what values mean
   ▼
provider call with structured output         ── the contract: generation constrained
   │                                           to the schema's shape
   ▼
json.loads ──► ClaimExtraction.model_validate ── the contract enforced again, by you
   │                                              with business rules (amount >= 0,
   │                                              dates are real dates, ids match
   │                                              the input's id)
   ├── success ──► validated ClaimExtraction
   └── ValidationError ──► fallback ClaimExtraction (extraction_failed=True,
                           failure_reason=...) ──► logged with claim_id
```

### A concrete failure, walked through

One of the twenty texts in your data variant reads something like:

> "CLM-20841 — kitchen fire, tenant says smoke damage mostly cabinets. Probably
> 8-12k?? received 3rd. landlord report pending"

Watch each layer do its job:

- **Generation constraint** guarantees the model returns a JSON *object* — not prose,
  not fences. Good.
- The model, reasonably, returns `{"estimated_amount_usd": "8-12k"}` — a *string*,
  because the amount genuinely is ambiguous. Syntax-valid, shape-wrong.
- **Pydantic** rejects it: `estimated_amount_usd` must be a number or null. This is
  not a failure of the system — this is the system *working*. A claim with a
  genuinely ambiguous amount should not quietly become `estimated_amount_usd: 10.0`
  (the model guessing a midpoint) or crash the batch.
- Your **fallback path** produces:
  `ClaimExtraction(claim_id="CLM-20841", claim_type="fire", severity="medium",
  estimated_amount_usd=None, extraction_failed=True, failure_reason="estimated_amount_usd: Input should be a valid number")`
  and appends a log line: `2026-08-21T14:03:11 FALLBACK claim_id=CLM-20841 reason='estimated_amount_usd: Input should be a valid number'`.
- Net result: 20 inputs in, 20 objects out, 1 flagged for review with its reason on
  record. The adjuster who opens CLM-20841 sees a flagged extraction, not a crash and
  not a confident guess. In 3.2.2 you'll sharpen exactly this distinction.

### Why Meridian specifically cares

Meridian is an insurer. Every claim is a regulated financial obligation with audit
trails. If your pipeline silently drops malformed claims, those claims still exist in
the real world — they're just claims nobody has looked at, which is how regulatory
findings and bad-faith lawsuits happen. "Fail loudly per-record, never silently" is
not a style preference here; it's the difference between a demo and something an
insurance-operations team would let touch production. When you write your Build for
this unit, the Prove-it bar — *20 texts in, 20 valid objects out, failures logged not
dropped* — is encoding exactly this property.

### What you'll reuse from earlier phases

- **2.4.2 (provider abstraction):** your multi-model wrapper is where the structured
  output call plugs in — one config change to switch models, same schema contract.
- **1.5.1 (pytest):** the conservation property (N in → N out) is a *test*, and you'll
  write it. Properties you don't test are properties you don't have.

---

## Tool specifics

<!-- FRESHNESS-AUDITED LAYER: The APIs, library versions, and code patterns in this
     section are current as of last_verified.tool_specifics above. Provider APIs
     change; this section is re-audited quarterly and MUST NOT be assumed correct
     past its audit date. The concept core and applied context layers do not have
     this problem. -->

Everything below is the layer you type today. APIs named here will drift; the
contracts they implement (constrain generation, validate ingestion, degrade
gracefully) won't. When something below doesn't match current docs, trust the
contract, update the call.

### Provider structured-output mechanisms (as of the audit date)

The major hosted providers all offer some form of schema-constrained generation,
falling into two families:

**JSON mode** — the model is constrained to emit syntactically valid JSON, but *no
particular schema*. You get "guaranteed parseable," not "guaranteed the right shape."
Better than prompt-promising, insufficient alone: shape errors (wrong keys, string
where you expect number) still happen and must be caught by validation.

```python
# OpenAI-style: response_format={"type": "json_object"} (family: JSON mode)
response = client.chat.completions.create(
    model="gpt-4o-mini",
    response_format={"type": "json_object"},   # guarantees valid JSON syntax only
    messages=[{"role": "user", "content": prompt}],
)
data = json.loads(response.choices[0].message.content)
```

**Structured outputs / tool-calling style** — you pass a JSON Schema (directly, or as
a "tool"/"function" definition) and the provider constrains decoding so the output
satisfies it. This is the stronger family and the default choice for pipelines:

```python
# OpenAI-style: strict structured outputs (family: schema-constrained)
response = client.chat.completions.create(
    model="gpt-4o-mini",
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "claim_extraction",
            "strict": True,
            "schema": CLAIM_EXTRACTION_JSON_SCHEMA,   # JSON Schema dict
        },
    },
    messages=[{"role": "user", "content": prompt}],
)
data = json.loads(response.choices[0].message.content)
```

```python
# Anthropic-style: tool-calling used as structured output. You define a "tool"
# whose input_schema IS your schema; forcing the tool makes the model's tool_use
# block carry schema-constrained arguments.
response = client.messages.create(
    model="claude-sonnet-4-5",
    tools=[{
        "name": "emit_claim_extraction",
        "description": "Return the extracted claim fields",
        "input_schema": CLAIM_EXTRACTION_JSON_SCHEMA,
    }],
    tool_choice={"type": "tool", "name": "emit_claim_extraction"},
    max_tokens=1024,
    messages=[{"role": "user", "content": prompt}],
)
data = response.content[0].input   # the tool_use block's arguments
```

Practical notes that bite people:

- **Strict mode has rules.** OpenAI's `strict: True` requires `additionalProperties:
  false` on every object and *all* fields in `required` (make genuinely-optional
  fields nullable unions, e.g. `["anyOf", ...]` with `"type": "null"`), and it
  supports a subset of JSON Schema keywords. Constraints like `minimum` may be
  ignored by the sampler — another reason your own validation stays.
- **Enum-constrain categorical fields in the schema** (`claim_type` as an enum of
  your five values) so "FIRE DAMAGE" never reaches Pydantic in the first place.
- **The prompt still matters.** The schema says what shape to emit; the prompt says
  what the values *mean* ("`severity: high` means structural damage or habitability
  loss, not a big dollar figure alone"). Constrained decoding fixes the shape of the
  answer, not the correctness of its contents.
- **You still describe the schema in the prompt when using JSON mode**, since nothing
  else tells the model what keys to use. With schema-constrained APIs you can keep
  the prompt about meaning only.
- Free/open-weight models served locally (e.g. via vLLM, Ollama) commonly expose a
  `json_schema` / `guided_json` parameter implementing the same idea; the parameter
  name varies by server, the contract doesn't.

### Getting the JSON Schema from Pydantic (single source of truth)

Write your schema once — as a Pydantic model — and derive the JSON Schema you send
the provider from it. One definition, used at both enforcement points:

```python
from pydantic import BaseModel, Field

class ClaimExtraction(BaseModel):
    claim_type: str = Field(description="fire|water|auto|liability|other")
    severity: Literal["low", "medium", "high"]
    estimated_amount_usd: float | None = Field(default=None, ge=0)
    loss_date: date | None = None
    extraction_failed: bool = False
    failure_reason: str | None = None

# JSON Schema for the provider call — generated, never hand-maintained:
CLAIM_EXTRACTION_JSON_SCHEMA = ClaimExtraction.model_json_schema()
```

Keep a single source of truth and derive everything else. Hand-maintaining a JSON
Schema *and* a Pydantic model guarantees they drift apart, and the drift always lands
in production.

### Pydantic v2 validation patterns you'll use in this unit

```python
# 1. Validation — the boundary check (raises pydantic.ValidationError on bad shape)
try:
    extraction = ClaimExtraction.model_validate(data)
except ValidationError as exc:
    # exc.errors() is a list of dicts: loc, msg, type, (input)
    reason = "; ".join(f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors())
    fallback = ClaimExtraction(
        claim_id=record_id, extraction_failed=True, failure_reason=reason
    )
    log_fallback(record_id, reason)
    return fallback

# 2. Extra keys — reject them so a model adding "helpful" fields fails loudly:
class ClaimExtraction(BaseModel):
    model_config = ConfigDict(extra="forbid")

# 3. Constrained fields — business rules live in the schema, not in if-statements:
    estimated_amount_usd: float | None = Field(default=None, ge=0)

# 4. Custom coercion guard — Pydantic v2 coerces "40000" (str) to 40000.0 (float).
#    That's usually good. If you need strict typing at the boundary:
    model_config = ConfigDict(strict=True)   # decide deliberately, not by accident
```

Also know: `model_validate_json(text)` parses and validates in one step (and is
faster than `json.loads` + `model_validate`); `TypeAdapter(list[ClaimExtraction])`
validates a whole batch; `model_dump()` / `model_dump_json()` serialize back out.

### Fallback + logging, concretely

```python
import json, logging, uuid
from pydantic import ValidationError

logger = logging.getLogger("meridian.extraction")

FALLBACK_TEMPLATE = "claim {cid}: extraction failed ({reason}) — flagged for review"

def extract(record: dict) -> ClaimExtraction:
    raw = call_model(record["notes"])                  # your 2.4.2 wrapper
    try:
        data = json.loads(raw)
        data["claim_id"] = record["claim_id"]          # conservation: id from input
        return ClaimExtraction.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as exc:
        reason = str(exc)[:500]
        logger.error(FALLBACK_TEMPLATE.format(cid=record["claim_id"], reason=reason))
        return ClaimExtraction(
            claim_id=record["claim_id"],
            extraction_failed=True,
            failure_reason=reason,
        )
```

And the test that makes the Prove-it bar a property, not a hope (reuse from 1.5.1):

```python
def test_twenty_in_twenty_out_no_silent_drops(messy_claims):
    results = [extract(r) for r in messy_claims]       # 20 messy inputs
    assert len(results) == 20                           # conservation
    assert all(isinstance(r, ClaimExtraction) for r in results)
    failed = [r for r in results if r.extraction_failed]
    # accountability: every fallback has a recorded reason
    assert all(r.failure_reason and r.claim_id for r in failed)
```

### What you now do (Practice → Build)

1. **Practice:** run the worked example (an invoice-notes extractor — same structure,
   different domain, so you can't copy it into your Build), then complete the gap
   version until its checks pass.
2. **Build:** rebuild *your* Meridian claim extractor to return a validated
   `ClaimExtraction` every time, with the defined fallback above, and prove it: 20
   messy claim texts from your data variant in → 20 valid schema objects out, every
   failure logged, none dropped.
