# Client Brief Analysis: OmniSupply Operations

## 1. Operational Problem Statement

OmniSupply Operations faces operational delays in their document processing workflow. Staff members spend too much time reviewing paperwork and cross-referencing information manually. These delays hurt customer relationships and cause frustration across warehouse and finance departments.

## 2. Stakeholder Success Metrics and Quantified KPIs

The new intake pipeline will align the three key stakeholder groups:

- **Operations Team:** Reduce average dispute triage cycle time from 72 hours down to under 2 hours, and increase specialist throughput from 18 to 90 cases per day.
- **Compliance Officer:** Maintain 100% audit provenance across all dispute approvals by verifying and citing applicable supplier contract clauses and SLA terms.
- **Chief Financial Officer (CFO):** Lower transaction processing costs from $24.50 to under $3.50 per invoice, while recovering at least $150,000 annually in billing leakage and uncollected vendor credits.

## 3. Human-in-the-Loop (HITL) Boundary Thresholds

The software routing pipeline applies three strict quantitative rules halting automation for human review:

1. **Disputed Dollar Value Ceiling:** Any claim or credit adjustment exceeding $1,000.00 must immediately halt automated routing for specialist review.
2. **Pricing Variance Bound:** Any discrepancy between invoice price and purchase order baseline exceeding 5% or $50.00 triggers an automated stop.
3. **Vendor Dispute Rate Spike:** Any vendor whose dispute frequency exceeds 8% over rolling 30-day invoice volume is flagged for manual audit.
