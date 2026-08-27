import Link from "next/link";
import { listUnits, loadUnit } from "@/lib/content";

export const dynamic = "force-dynamic";

const DIAGNOSTIC_ROWS = [
  {
    criterion: "Messy & Hostile Data",
    naive: "Drops unstructured records silently, breaks on markdown fences, or crashes unhandled.",
    engineered: "Strict Pydantic schema validation, quarantine dead-letter queues, and structured error logs.",
  },
  {
    criterion: "Verification Standard",
    naive: "Vibe checks and single happy-path manual tests. Zero quantitative accuracy baselines.",
    engineered: "Deterministic Docker sandbox test suites + automated LLM judges requiring quoted code proof.",
  },
  {
    criterion: "Token & Cost Economics",
    naive: "Frontier model calls on every request. Inefficient prompts burning through monthly budget.",
    engineered: "Cascading model routers, prefix caching, semantic deduplication, and formal token ROI models.",
  },
  {
    criterion: "Architectural Defense",
    naive: "A fragile demo you cannot explain or defend when a technical CTO starts asking hard questions.",
    engineered: "Production code with recorded unscripted technical defenses and tamper-proof test traces.",
  },
];

const UNIT_STEPS = [
  {
    step: "01",
    name: "LEARN",
    label: "Foundational Spec",
    body: "Read concise, text-first technical specifications covering core transformer physics, retrieval algorithms, or routing protocols.",
  },
  {
    step: "02",
    name: "PRACTICE",
    label: "Interactive Gap-Fill",
    body: "Study annotated working implementations and fill targeted architectural gaps in our interactive drill workbench before building.",
  },
  {
    step: "03",
    name: "BUILD",
    label: "Personalized Corpus",
    body: "Write your solution against a uniquely seeded Meridian claims corpus. Answer keys cannot be copy-pasted; your code must run.",
  },
  {
    step: "04",
    name: "VERIFY",
    label: "Ephemeral Sandboxes",
    body: "Push to git. An isolated container clones your repository, executes test harnesses, and returns evidence-backed rubric grades in seconds.",
  },
  {
    step: "05",
    name: "UNSTUCK",
    label: "2AM Curated Fixes",
    body: "Encounter an edge case? Access curated symptom matrices and concrete fixes derived from hundreds of real developer attempts.",
  },
];

const VERIFICATION_LAYERS = [
  {
    layer: "LAYER 01",
    name: "Deterministic Sandbox Harness",
    trigger: "Executes on every git push",
    body: "Your repository is cloned into a hardened Linux container. Pytest suites execute against adversarial fixtures to verify schema compliance, error handling, and performance limits.",
  },
  {
    layer: "LAYER 02",
    name: "Evidence-Backed Rubric Judge",
    trigger: "Line-by-line automated scoring",
    body: "A calibrated LLM judge evaluates your architecture against strict production criteria. Verdicts are only valid if the judge attaches exact line-numbered code quotes as proof.",
  },
  {
    layer: "LAYER 03",
    name: "Defend-Your-Work Oral Defense",
    trigger: "Required at milestone gates",
    body: "Answer unscripted follow-up technical questions generated directly from your submitted AST. Explain trade-offs, concurrency models, and failure recovery paths out loud.",
  },
  {
    layer: "LAYER 04",
    name: "Video Walkthrough & Proof Ledger",
    trigger: "Final capstone qualification",
    body: "Record an unscripted video walkthrough of your system running end-to-end. Your passing logs, commit hashes, and defense transcripts are published to your permanent public credential.",
  },
];

const PHASE_BLOCKS = [
  { id: "0", name: "Orientation & Environment Setup", hours: "20h", focus: "One-click isolated Docker development environments and the Meridian Mutual intake specification." },
  { id: "1", name: "Software Engineering Foundations", hours: "100h", focus: "Python type hints, Pydantic clean architecture, async event loops, and robust pytest harnesses." },
  { id: "2", name: "LLM Physics & Model Mechanics", hours: "60h", focus: "Token economics, context degradation patterns, provider trade-offs, and resilient API wrappers." },
  { id: "3", name: "Prompts as Code & Schemas", hours: "80h", badge: "Unit 3.2.1 Live", focus: "Versioned, schema-constrained prompts returning deterministic JSON. (Live and accepting submissions)." },
  { id: "4", name: "RAG, Vector Search & Grounding", hours: "80h", focus: "Hybrid search (BM25 + vector), dense embeddings, document chunking, and strict policy grounding." },
  { id: "5", name: "Tool-Using Agents & Orchestration", hours: "80h", badge: "15% Rebate Gate", focus: "ReAct loops, deterministic stop conditions, multi-agent routing, and state machine boundaries." },
  { id: "6", name: "Fine-Tuning & Model Adaptation", hours: "60h", focus: "Curating high-quality datasets, parameter-efficient LoRA fine-tuning, and DPO alignment." },
  { id: "7", name: "Evaluation & Observability", hours: "70h", focus: "Golden evaluation datasets, LLM-as-judge scoring with quotes, distributed tracing, and CI barriers." },
  { id: "8", name: "Cost & Performance Engineering", hours: "50h", focus: "Dynamic cascading model routers, prompt caching, latency budgets, and token cost ROI modeling." },
  { id: "9", name: "Security, Guardrails & LLMOps", hours: "60h", focus: "Direct/indirect prompt injection defense, PII sanitization, and immutable compliance audit trails." },
  { id: "10", name: "Deployment & Scalable Infrastructure", hours: "60h", focus: "FastAPI endpoints, containerization, CI/CD evaluation barriers, and production drift telemetry." },
  { id: "11", name: "The Business of AI Engineering", hours: "80h", badge: "Runs From Day 1", focus: "Discovery call simulations with AI personas, value pricing models, and sendable proposals." },
  { id: "12", name: "Capstone & 4-Vertical Portfolio", hours: "100h", badge: "15% Rebate Gate", focus: "Production deployment of Meridian claims pipeline plus legal, healthcare, and finance systems." },
];

const DELIVERABLES = [
  { title: "Production Claims Triage Pipeline", detail: "End-to-end deployed architecture: intake, extraction, hybrid search, multi-tool agents, cost routers, and monitoring." },
  { title: "3 Cross-Domain Deliverables", detail: "Proven systems across Legal Contract Analysis, Healthcare Clinical Extraction, and Financial Earnings Synthesis." },
  { title: "Priced Client Proposal", detail: "Professional, client-ready proposal with value-based pricing calculators and explicit out-of-scope exclusions." },
  { title: "Verified Outreach Milestone", detail: "Proof of one real business outreach sent to a prospective client with a sendable, priced proposal." },
  { title: "Permanent Proof-of-Work Credential", detail: "Publicly verifiable portfolio backed by raw test logs, git commit hashes, and recorded defense transcripts." },
];

const SHORTCOMINGS = [
  {
    title: "Unit 3.2.1 is live today; 12 phases in active rollout",
    body: "Unit 3.2.1 is in full production with automated sandboxed grading. The remaining phases are published as an open, granular engineering specification released phase by phase.",
  },
  {
    title: "Zero video playlists or passive lecture seats",
    body: "Every unit is concise, rigorous technical text implemented in code. If you require video tutorials or passive lectures to stay motivated, this school will feel demanding.",
  },
  {
    title: "No participation certificates for attendance",
    body: "Your credential is your verifiable code: public git commits, passing test runner logs, and recorded technical defense interviews. We issue zero PDFs for showing up.",
  },
  {
    title: "Completion is 100% on you",
    body: "Peer pods and our 30% tuition rebate incentivize momentum, but no one will chase you for homework. Designed strictly for self-directed builders.",
  },
];

const HOME_FAQS = [
  {
    q: "How does the 30% completion rebate work?",
    a: "You pay tuition once upfront. Clear the Phase 5 multi-agent milestone within 365 days and 15% of your tuition is automatically refunded. Pass the final Capstone defense within 365 days and get another 15% refunded. You earn $585 to $735 cash back simply by finishing on schedule.",
  },
  {
    q: "How is Keel different from typical online AI courses?",
    a: "Three structural differences: You build one continuous production system for a real enterprise anchor client; your code is graded automatically by ephemeral Docker containers and evidence-backed rubrics on every git push; and there are zero passive videos or vanity certificates.",
  },
  {
    q: "Can I start building right now?",
    a: "Yes. Unit 3.2.1 is live today. You can enroll, launch the interactive drill workbench, push your solution to GitHub, and receive a verified grading verdict in seconds.",
  },
  {
    q: "What programming background do I need?",
    a: "You should be comfortable with basic programming (variables, loops, functions, and git). Phase 1 provides 100 hours of deep software engineering foundations in Python, async programming, and pytest.",
  },
];

export default function LandingPage() {
  const units = listUnits();
  const first = units[0];
  const firstUnit = first ? loadUnit(first.id) : null;
  const checksCount = firstUnit?.checks?.length ?? 8;
  const criteriaCount = firstUnit?.rubric?.criteria.length ?? 2;
  const unitTitle = firstUnit?.lesson?.title ?? "Structured Outputs";

  return (
    <div>
      {/* -------------------- 1. HERO -------------------- */}
      <section>
        <div>
          {/* Top fact strip */}
          <div>
            <div>
              <span>
                
                SYSTEM SPECIFICATION
              </span>
              <span>/</span>
              <span>MERIDIAN MUTUAL INSURANCE PIPELINE</span>
            </div>
            <div>
              <span>700–950 TOTAL HOURS</span>
              <span>/</span>
              <span>UNIT 3.2.1 ACTIVE</span>
            </div>
          </div>

          <div>
            {/* Left: Core Positioning & Actions */}
            <div>
              <div>
                <span>STAGE 02 · DRILL WORKBENCH & GRADING CORE</span>
              </div>

              <h1>
                Stop running toy demos.
                <span>Ship production AI.</span>
              </h1>

              <p>
                One real enterprise anchor client. Thirteen engineering phases. Every deliverable you write
                faces automated container tests, evidence-backed rubric scoring, and an unscripted technical
                code defense before you graduate.
              </p>

              {/* Action bar */}
              <div>
                {first ? (
                  <Link href={`/units/${first.id}`}>
                    <span>Start Unit {first.id} [Live Workbench]</span>
                  </Link>
                ) : null}
                <Link href="/curriculum">
                  <span>Inspect 13-Phase Spec</span>
                </Link>
                <Link href="/pricing">
                  <span>30% Completion Rebate</span>
                </Link>
              </div>

              {/* Hardware & constraint facts */}
              <div>
                <div>
                  <span>Test Corpus</span>
                  <span>3,000</span>
                  <span>claims/mo load</span>
                </div>
                <div>
                  <span>Verification</span>
                  <span>4 Layers</span>
                  <span>code + oral defense</span>
                </div>
                <div>
                  <span>Cash Refund</span>
                  <span>30% Back</span>
                  <span>$585–$735 rebate</span>
                </div>
              </div>
            </div>

            {/* Right: live unit facts */}
            <div>
              <div>
                <div>
                  <div>
                    <span>TARGET UNIT:</span>
                    <span>3.2.1 · {unitTitle}</span>
                  </div>
                  
                  <div>
                    <div>
                      <span>RUNNER CONTAINER:</span>
                      <span>Linux 6.6 / Python 3.12</span>
                    </div>
                    <div>
                      <span>AUTOMATED SUITE:</span>
                      <span>{checksCount} Deterministic Checks</span>
                    </div>
                    <div>
                      <span>RUBRIC JUDGE:</span>
                      <span>{criteriaCount} Quoted-Evidence Rules</span>
                    </div>
                  </div>

                  <p>
                    <span>Deliverable:</span> Build a schema-constrained claims extraction pipeline with Pydantic and handle adversarial inputs with zero dropped data.
                  </p>

                  <div>
                    <span>DATASET: MERIDIAN-CORPUS-V1</span>
                    <Link href={`/units/${first ? first.id : "3.2.1"}`}>
                      <span>Launch interactive drill</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 2. THE ENGINEERING GAP DIAGNOSTIC -------------------- */}
      <section>
        <div>
          <div>
            <span>
              DIAGNOSTIC MATRIX
            </span>
            <h2>
              The gap between tutorials and production engineering.
            </h2>
            <p>
              Building a proof-of-concept takes a weekend. Knowing why that system breaks under adversarial
              inputs, managing token cost physics, and building test harnesses is what makes you an engineer.
            </p>
          </div>

          <div>
            <table>
              <thead>
                <tr>
                  <th>Engineering Dimension</th>
                  <th>The Tutorial Way</th>
                  <th>The Keel Production Standard</th>
                </tr>
              </thead>
              <tbody>
                {DIAGNOSTIC_ROWS.map((row) => (
                  <tr key={row.criterion}>
                    <td>{row.criterion}</td>
                    <td>{row.naive}</td>
                    <td>{row.engineered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ----------------------- 3. THE 5-STEP UNIT LOOP ----------------------- */}
      <section id="method">
        <div>
          <div>
            <span>
              OPERATIONAL RHYTHM
            </span>
            <h2>
              Every unit executes the same five-step engineering loop.
            </h2>
            <p>
              Across all 150+ units, the feedback structure is identical. You always know what to build,
              how to test it, and how it will be graded the moment you sit down to code.
            </p>
          </div>

          <div>
            {UNIT_STEPS.map((step) => (
              <div key={step.step}>
                <div>
                  <div>
                    <span>{step.step}</span>
                    <span>{step.label}</span>
                  </div>
                  <h3>{step.name}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- 4. THE 4-TIER VERIFICATION STACK ------------------- */}
      <section id="verification">
        <div>
          <div>
            <span>
              FOUR-LAYER EVALUATION
            </span>
            <h2>
              Verifying code the way high-scale engineering teams verify code.
            </h2>
            <p>
              No subjective TA grading. No multiple-choice quizzes. Your solution passes when it survives
              deterministic tests, line-by-line rubric scrutiny, and an unscripted code interrogation.
            </p>
          </div>

          <div>
            {VERIFICATION_LAYERS.map((v) => {
              return (
                <div key={v.layer}>
                  <div>
                    <div>
                      <span>
                        {v.layer} · {v.trigger}
                      </span>
                    </div>
                    <h3>{v.name}</h3>
                    <p>{v.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <span>
              TRANSPARENCY GUARANTEE: Every evaluation prompt, token count, and AST trace is auditable.
            </span>
            <Link href="/submit">
              <span>Read ingestion specs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------- 5. 13-PHASE PIPELINE ARCHITECTURE ------------------- */}
      <section id="curriculum">
        <div>
          <div>
            <div>
              <span>
                CURRICULUM SPECIFICATION
              </span>
              <h2>
                13 Phases. 700 to 950 Hours. One Running Pipeline.
              </h2>
            </div>
            <Link href="/curriculum">
              <span>Open 13-Phase Matrix</span>
            </Link>
          </div>

          <div>
            {PHASE_BLOCKS.map((block) => (
              <Link
                key={block.id}
                href={`/curriculum#phase-${block.id}`}
              >
                <div>
                  PHASE {block.id}
                </div>
                <div>
                  <div>
                    <h3>
                      {block.name}
                    </h3>
                    {block.badge ? (
                      <span>
                        {block.badge}
                      </span>
                    ) : null}
                  </div>
                  <p>{block.focus}</p>
                </div>
                <div>
                  {block.hours}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- 6. PORTFOLIO DELIVERABLES & OUTCOMES ----------------- */}
      <section>
        <div>
          <div>
            <span>
              VERIFIED GRADUATION ARTIFACTS
            </span>
            <h2>
              What you walk away with when you finish.
            </h2>
            <p>
              We make zero inflated marketing claims about instant six-figure salaries. What we guarantee
              is an undeniable, signature-backed proof of work that real hiring managers can inspect.
            </p>
          </div>

          <div>
            {DELIVERABLES.map((item) => (
              <div key={item.title}>
                <div>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- 7. TRANSPARENT PRICING & REBATES -------------------- */}
      <section>
        <div>
          <div>
            {/* Left: Pricing & Rebate Math */}
            <div>
              <span>
                TUITION & REBATE CONSOLE
              </span>
              <h2>
                Pay once. Earn 30% cash back by finishing.
              </h2>
              <p>
                Zero recurring monthly subscriptions. Monthly subscriptions quietly incentivize schools to keep
                you enrolled forever. Keel gives you cash back when you hit production milestones on schedule.
              </p>

              <div>
                <div>
                  <span>Self-Guided Tier</span>
                  <div>$1,950</div>
                  <p>$585 (30%) refund upon completion</p>
                  <p>Net investment: $1,365</p>
                  <Link href="/pricing">
                    View Self-Guided Specs
                  </Link>
                </div>

                <div>
                  <span>Cohort+ Pod Tier</span>
                  <div>$2,450</div>
                  <p>$735 (30%) refund upon completion</p>
                  <p>Net investment: $1,715</p>
                  <Link href="/pricing">
                    Join Next Pod
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Shortcomings & Constraints */}
            <div>
              <span>
                <span>HONEST PLATFORM LIMITATIONS</span>
              </span>
              <div>
                {SHORTCOMINGS.map((item) => (
                  <div key={item.title}>
                    <h4>{item.title}</h4>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 8. PRODUCTION FAQ -------------------- */}
      <section>
        <div>
          <span>
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2>
            Plain answers to fair questions.
          </h2>

          <div>
            {HOME_FAQS.map((faq) => (
              <details key={faq.q}>
                <summary>
                  <span>{faq.q}</span>
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>

          <div>
            <Link href="/faq">
              <span>Read all production FAQ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------- 9. FINAL DRILL EXECUTION CALLOUT -------------------- */}
      <section>
        <div>
          <div>
            
            <span>UNIT 3.2.1 CONTAINER RUNNER ACCEPTING PUSHES</span>
          </div>

          <h2>
            Start with the unit that is live today.
          </h2>

          <p>
            Unit 3.2.1 takes about six hours. Build a schema-constrained claims extraction engine, push to GitHub,
            and inspect your line-by-line verdict from our automated grading pipeline.
          </p>

          <div>
            {first ? (
              <Link href={`/units/${first.id}`}>
                <span>Start Unit {first.id} Immediately</span>
              </Link>
            ) : null}
            <Link href="/pricing">
              <span>View Tuition & Rebate Terms</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
