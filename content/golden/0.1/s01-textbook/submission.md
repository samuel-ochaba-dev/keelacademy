# OmniSupply Operations Client Brief

## 1. Problem Statement
OmniSupply Operations receives roughly 4,000 vendor invoices, freight packing slips, warehouse receiving photos, and merchant dispute emails each month.
Operations specialists must open each record by hand, match item codes and quantities against the original purchase order and the warehouse intake log, and check damage claims against the supplier's return terms.
That manual cross-referencing takes two to three business days per disputed delivery, which builds a backlog and delays credit memos to merchant partners.

## 2. Stakeholder Success Metrics
- **Operations management:** Cut average triage turnaround from three days to under two hours, and take routine data entry off senior specialists.
- **Compliance and legal:** Every price adjustment or credit recommendation carries an exact citation to the supplier contract or SLA clause that justifies it, written to an append-only log.
- **Finance (CFO):** Hold automated triage cost below $2.50 per processed transaction, with predictable unit economics month over month.

## 3. Operational Workflow
Documents arrive from four channels, get validated against a schema so malformed files are rejected at the door, have line items and amounts extracted and normalised, are checked against the governing supplier agreement, and are then packaged as an adjustment recommendation with citations for a specialist to approve.
Today the failure modes are all in the middle: numbers copied by hand between a PDF viewer and the ERP, duplicate billing that nobody catches, and rebate deadlines that expire while a dispute sits in a queue.
