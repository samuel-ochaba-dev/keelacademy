# Unit 0.1: Meet the client, OmniSupply Operations

::: phase learn

You are being hired to fix an operations problem, not to deploy a model. This unit gives you the client, the numbers, and the constraints that every later unit builds against. Read it once now, and once more before you write your brief.

## The idea

### Lead with the problem, not the stack

A consultant opens a meeting with an operations director like this: "We are going to build a multi-agent workflow with hybrid vector retrieval, a fine-tuned adapter, and sub-second streaming inference." Nothing in that sentence tells the director what changes on Monday morning.

Technical vocabulary describes tools. It does not describe the work those tools are supposed to absorb. Lead with the stack and two things go wrong. You commit to a solution before you have a problem. And you lose the ability to diagnose later: when the system invents a credit amount, runs over budget, or drops records under load, you cannot tell whether the architecture was wrong or whether you misread the workflow on day one.

So start by answering four questions in plain language.

- What arrives at the company, in what formats, at what volume?
- Who reads it, and what decision do they make?
- What does a wrong or late decision cost?
- What number does the business check at month end?

Once you can describe the workflow without the words "AI", "LLM", "agent", or "model", most of the architecture is already decided. You can see where validation has to be deterministic, where probabilistic extraction is acceptable, and where a person has to stay in the loop.

> **Gotcha: the buzzword reflex**
> Asked to summarize a client's problem, most people answer with an implementation: "they need an AI agent to read invoices." That is a proposal, not a problem. The problem is "they process 4,000 multi-format records a month with a 3-day manual backlog that consumes 60% of senior specialist time." State the pain, then name the tool.

### Success has more than one definition

Every deployment has more than one person who can stop it. At OmniSupply three of them matter, and their pressures conflict.

The **operations manager** owns turnaround. They want resolution in hours instead of days, because merchant partners who wait start withholding payment. A system that is accurate and takes four days fails their test.

The **compliance officer** owns the audit trail. They want a contract or SLA citation behind every price adjustment and credit memo. A system that triages in five seconds by inventing credit amounts creates exposure they will not sign off on.

The **CFO** owns unit economics. They want cost per transaction low enough that automation nets out positive. A system that reaches 99% accuracy at $45 of inference per invoice gets cancelled inside a quarter.

Your job is to hold all three at once: fast triage, verifiable citations, and a cost ceiling. Trade auditability for speed and compliance blocks the launch. Trade cost for accuracy and finance closes the budget.

### Checkpoint

> **Predict, then check.** An engineer ships a pipeline that processes an invoice in 15 seconds with no human involvement. It resolves 98% of line items correctly. For the other 2% it calculates a credit adjustment without citing the vendor contract section.
>
> Who objects first, and why?

The compliance officer. An uncited financial adjustment cannot be audited. To compliance, a system that cannot quote the clause governing a return penalty is indistinguishable from a person guessing at numbers. Speed does not substitute for provenance.

## OmniSupply's situation

### The company

OmniSupply Operations is a regional B2B wholesale and retail distributor: 120 employees, thousands of commercial SKUs, hundreds of manufacturing suppliers, three product categories.

- Commercial electronics and hardware
- Industrial safety equipment
- Commercial kitchen and hospitality supplies

About **4,000 transactions arrive per month**. They come in as scanned PDF invoices with messy OCR, freight packing slips scanned at the loading dock, warehouse receiving logs, mobile photos of damaged freight, and unstructured dispute emails from retail merchants.

### How the work happens today

Invoice reconciliation and dispute triage are manual from end to end.

1. **Intake is fragmented.** Documents arrive as email attachments, dock scans, phone photos, and free-text email. No common format, no single entry point.
2. **Cross-referencing is by hand.** A specialist opens each document, matches item codes and quantities against the original purchase order and the warehouse intake database, checks damage claims against supplier return terms, then looks for duplicate billing or return fraud.
3. **The queue is days deep.** One disputed delivery takes 30 to 45 minutes of lookups, so disputes wait 2 to 3 business days before triage even starts.

### What that costs

- **Merchants hold payment.** Retail partners waiting days for a credit memo withhold payment on the whole account, or move volume to another distributor.
- **Discrepancies go unclaimed.** Rushed specialists miss supplier overbilling, and miss volume rebates before the contractual deadline passes.
- **Senior time goes to copying.** Up to 60% of a senior specialist's hours go to moving numbers between a PDF viewer and internal software instead of resolving the hard exceptions only they can handle.

### What you build instead

Across the technical phases you replace that queue with a pipeline that does five things in order.

1. Validate every incoming file against a schema, so malformed input is caught at the boundary instead of halfway down the pipeline.
2. Extract purchase orders, line items, and amounts into typed records.
3. Ground each disputed line against the supplier contract and SLA terms.
4. Assemble an adjustment recommendation together with the clauses it rests on.
5. Hand that package to a specialist for sign-off.

Nothing in that list is a model choice. Model choices come later, and they get justified against these constraints rather than the other way round.

## What you will produce

### The client brief

Your deliverable for this unit is the OmniSupply Operations client brief. It is the charter every later phase refers back to. Four sections, all required.

1. **Executive summary.** The business problem in plain language: 4,000 transactions a month, the formats they arrive in, the 2 to 3 day triage delay. No technical vocabulary at all.
2. **Stakeholder scorecards.** Three profiles with concrete numbers: operations (triage speed and backlog), compliance (auditability and citation rules), finance (cost per transaction).
3. **Current and target workflow.** The document lifecycle from receipt to settlement, naming today's failure mode at each step and the control that replaces it.
4. **Target system requirements.** Latency target, cost ceiling, audit requirements, and the points where human sign-off is mandatory.

The targets for this client are triage inside 2 hours, cost under $2.50 per transaction, and a citation behind every adjustment.

::: phase practice

## Practice before you write it

Knowing what a brief has to contain and writing one are different skills, and the gap between them is where an afternoon usually goes.

So we work the shape three times before you point it at OmniSupply: twice with a pen, once on a finished brief for somebody else, and once on a brief with its load-bearing parts taken out.

::: route

Start with the two that need nothing but a pen.

**Strip the jargon.** Rewrite this sentence: "We need an intelligent agentic LLM architecture using RAG to automatically process invoice PDFs and detect fraud."

One good answer: "We need a pipeline that extracts line items from incoming invoice PDFs, compares them against purchase orders and vendor contract terms, and flags billing discrepancies for review." The functional requirements only become visible once the vocabulary goes: ingestion, purchase order comparison, contract verification, discrepancy flagging.

**Balance the three.** An operations manager proposes: "If a damage claim is under $100, approve the merchant credit in 30 seconds without checking the supplier return agreement." How do you keep the speed and still satisfy compliance and finance?

One good answer: fast-track claims under $100, but verify each one against an active supplier warranty agreement by automated contract lookup. If the agreement is active, approve immediately and write the cited clause into the event log. If there is no valid agreement, or the supplier excludes returns on that SKU category, route the claim to a specialist queue. Operations gets sub-minute triage, compliance gets a citation on every approval, and finance stops paying out credits it cannot recover from the supplier.

**Optional: trace a lifecycle.** Take a disputed shipment of commercial espresso machines, 2 units damaged in transit against a $3,400 invoice. Sketch the five steps from the dock photo to the accounting credit memo, and mark where data or time is most likely to be lost.

Now the finished one. It is a brief for Apex Casualty Underwriters, a different company with a different problem, so read it for shape rather than for content: where the numbers sit, how the three scorecards are phrased, what a workflow step looks like when it names its own failure mode. Nothing in it drops into yours, which is deliberate.

::: worked-example

Then the same brief with its load-bearing parts removed, so you put them back rather than recognise them.

::: workbench

Last, close the lesson.

The drills below want these ideas back in your own words, from memory, with nothing in front of you. That is harder than re-reading, and it is harder in the way that makes an idea stay available at four in the afternoon when a stakeholder pushes back. Anything you get wrong comes back to you in a few days.

::: retrieval

::: phase build

## Now write OmniSupply's

Four sections, the numbers above, and no technical vocabulary in the executive summary. That last constraint is the one people break first, so write the summary, then read it back and delete every word a director would have to ask about.

::: deliverable

::: submission

::: phase verify

## How this gets graded

There is no code in this unit, so nothing runs in a container. Your brief is read against a rubric, criterion by criterion, and a reviewer has to quote your own words for every one of them. Read the criteria before you write, not after.

::: prove-it

::: grading-modes

::: rubric

::: phase unstuck

## When it breaks

Two things go wrong here often enough to be written down rather than left for you to find.

::: unstuck

If yours is not on that list, the fix is usually to go back to the four questions at the top of this unit and answer them in order, out loud. A brief that will not come out cleanly is nearly always a workflow you cannot yet describe without naming a tool.

::: phase ask

## Ask about this unit

There is an assistant on this page that has read this lesson and nothing else, so it answers about OmniSupply, the three scorecards and the shape of a brief rather than about consulting in general. Ask why a constraint matters, ask for another rewrite to practise on, or paste a paragraph of your own summary and ask what a director would still have to ask about.

It is an AI, not a person, and it will not write your brief. Once you have finished the practice route above it stops handing over answers and works questions through with you instead.

::: ask

One last thing to carry forward. A model is not a product. It is an untrusted, probabilistic component inside a system you are accountable for. Framing OmniSupply's problem as volumes, formats, turnaround and three scorecards gives you the bar your code gets measured against for the rest of the curriculum.

Unit 0.2 covers how that measuring works: automated checks, rubric review, and the questions you answer about your own code.



