# Client Brief Analysis: OmniSupply Operations

## 1. Operational Problem Statement

OmniSupply Operations processes roughly 4,000 vendor invoices, shipment receipts, damaged goods claims, and return disputes each month. Incoming documentation arrives as an uncoordinated mix of scanned PDF invoices, freight packing slips, warehouse delivery photos, emailed supplier correspondence, and customer dispute tickets that require manual cross-referencing against purchase orders. This manual intake bottleneck produces a 2 to 3 day triage latency before resolution can begin, creating severe financial leakage from undetected vendor overbilling, expired dispute windows, and unrecovered damaged-stock credits.

## 2. Stakeholder Success Metrics and Quantified KPIs

The proposed intake automation system must reconcile three competing stakeholder definitions of done:

- **Operations Team:** Reduce average dispute triage cycle time from 72 hours down to under 2 hours per transaction, while increasing individual specialist throughput from 18 cases per day to 90 cases per day.
- **Compliance Officer:** Guarantee 100% audit provenance across all dispute resolutions by verifying and citing applicable supplier contract clauses and SLA terms, maintaining zero undocumented credit approvals.
- **Chief Financial Officer (CFO):** Reduce dispute processing cost from $24.50 to under $3.25 per transaction, while recovering at least $180,000 annually in previously leaked vendor billing errors and uncollected supplier credits.

## 3. Human-in-the-Loop (HITL) Boundary Thresholds

The software routing pipeline enforces strict quantitative safety boundaries where automated execution halts and delegates the case to human operations specialists:

1. **Disputed Dollar Value Ceiling:** Any invoice discrepancy or credit claim exceeding $1,000.00 must immediately halt automated processing and route to a senior operations specialist for manual authorization.
2. **Pricing Variance Bound:** Any discrepancy between invoice line-item price and purchase order baseline exceeding 5% or $50.00 (whichever is lower) triggers an immediate stop and specialist escalation.
3. **Vendor Dispute Rate Spike:** If a supplier's dispute rate exceeds 8% over rolling 30-day invoice volume, or if a supplier logs more than 3 damaged-item claims within 14 calendar days, all pending transactions for that supplier divert to manual audit.
4. **Data Extraction Quality Floor:** If optical character recognition confidence falls below 95% on SKU codes, quantities, or invoice totals, automated intake halts and sends the artifact to manual data verification.
