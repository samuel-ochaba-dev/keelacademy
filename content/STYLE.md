# STYLE.md — the plain-language and copy standard

One source of truth for every piece of text authored in this repo: lessons, unit
manifests, worked examples, completion scaffolds, rubrics, judge prompts, golden
submissions, FAQs, and agent handoffs. When a contract or skill disagrees with
this file, this file wins.

Lesson voice (how prose sounds) is defined separately in `docs/voice.md`.

## Reading level

- Flesch-Kincaid Grade Level 8 or below for all student-facing prose.
  Check with `python content/tools/lint-lesson.py <learn.md> --strict`.
- Sentences are 20 words at most. Most are 10 to 15. Split long sentences.
- Paragraphs carry one idea each and stay short on any screen.

## Word choice

- Explain, then name: plain words first, the formal term second.
- Prefer short, common words. The substitutions table lives at
  `.agents/skills/shiffman-style-lessons/references/voice-guide.md`
  (speed not velocity, delay not latency, check not audit).
- Define every domain term inline on first use.
- Active voice, present tense. Avoid passive constructions.
- Never assume vocabulary the ledger marks as forbidden.

## Copy bans (zero tolerance)

- No em dashes, no en dashes. Use commas, colons, or two sentences.
- No exclamation marks.
- No corporate buzzwords (leverage, synergize, robust, seamless, best-in-class).
- Diagram labels follow the same bans.

## Domain conventions

- Money is integer cents. IDs use CLM-, INV-, ORD-, MCH-, DEL- prefixes.
- Anchor client is OmniCart Operations. Parallel entity is Apex Freight Logistics.

## Verification

- `content/tools/lint-lesson.py <learn.md> --strict` — lesson gate (exit 1 on defects).
- `content/tools/check-unit-consistency.py <unit>` — cross-file agreement gate.
- `node platform/app/scripts/check-mermaid.mjs` — diagram legibility gate.
- Every authoring handoff must paste the output of the checks it claims to pass.
