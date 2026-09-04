# Unit 0.1 Completion Exercise: OmniSupply Operations Client Brief

In the worked example, you studied an annotated, executive-grade client brief for Apex Freight Logistics. Now, you will author the complete Client Brief for your anchor client: **OmniSupply Operations**.

OmniSupply is a mid-sized regional B2B wholesale and retail distributor handling thousands of product SKUs across hundreds of suppliers. They process approximately 4,000 vendor invoices, shipment delivery receipts, damaged goods claims, and return dispute tickets each month. Today, manual cross-referencing causes a two to three business day triage delay before any dispute resolution can begin.

Your deliverable is a formal Client Brief that frames OmniSupply's operational reality, balances competing leadership scorecards, maps document workflows, and defines quantitative human escalation boundaries without using technology buzzwords.

---

## Submission Instructions and Constraints

Before filling out the scaffold below, review these strict requirements:

1. **Word Budget:** Your completed brief must contain between **600 and 1,200 words** (including table content). Briefs under 600 words lack required operational detail; briefs over 1,200 words fail executive conciseness.
2. **Strict Markdown Structure:** You must maintain the exact markdown section headings:
   - `## 1. Problem Statement (Plain Language)`
   - `## 2. Stakeholder Success Scorecards`
   - `## 3. Operational Workflow Mapping (5 Intake Formats)`
   - `## 4. Quantitative Human-in-the-Loop (HITL) Escalation Triggers`
   Do not alter or rename these headings.
3. **Zero Jargon Rule:** The problem statement and operational descriptions must contain **zero technical buzzwords**.
   - **Banned words:** `AI`, `artificial intelligence`, `LLM`, `large language model`, `agent` (referring to software/systems; use human job titles such as "Purchasing Specialist" or "Dispute Specialist" to avoid triggering automated checkers), `autonomous agent`, `machine learning`, `ML`, `neural network`, `prompt`, `prompt engineering`, `GPT`, `transformer`, `RAG`, `vector database`, `embeddings`, `fine-tuning`.
   - **Grading impact:** The automated rubric judge checks for these terms. Any occurrence of a banned term in your problem statement or core brief will produce an immediate failure on the `zero-jargon` criterion. Name physical records, operational processes, validation checks, and business constraints instead.
4. **Style and Copy Constraints:**
   - Do not use em dashes or en dashes. Use colons, commas, parentheses, or separate sentences.
   - Do not use exclamation marks.
   - Maintain a professional, executive register with concrete metrics.

---

## Client Brief Template (Fill-In Scaffold)

Copy the scaffold below into your workspace, read the prompt guides in each section, and replace the placeholder text with your authored brief.

```markdown
# OmniSupply Operations Client Brief

## 1. Problem Statement (Plain Language)

> **Prompt Guide:**
> Write exactly three sentences describing OmniSupply's core operational problem.
> - Sentence 1: State the monthly transaction volume (approximately 4,000 items) and list the five intake formats (scanned PDF invoices, freight packing slips, warehouse delivery photos, emailed supplier correspondence, customer dispute tickets).
> - Sentence 2: Describe the manual verification mechanics (operations specialists manually matching item codes, quantities, and damage claims against purchase orders, warehouse intake databases, and vendor return terms).
> - Sentence 3: State the business bottleneck and financial consequence (two to three business day triage backlog, delayed merchant credit memos, specialist overtime, and missed supplier rebate filing deadlines).
> Constraint: Zero buzzwords. Do not mention AI, LLMs, agents, or automation software.

[Replace this text with your 3-sentence zero-jargon problem statement]


## 2. Stakeholder Success Scorecards

> **Prompt Guide:**
> Define distinct, quantitative success criteria for each of the three key stakeholders.
> Each profile must include:
> 1. Primary Objective: The core business goal for that leader.
> 2. Key Metrics: At least two measurable numerical targets (e.g. latency, cost, percentage).
> 3. Operational Constraint: A hard boundary or rule that the system must never violate.
> Make sure the three scorecards compete with each other (speed vs compliance vs cost).

### Operations Management: VP of Operations (Sarah Jenkins)
- **Primary Objective:** [State core operational goal: triage speed, queue backlog reduction, and specialist workload capacity]
- **Key Metric 1:** [Quantified turnaround time target, e.g. reducing triage latency from 2 to 3 business days to under 2 hours]
- **Key Metric 2:** [Quantified throughput or capacity target, e.g. shifting 70% of senior specialist hours from manual data entry to exception resolution]
- **Operational Constraint:** [State hard operational constraint, e.g. zero dropped dispute files; all inbound items must be indexed and tracked within 15 minutes of receipt]

### Governance and Compliance: Regulatory and Contract Compliance Officer
- **Primary Objective:** [State core compliance goal: auditability, contractual verification, and legally defensible vendor dispute records]
- **Key Metric 1:** [Quantified audit target, e.g. 100% of approved credit memos and price adjustments must link directly to verbatim supplier agreement clauses]
- **Key Metric 2:** [Quantified verification target, e.g. zero unverified write-offs during annual vendor accounting audits]
- **Operational Constraint:** [State hard compliance constraint, e.g. mandatory human review on any ambiguous contract terms, return claims exceeding specific dollar amounts, or expired supplier agreements; no autonomous approvals without clause attribution]

### Finance and Accounting: Chief Financial Officer (CFO)
- **Primary Objective:** [State core financial goal: transaction processing unit economics, gross margin protection, and vendor overbilling recovery]
- **Key Metric 1:** [Quantified unit cost target, e.g. holding total automated triage and verification cost strictly below $2.50 per processed transaction]
- **Key Metric 2:** [Quantified recovery target, e.g. capturing 95% of contractual vendor volume rebates and eliminating unrecovered supplier overbilling]
- **Operational Constraint:** [State hard financial constraint, e.g. monthly operational compute and infrastructure expense capped at $10,000; zero automated financial settlements over $1,000 without controller sign-off]


## 3. Operational Workflow Mapping (5 Intake Formats)

> **Prompt Guide:**
> Map the end-to-end document lifecycle from receipt to resolution across all five OmniSupply intake formats.
> For each format, identify:
> - Format & Source: The physical artifact and how it arrives.
> - Current Manual Process (As-Is): How specialists currently handle the file.
> - Current Failure Mode: Where data is lost, errors occur, or delays accumulate.
> - Target Operational Workflow (To-Be): The structured process that replaces the manual steps.
> - Target Operational Control: The specific validation rule, schema check, or matching logic that prevents the failure mode.
> Fill in each row of the table below with substantive operational details.

| Intake Format | Current Manual Process (As-Is) | Current Failure Mode | Target Operational Workflow (To-Be) | Target Operational Control |
|---|---|---|---|---|
| **1. Scanned PDF Invoices** (Supplier monthly billing) | [Describe current manual data entry and PO lookup] | [Describe invoice typos, unflagged price variances, and duplicate payouts] | [Describe schema extraction, normalization, and automated PO line comparison] | [Specify boundary validation check, e.g. price variance tolerance and duplicate invoice ID check] |
| **2. Freight Packing Slips** (Warehouse dock delivery receipts) | [Describe how receiving slips are inspected and filed] | [Describe missing receiving stamps, unnoted short-shipments, and lost paper slips] | [Describe optical capture, piece count extraction, and automated delivery confirmation] | [Specify verification check, e.g. dock receiving timestamp and line-item quantity match against PO] |
| **3. Warehouse Delivery Photos** (Pallet damage and item condition) | [Describe how dock workers take and email damage photos] | [Describe unlinked photo files, poor image clarity, and denied supplier claims] | [Describe structured photo upload, metadata extraction, and automatic grouping with PO] | [Specify validation rule, e.g. resolution check, damage timestamping, and SKU packaging manifest matching] |
| **4. Emailed Supplier Correspondence** (Dispute emails and credit memos) | [Describe how specialists read unstructured vendor email threads] | [Describe buried dispute messages, missed 48-hour response windows, and unindexed PDF attachments] | [Describe automated email parsing, threaded communication history, and credit authorization extraction] | [Specify control, e.g. SLA response timer, authorized vendor email verification, and credit memo schema validation] |
| **5. Customer Dispute Tickets** (Merchant portal return and credit claims) | [Describe manual review of merchant portal credit requests] | [Describe delayed merchant credit memos, merchant account withholdings, and unverified return claims] | [Describe structured ticket ingestion, automated return policy lookup, and credit memo assembly] | [Specify control, e.g. merchant entitlement verification, duplicate dispute suppression, and warranty window check] |


## 4. Quantitative Human-in-the-Loop (HITL) Escalation Triggers

> **Prompt Guide:**
> Define at least three quantitative operational thresholds that mandate human specialist review before any transaction can settle.
> Each rule must state:
> 1. Exact numeric threshold (dollar amount, percentage variance, or time boundary).
> 2. Operational rationale (why this specific boundary requires human judgment).
> 3. Assigned human queue (which specific operational specialist or department receives the flagged item).

1. **Disputed Credit Amount Threshold:** [Define exact dollar threshold, e.g. any merchant dispute or invoice credit adjustment exceeding $500.00 must automatically route to the Senior Dispute Specialist for contract review before approval]
2. **Line-Item Price and Quantity Variance:** [Define exact percentage or count threshold, e.g. any invoice line-item price variance greater than 5.0% against the purchase order, or any quantity short-shipment exceeding 10 units, triggers mandatory buyer reconciliation]
3. **Warranty and Claim Filing Window:** [Define exact time or documentation boundary, e.g. any damaged goods claim filed within 48 hours of supplier contractual expiration, or any return claim lacking warehouse receiving photos, routes to the Compliance Review Queue]
```

---

## Grading Rubric and Self-Evaluation Checklist

Your submission will be evaluated against `rubrics/0.1/v1.yaml` across three core criteria:

| Rubric Criterion | Passing Standard | How to Verify Before Submitting |
|---|---|---|
| **jargon-free-problem-statement** | The problem statement describes OmniSupply's operational challenge completely in plain language without technology buzzwords. It cites 4,000 monthly transactions, all five intake formats, and the 2 to 3 day manual delay. | Count sentences: exactly 3. Search text for `AI`, `LLM`, `agent`, `model`, `machine learning`. Confirm zero hits. Verify 4,000 volume and 2 to 3 day latency are explicitly stated. |
| **three-stakeholder-definitions** | The submission provides distinct, concrete definitions of success tailored to the operations manager (speed and backlog), compliance officer (auditability and citations), and CFO (unit cost and economics). | Verify three separate sections. Confirm Operations cites turnaround latency and capacity; Compliance cites clause attribution and audit trail; Finance cites per-transaction cost ceiling and financial leakage. |
| **operational-workflow-mapping** | The submission demonstrates complete understanding of the document lifecycle from receipt to settlement, detailing failure modes and controls across all 5 formats, plus 3 quantitative HITL escalation triggers. | Confirm all 5 formats are detailed in the workflow table. Check that Section 4 contains at least three quantitative thresholds with specific numeric cutoffs and assigned human queues. |

### Pre-Submission Sanity Checks
- Word count is between 600 and 1,200 words.
- All four main markdown headings match the template exactly.
- Zero em dashes and zero en dashes are present.
- Zero exclamation marks are present.
- No buzzwords or vendor names are included in the problem statement or workflow descriptions.
