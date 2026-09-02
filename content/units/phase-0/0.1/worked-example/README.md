# Unit 0.1 worked example: model client brief and problem statement

This worked example provides an annotated, reference-grade client brief for a parallel insurance organization: **Apex Casualty Underwriters**.

Apex processes 2,500 commercial liability claims monthly with a 3-day triage bottleneck. Review the structure and rationale below to see why this solution satisfies all criteria.

---

## 1. Problem Statement (Plain Language)

Apex Casualty Underwriters receives 2,500 commercial insurance claims each month across email attachments, scanned PDF loss notices, and phone transcripts.
Staff must manually read each submission, verify whether policy coverage terms apply, check for exclusion clauses, and route the claim to the appropriate adjuster.
This manual document cross-referencing takes two to three business days per claim, creating operational backlogs and delaying customer payout decisions.

*Why this passes:*
- Uses zero buzzwords (no mention of AI, LLM, machine learning, or agents).
- Contains concrete figures: monthly volume (2,500) and turnaround latency (2-3 business days).
- Clearly describes the physical artifacts (emails, scanned PDFs, phone notes) and operational steps.

---

## 2. Stakeholder Success Scorecards

### Operations (Claims Manager)
- **Primary Goal:** Cut triage turnaround time from 3 business days to under 2 hours.
- **Key Metric:** 90% reduction in manual data extraction time for senior adjusters.
- **Constraint:** Zero dropped claims; every incoming loss notice must produce a tracked record.

### Governance (Compliance Officer)
- **Primary Goal:** 100% auditability for policy coverage determinations.
- **Key Metric:** Every automated triage recommendation must link directly to verbatim policy clause citations.
- **Constraint:** Deterministic boundary enforcement with mandatory human review on ambiguous coverage flags.

### Finance (Chief Financial Officer)
- **Primary Goal:** Positive return on investment with predictable operating expense.
- **Key Metric:** Total processing cost strictly below $2.50 per claim processed.
- **Constraint:** No open-ended API billing or unmonitored compute spikes.

*Why this passes:*
- Distinguishes three separate, competing operational priorities.
- Provides concrete, measurable targets for each stakeholder.
- Acknowledges explicit operational constraints rather than vague aspirations.

---

## 3. Current vs. Target Workflow Architecture

| Step | Current Manual Process | Target Automated Pipeline |
|---|---|---|
| **Ingress** | Emails and PDFs sit in unmonitored inboxes | Standardized schema ingestion with automated optical recognition |
| **Validation** | Manual checking for missing policy numbers | Strict schema boundary validation with flagged fallback records |
| **Verification** | Adjusters flip through 40-page policy binders | Policy grounding with exact section citation and rule matching |
| **Routing** | Subjective assignment based on adjuster availability | Rule-governed routing based on loss type and severity score |
| **Audit** | Notes scattered across legacy email threads | Immutable database event log with human sign-off records |

*Why this passes:*
- Step-by-step comparative workflow mapping.
- Directly identifies failure modes and shows how technical controls eliminate them.
