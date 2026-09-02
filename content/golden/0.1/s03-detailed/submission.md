# OmniSupply Operations Charter

## Executive Summary
OmniSupply is a 120-employee regional B2B distributor moving commercial electronics, industrial safety equipment, and kitchen supplies. It takes in roughly 4,000 records a month: scanned vendor invoices, packing slips scanned at the loading dock, mobile photos of damaged freight, and unstructured dispute emails from retail merchants. Specialists inspect each one by hand to confirm quantities, prices, and whether a damage claim is covered by the supplier's return policy. The result is an intake bottleneck of two to three business days per disputed delivery.

## Stakeholder Scorecards
1. Operations: clear the three-day triage queue and reach same-day specialist assignment on disputes.
2. Compliance: require an explicit supplier contract or SLA clause citation on every credit and price adjustment, with no unsupported figures.
3. Finance: cap processing cost at $2.50 per transaction so automation actually beats the manual baseline.

## Document Lifecycle
1. Intake: capture records from all four channels.
2. Validation: reject malformed or unreadable files immediately instead of letting them enter the queue.
3. Extraction: pull purchase order references, line items, quantities, and amounts into a normalised shape.
4. Verification: compare the claim against the active supplier agreement and warranty terms.
5. Settlement: produce a structured adjustment recommendation with its citation trail for specialist approval.

Current failure modes cluster in extraction and verification, where numbers are retyped between systems, duplicate invoices go unnoticed, and eligible volume rebates lapse before anyone files them.
