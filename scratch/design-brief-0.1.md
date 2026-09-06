# Design Brief: Unit 0.1

## Unit

- id: `0.1`
- title: Meet the client: OmniCart Operations
- kind: conceptual
- est_hours: 1
- phase: 0
- prereq_units: `[]`
- gate.unlocks: `["0.2"]`
- build.submission: file
- verify.layers: `[2]`

## Learner baseline

### assumed_learner_state

- Has read the anchor-problem brief (Section 0 of `curriculum.md`).
- Has everyday work experience: has seen a slow process, a complaint, or a refund at work.
- Can write one page of plain English and save a text file.
- Has nothing installed and no project folder yet.

### forbidden_assumptions

Do not assume or use any of these:

- Words: AI, agent, LLM, model, prompt, pipeline, API, Python, Docker, token, embedding, RAG, eval.
- Tools: code editor, terminal, git, GitHub, pytest, Pydantic, FastAPI, Qdrant, LangGraph.
- Concepts: schemas, JSON, functions, tests, containers, databases, vector search, guardrails.
- Any idea of how a computer could solve the problem. The student describes the problem only.
- Any knowledge of Keel Academy grading. That comes in 0.2.

### spiraled_concepts

none, first unit

## Target competency

The student can explain OmniCart's problem to a friend who knows nothing about software. The student can name the three leaders who care and say what each one wants. The student can describe how a return dispute moves through OmniCart today, step by step. The student can describe the faster process OmniCart wants, using real numbers. The student does all of this without naming any technology.

### Essential question

Who is hurt when a return dispute waits three days, and what would "fixed" look like to each of them?

### Enduring understanding

A good system starts with a clear picture of the people, the paperwork, and the money. If you cannot state the problem plainly, you are not ready to fix it.

## Deliverable spec

The student writes one markdown file: `omnicart-system/docs/client-brief.md`.

Word budget: 250 words minimum, 500 words maximum. One page. (Orchestrator change after playtest: 300 forced padding.)

Required headings, verbatim, in this order:

1. `# OmniCart Operations: Client Brief`
2. `## The problem`
3. `## Who cares and why`
4. `## How it works today`
5. `## How it should work`

What must appear in each part:

- **The problem.** Three sentences or fewer. What breaks, who it hurts, what it costs. Mentions monthly volume and current wait.
- **Who cares and why.** Three roles: VP of Operations (Sarah Jenkins), CFO, Trust and Safety Officer. One line each on what "done" means to that person. The three must differ.
- **How it works today.** Numbered steps, 4 to 7. Starts when a return request arrives. Ends when a refund is paid or denied. Names the papers a clerk reads: order receipt, delivery slip, unboxing photo, return policy.
- **How it should work.** Numbered steps, 4 to 7. Same start and end. States the target wait. A person still reviews hard cases. Every refund is tracked to the cent.

Numbers the student must use, taken from the ledger:

- Volume: about 4,000 return requests, damage claims, delivery slips, and payout disputes per month.
- Current turnaround: 2 to 3 days before review begins.
- Target turnaround: under 1 hour, with zero lost tickets.
- Money: integer cents. A refund of $45.20 is written as 4520 cents. At least one amount must appear.
- IDs, if used: CLM-#####, ORD-#####, INV-#####, MCH-####, DEL-#####. Example: CLM-20841.

Banned-words rule: the file must not contain AI, agent, LLM, model, prompt, or automation. Any hit fails. The student says what should happen, not what tool does it.

## Rubric guidance

| id | description | anti-criterion |
|---|---|---|
| `problem-stated-plainly` | The problem names the volume, the wait, and who is hurt in three sentences or fewer. | Do not reward long or dramatic writing. |
| `three-stakeholders-differ` | Each role gets one line, and the three definitions of done clearly differ. | Do not fail for missing the name Sarah Jenkins. Role is enough. |
| `current-process-traceable` | Today's steps run in order from request to payout and name the four documents a clerk reads. | Do not grade exact step count or timing per step. |
| `target-process-measurable` | The target states under 1 hour, keeps a human on hard cases, and tracks money in integer cents. | Do not reward any mention of technology. |

Banned words are a hard gate, not a scored criterion: any hit is an automatic fail.

## Retrieval seeds

1. OmniCart handles about 4,000 returns, claims, slips, and disputes each month.
2. Today a dispute waits 2 to 3 days before anyone reviews it.
3. The VP wants speed, the CFO wants every cent tracked, the policy officer wants rules followed.
4. Money is always written as whole cents, so $45.20 becomes 4520.
5. State the problem in plain words before you name any fix.

## Project delta

Adds `omnicart-system/` as the project root and `omnicart-system/docs/client-brief.md` with the five headings.

Contract for later units:

- The folder name `omnicart-system` is fixed. Every later unit adds files under it.
- `docs/client-brief.md` is a living file. Later units append, never replace.
- The five headings are stable anchors. Later units add sections below them.
- The brief's numbers (4,000 per month, under 1 hour, integer cents) are the targets later tests check.

## Parallel entity task (Apex Freight Logistics)

The assessment_engineer writes `apex-freight/docs/client-brief.md` with the same five headings, in the Apex domain.

Facts from the ledger: Apex is a regional freight broker in Indianapolis. It checks about 3,500 carrier document packages each month across 300 motor carriers. A package holds a rate confirmation, a bill of lading, a driver detention log, a damage claim, and a carrier invoice.

Invented stakeholders:

- Marcus Bell, Director of Carrier Operations. Wants each package checked in 1 hour instead of 2 days.
- Priya Nair, Controller. Wants every carrier payment tracked in whole cents with a record nobody can change.
- Dana Okafor, Claims and Compliance Lead. Wants detention pay rules and damage photo standards applied the same way every time.

The Apex brief must:

- State the problem in three sentences using 3,500 packages and 300 carriers.
- Today's steps: package arrives, clerk matches invoice to rate confirmation, checks bill of lading, reviews detention log, approves or short pays.
- Target steps: same start and end, under 1 hour, a human on hard cases.
- One money amount in integer cents, such as a detention charge of 12500 cents.
- IDs in the same shape: INV-#####, DEL-#####, CLM-#####.
- No banned words. The example must model the rule.

## Handoff notes

### assessment_engineer

- Write the Apex example first, then a completion problem that asks for one OmniCart section only.
- Keep the Apex brief between 300 and 500 words.
- Run a banned-word check on your example before handoff.

### rubric_evaluator

- Refine the four criteria. Keep the banned-word check as a pass or fail gate outside the score.
- Do not grade formatting beyond the five headings.
- Accept "Trust and Safety Officer" and "Policy Officer" as the same role.

### pedagogical_author

- Grade 8 or below. Sentences 20 words or fewer. No dashes, no exclamation marks.
- Explain, then name: say "a record nobody can change" before "audit trail".
- Do not mention Docker or Python, even as a teaser for 0.3.
- Show the Apex example in full, then give the empty OmniCart headings.

### blind_playtester

- Play as someone with no tech background and one hour.
- Write the brief using only the lesson and Section 0 of `curriculum.md`.
- Report any place you wanted to name a tool. That is a lesson leak.
- Flag it if the write takes over 60 minutes.
