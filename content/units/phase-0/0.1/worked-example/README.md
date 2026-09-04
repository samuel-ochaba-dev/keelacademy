# Unit 0.1 Worked Example: Model Client Brief (Apex Freight Logistics)

This worked example provides an executive-grade, reference model Client Brief for a parallel freight brokerage: **Apex Freight Logistics**.

Apex brokers regional full-truckload (FTL) and less-than-truckload (LTL) freight across the Midwest. The company handles approximately 2,500 monthly shipment document packages across 300 active third-party motor carriers. Use this reference brief to study how operational bottlenecks, competing stakeholder scorecards, multi-format document workflows, and quantitative human escalation boundaries are defined without relying on technical jargon.

---

## 1. Problem Statement (Plain Language)

Apex Freight Logistics brokers approximately 2,500 freight shipments each month across 300 independent motor carriers, receiving physical bills of lading, mobile camera photos of delivery receipts, driver detention logs, signed rate confirmations, and invoice emails.
Operations coordinators must manually inspect each submission, match pickup and delivery timestamps against agreed broker-carrier rate contracts, check reported pallet damage against receiving dock notations, and verify detention hours against driver log sheets.
This manual document cross-referencing takes three to four business days per load, creating payment backlogs for carrier partners, triggering carrier turnover on critical freight lanes, and causing unrecovered detention costs when shipper dispute filing windows expire.

> **Sidebar: Why this problem statement passes**
>
> 1. **Zero technical buzzwords:** The statement contains zero mentions of AI, machine learning, large language models, agents, neural networks, or software vendor products. It describes physical business activities and document movement rather than proposed computational methods.
> 2. **Concrete operational scale:** The text cites specific numbers: 2,500 monthly transactions, 300 independent motor carriers, and a three to four business day triage bottleneck.
> 3. **Root business friction:** The statement identifies the exact operational failure: delayed carrier settlement, lane turnover, and lost accessorial revenue caused by expired shipper dispute filing windows.

---

## 2. Stakeholder Success Scorecards

Every business pipeline operates under competing stakeholder demands. An architecture that satisfies one stakeholder while failing another will be rejected in production.

### Dispatch Operations: Dispatch Director (Marcus Vance)
- **Primary Objective:** Accelerate load settlement turnaround and preserve carrier relationships across dedicated freight lanes.
- **Key Metric 1:** Cut load document triage and audit latency from 72+ hours to under 30 minutes for standard conforming shipments.
- **Key Metric 2:** Settle approved carrier payments within 24 hours of verified proof of delivery receipt, increasing carrier retention on core lanes from 68% to 90%.
- **Operational Constraint:** Zero dropped documents. Every inbound rate confirmation, delivery receipt, and driver message must generate a tracked record within 5 minutes of arrival.

### Governance and Compliance: Safety and Compliance Officer (Kendra Brooks)
- **Primary Objective:** Maintain an immutable, legally defensible audit trail for every rate deduction, detention payment, and carrier safety qualification.
- **Key Metric 1:** 100% of approved accessorial payments, detention allowances, and damage chargebacks must link to verifiable source records and contract clauses.
- **Key Metric 2:** Zero regulatory audit failures during Federal Motor Carrier Safety Administration (FMCSA) and state transportation authority compliance reviews.
- **Operational Constraint:** Mandatory human sign-off on any carrier with an expiring Certificate of Insurance (COI within 7 calendar days), active FMCSA safety alerts, or missing receiver signatures on the physical bill of lading. Straight-through automated payout is strictly prohibited on flagged carriers.

### Finance and Accounting: VP Finance (Julian Thorne)
- **Primary Objective:** Reduce per-transaction administrative processing overhead, eliminate uncollected shipper detention leakage, and maintain predictable unit economics.
- **Key Metric 1:** Reduce total back-office document processing cost from $9.20 per load to below $2.40 per load.
- **Key Metric 2:** Recover 95% of billable carrier detention fees from shippers by submitting verified detention packages within the shipper contractual 24-hour claim window.
- **Operational Constraint:** Operating compute and maintenance expense must scale strictly with transaction volume, with total monthly system overhead capped at $6,000. The system must not create automated financial commitments exceeding $1,000 without controller authorization.

> **Sidebar: Balancing the operational trilemma**
>
> The three scorecards above establish an operational trilemma:
> - **Velocity (Dispatch):** Wants instant carrier settlements to keep drivers moving.
> - **Governance (Compliance):** Demands complete verification of insurance, authority, signatures, and contract clauses.
> - **Fiscal Discipline (Finance):** Demands a cost ceiling under $2.40 per transaction and zero uncollected detention leakage.
>
> If you prioritize only velocity, you pay fraudulent detention claims and violate carrier insurance rules. If you prioritize only compliance, your manual verification queue backs up to four days. If you prioritize only finance, your operational tooling lacks the coverage needed to handle dirty document scans.
>
> The balance is achieved through quantitative routing: clean, conforming loads that satisfy all validation checks pass through in minutes at minimal cost, while ambiguous, high-dollar, or non-compliant loads route directly to human specialists with pre-extracted evidence.

---

## 3. Operational Workflow Mapping (As-Is vs To-Be Across 5 Intake Formats)

Apex receives freight documentation through five distinct intake channels. The table below maps each format from its current failure mode to its target operational control.

| Intake Format | Current Manual Process (As-Is) | Current Failure Mode | Target Operational Workflow (To-Be) | Target Operational Control |
|---|---|---|---|---|
| **1. Rate Confirmations** (Signed PDF or digital contracts) | Dispatchers manually verify linehaul rates, fuel surcharges, and stop-off fees against transport management system (TMS) entries. | Typos during manual data entry cause billing mismatches between broker rate con and carrier invoice, delaying settlement. | Standardized boundary ingestion parses rate confirmation fields into a structured schema, matching line items directly to TMS database records. | Schema field validation rejects unassigned loads or mismatched carrier DOT numbers at ingestion; flags rate discrepancies over $0.00. |
| **2. Bills of Lading / Proof of Delivery (BOL/POD)** (Scanned documents or mobile camera photos) | Coordinators open scanned PDFs or mobile photos, visually checking for receiver signatures, delivery timestamps, and piece counts. | Low-resolution or crooked photos sit in unmonitored inboxes; missing receiver signatures are discovered days later when shippers reject payment. | Automated image normalization and text extraction isolate signature blocks, piece counts, and receiver time-in/time-out stamps. | Deterministic signature presence check; mandatory routing to exception queue if signature block confidence is low or piece count deviates from BOL. |
| **3. Driver Detention Logs** (Dock sign-in sheets, paper logs, ELD screenshots) | Drivers text photo snippets of dock sign-in sheets or logbook pages to claim $50 per hour detention after 2 free hours. | Coordinators approve detention based on driver assertion without verifying dock arrival; shippers reject reimbursement for lack of supporting proof. | System cross-validates driver-submitted dock timestamps against vehicle electronic logging device (ELD) telematics and facility geofence records. | Automated verification of the 2-hour free time threshold; flags any detention claim exceeding $300 or lacking paired ELD geofence verification. |
| **4. Pallet and Cargo Damage Claims** (Receiving dock photos, OS&D inspection reports) | Receiving dock notes "damaged pallets" on the BOL; photos are sent via email thread without standardized claim identifiers. | Damage claims are lost in email threads; carriers deny liability because claim notice was not filed within the contractual 48-hour window. | Ingestion workflow groups photos, receiver inspection notes, and original packaging manifests under a unified claim file with timestamped proof. | Automated extraction of over, short, and damaged (OS&D) line items; mandatory human escalation for any claim with cargo damage indicators. |
| **5. Carrier Invoices and Correspondence** (PDF invoices, EDI 210 feeds, dispute emails) | Accounts payable staff manually key invoice totals into accounting software and compare against the original rate confirmation. | Duplicate carrier invoices are occasionally paid; accessorial charges added by carriers without prior written authorization slip through unnoticed. | Document intake performs automated deduplication against existing invoice IDs and matches line item totals against approved rate confirmation line items. | Three-way match verification (Rate Confirmation + Signed POD + Carrier Invoice); invoice amounts exceeding approved rate con route to finance review. |

---

## 4. Quantitative Human-in-the-Loop (HITL) Escalation Rules

Straight-through processing is only permitted when documents meet strict, unambiguous criteria. Any exception meeting the following quantitative thresholds immediately suspends automated routing and assigns the file to a specialized human coordinator.

1. **Detention Claim Cap:** Any carrier detention claim exceeding **$300** (or more than **3.0 hours** beyond the standard 2.0 hours of contractual facility free time) must route to the Carrier Relations Supervisor with attached ELD telematics for manual carrier-shipper reconciliation.
2. **Telematics vs Document Timestamp Discrepancy:** Any time difference greater than **45 minutes** between the driver electronic logbook geofence arrival timestamp and the handwritten dock sign-in timestamp on the physical BOL triggers a dispatcher investigation.
3. **Refrigerated Freight Temperature Excursions:** For temperature-controlled loads, if the continuous reefer download log is missing, or reveals a temperature excursion greater than **4.0 degrees Fahrenheit** from the contracted setpoint for longer than **30 minutes**, the shipment routes to the Claims Director with an immediate claim notice issued to the carrier insurance underwriter.
4. **Accessorial Fee Ratio:** Any unapproved accessorial charge (lumper fees, layover, driver assist, dry run) that exceeds **15%** of the baseline linehaul rate requires written authorization from the VP Finance before invoice processing.
5. **Carrier Compliance and Insurance Window:** Any carrier whose Certificate of Insurance (COI) expires within **7 calendar days** of scheduled delivery, or whose FMCSA safety rating indicates an active out-of-service order, immediately blocks automated settlement and routes to Safety and Compliance.

```
Incoming Load Document Package (5 Intake Formats)
           │
           ▼
[Format Schema Ingestion & Normalization]
           │
           ├── Does document fail schema, deduplication, or signature check?
           │     ├── YES ──► Route to Intake Specialist (Queue 1: Malformed Input)
           │     └── NO
           ▼
[Cross-Reference & Contract Verification]
           │
           ├── Does package trigger quantitative HITL escalation?
           │   (Detention > $300, Timestamp Gap > 45m, Reefer Temp Excursion,
           │    Accessorial > 15%, or Carrier COI < 7 days)
           │     ├── YES ──► Route to Specialist Coordinator (Queue 2: Exception Review)
           │     └── NO
           ▼
[Clean Load Pass-Through: Settle Payment within 24 Hours & File Shipper Billing]
```

---

## 5. Architectural Annotations: Why Technical Jargon Is Forbidden

When drafting a client brief or system requirement, engineers frequently rely on technology buzzwords to describe capabilities. In this curriculum, technical buzzwords are prohibited in business problem definitions.

> **Sidebar: The cost of premature technical vocabulary**
>
> Consider the difference between these two statements:
>
> - **Statement A (Jargon-laden):** "We will deploy an autonomous LLM multi-agent framework with RAG to ingest unstructured freight PDFs into a vector database and use semantic reasoning to settle carrier invoices."
> - **Statement B (Operational):** "We will build a pipeline that extracts line items from rate confirmations and delivery receipts, cross-checks driver timestamps against vehicle GPS logs, and routes flagged discrepancies over $300 to an operations coordinator for approval."
>
> Statement A fails as an engineering brief for four reasons:
> 1. **It hides operational mechanics:** Statement A does not state what documents are processed, what constitutes a valid proof of delivery, or what happens when a photo is illegible.
> 2. **It makes unverified architectural commitments:** Statement A assumes a vector database and an LLM agent are necessary before the team has even determined whether the problem is a structured schema validation task.
> 3. **It prevents stakeholder verification:** The Dispatch Director and VP Finance cannot evaluate Statement A. They cannot tell you whether a vector database handles a missing receiver signature.
> 4. **It conceals failure modes:** When Statement A fails, you do not know whether the model hallucinated or the document was unreadable. Statement B defines exact boundaries where the pipeline must stop and ask for human guidance.
>
> Professional system design requires naming the operational pain, the physical data artifacts, the business constraints, and the human escalation boundaries before writing a single line of model code.
