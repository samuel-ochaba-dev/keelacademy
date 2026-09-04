# Client Brief Analysis: OmniSupply Operations

## 1. Operational Problem Statement

OmniSupply faces severe operational friction handling approximately 4,000 monthly transactions across disparate artifacts including scanned PDFs, packing slips, and supplier emails requiring manual purchase order cross-checks. This manual bottleneck causes a 2 to 3 day triage delay and leads to ongoing financial leakage through undetected vendor overcharges and unrecovered credit claims.

## 2. Stakeholder Success Metrics and Quantified KPIs

The automated intake workflow targets three operational KPIs:

- **Operations Team:** Lower average triage time to under 4 hours and maintain daily specialist volume above 50 processed items.
- **Compliance Officer:** Maintain a minimum 99.5% contract citation rate for all dispute resolutions with timestamped audit logs.
- **Chief Financial Officer (CFO):** Lower transaction processing overhead from $22 to $5 per invoice and recover at least 80% of eligible supplier dispute funds.

## 3. Human-in-the-Loop (HITL) Boundary Thresholds

The intake pipeline stops automated routing and requires human review under three explicit rules:

1. **Financial threshold:** Disputes exceeding $500.00 require human specialist review.
2. **Pricing variance threshold:** Item price discrepancy exceeding 3% between invoice and purchase order triggers specialist review.
3. **Parsing confidence threshold:** Automated character extraction confidence below 90% halts processing for human verification.
