import Link from "next/link";
import { listUnits, loadUnit } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { HeroInspection } from "@/components/hero-inspection";
import {
  IconArrowRight,
  IconCheckCircle,
  IconShieldCheck,
  IconCpu,
  IconTerminal,
  IconAward,
  IconAlertTriangle,
  IconCode,
  IconBookOpen,
} from "@/components/icons";

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
    icon: IconTerminal,
    body: "Your repository is cloned into a hardened Linux container. Pytest suites execute against adversarial fixtures to verify schema compliance, error handling, and performance limits.",
  },
  {
    layer: "LAYER 02",
    name: "Evidence-Backed Rubric Judge",
    trigger: "Line-by-line automated scoring",
    icon: IconShieldCheck,
    body: "A calibrated LLM judge evaluates your architecture against strict production criteria. Verdicts are only valid if the judge attaches exact line-numbered code quotes as proof.",
  },
  {
    layer: "LAYER 03",
    name: "Defend-Your-Work Oral Defense",
    trigger: "Required at milestone gates",
    icon: IconCpu,
    body: "Answer unscripted follow-up technical questions generated directly from your submitted AST. Explain trade-offs, concurrency models, and failure recovery paths out loud.",
  },
  {
    layer: "LAYER 04",
    name: "Video Walkthrough & Proof Ledger",
    trigger: "Final capstone qualification",
    icon: IconAward,
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
    <div className="space-y-0">
      {/* -------------------- 1. INDUSTRIAL FLIGHT CONTROL HERO -------------------- */}
      <section className="relative border-b border-line bg-canvas pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="shell-wide">
          {/* Top avionics telemetry strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 font-mono text-[11px] text-ink-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded border border-line bg-raised px-2 py-0.5 text-accent font-semibold">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                SYSTEM SPECIFICATION
              </span>
              <span className="text-ink-4">/</span>
              <span className="text-ink-2">MERIDIAN MUTUAL INSURANCE PIPELINE</span>
            </div>
            <div className="flex items-center gap-4">
              <span>700–950 TOTAL HOURS</span>
              <span className="text-ink-4">/</span>
              <span className="text-pass font-medium">UNIT 3.2.1 ACTIVE</span>
            </div>
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-start">
            {/* Left: Core Positioning & Actions */}
            <div>
              <div className="inline-flex items-center gap-2 rounded border border-accent/30 bg-accent-soft px-2.5 py-1 font-mono text-xs font-semibold text-accent">
                <span>STAGE 02 · DRILL WORKBENCH & GRADING CORE</span>
              </div>

              <h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                Stop running toy demos.
                <span className="block text-accent">Ship production AI.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-2 sm:text-base">
                One real enterprise anchor client. Thirteen engineering phases. Every deliverable you write
                faces automated container tests, evidence-backed rubric scoring, and an unscripted technical
                code defense before you graduate.
              </p>

              {/* Action bar */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {first ? (
                  <Link href={`/units/${first.id}`} className="btn-primary">
                    <span>Start Unit {first.id} [Live Workbench]</span>
                    <IconArrowRight size={14} />
                  </Link>
                ) : null}
                <Link href="/curriculum" className="btn-ghost">
                  <span>Inspect 13-Phase Spec</span>
                </Link>
                <Link href="/pricing" className="btn-ghost">
                  <span>30% Completion Rebate</span>
                </Link>
              </div>

              {/* Hardware & constraint facts */}
              <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded border border-line bg-line font-mono">
                <div className="bg-raised p-3.5">
                  <span className="block text-[10px] text-ink-4 uppercase">Test Corpus</span>
                  <span className="mt-1 block text-base font-semibold text-ink tabular-nums">3,000</span>
                  <span className="block text-[10px] text-ink-3">claims/mo load</span>
                </div>
                <div className="bg-raised p-3.5">
                  <span className="block text-[10px] text-ink-4 uppercase">Verification</span>
                  <span className="mt-1 block text-base font-semibold text-ink tabular-nums">4 Layers</span>
                  <span className="block text-[10px] text-ink-3">code + oral defense</span>
                </div>
                <div className="bg-raised p-3.5">
                  <span className="block text-[10px] text-ink-4 uppercase">Cash Refund</span>
                  <span className="mt-1 block text-base font-semibold text-pass tabular-nums">30% Back</span>
                  <span className="block text-[10px] text-ink-3">$585–$735 rebate</span>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Telemetry Workbench */}
            <div>
              <div className="rounded-lg border border-line bg-raised overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between border-b border-line bg-inset px-4 py-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <IconTerminal size={14} className="text-accent" />
                    <span className="font-semibold text-ink">ACTIVE ENGINE BENCH</span>
                  </div>
                  <span className="rounded border border-line bg-raised px-1.5 py-0.5 text-[10px] text-pass">
                    SANDBOX LIVE
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-ink-3">TARGET UNIT:</span>
                    <span className="font-semibold text-ink">3.2.1 · {unitTitle}</span>
                  </div>
                  
                  <div className="rounded border border-line bg-inset p-3 font-mono text-xs space-y-2">
                    <div className="flex justify-between text-ink-3">
                      <span>RUNNER CONTAINER:</span>
                      <span className="text-ink-2">Linux 6.6 / Python 3.12</span>
                    </div>
                    <div className="flex justify-between text-ink-3">
                      <span>AUTOMATED SUITE:</span>
                      <span className="text-accent">{checksCount} Deterministic Checks</span>
                    </div>
                    <div className="flex justify-between text-ink-3">
                      <span>RUBRIC JUDGE:</span>
                      <span className="text-accent">{criteriaCount} Quoted-Evidence Rules</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-ink-2">
                    <span className="font-medium text-ink">Deliverable:</span> Build a schema-constrained claims extraction pipeline with Pydantic and handle adversarial inputs with zero dropped data.
                  </p>

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="font-mono text-[11px] text-ink-3">DATASET: MERIDIAN-CORPUS-V1</span>
                    <Link href={`/units/${first ? first.id : "3.2.1"}`} className="link-arrow">
                      <span>Launch interactive drill</span>
                      <IconArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 2. THE ENGINEERING GAP DIAGNOSTIC -------------------- */}
      <section className="border-b border-line bg-raised/40 py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
              DIAGNOSTIC MATRIX
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              The gap between tutorials and production engineering.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
              Building a proof-of-concept takes a weekend. Knowing why that system breaks under adversarial
              inputs, managing token cost physics, and building test harnesses is what makes you an engineer.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded border border-line bg-raised">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-inset font-mono text-[10px] text-ink-4 uppercase">
                  <th className="py-3 px-5 font-semibold">Engineering Dimension</th>
                  <th className="py-3 px-5 font-semibold text-fail/80">The Tutorial Way</th>
                  <th className="py-3 px-5 font-semibold text-pass/90">The Keel Production Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {DIAGNOSTIC_ROWS.map((row) => (
                  <tr key={row.criterion} className="transition-colors hover:bg-raised-2/50">
                    <td className="py-3.5 px-5 font-mono font-medium text-ink-2">{row.criterion}</td>
                    <td className="py-3.5 px-5 text-ink-3">{row.naive}</td>
                    <td className="py-3.5 px-5 text-ink font-medium">{row.engineered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Inspection Bench */}
          <div className="mt-10">
            <HeroInspection />
          </div>
        </div>
      </section>

      {/* ----------------------- 3. THE 5-STEP UNIT LOOP ----------------------- */}
      <section id="method" className="border-b border-line bg-canvas py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
              OPERATIONAL RHYTHM
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Every unit executes the same five-step engineering loop.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
              Across all 150+ units, the feedback structure is identical. You always know what to build,
              how to test it, and how it will be graded the moment you sit down to code.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded border border-line bg-line md:grid-cols-5">
            {UNIT_STEPS.map((step) => (
              <div key={step.step} className="bg-raised p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-accent font-semibold">{step.step}</span>
                    <span className="text-ink-4 uppercase">{step.label}</span>
                  </div>
                  <h3 className="mt-2 font-mono text-sm font-semibold text-ink">{step.name}</h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-ink-2">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- 4. THE 4-TIER VERIFICATION STACK ------------------- */}
      <section id="verification" className="border-b border-line bg-raised/30 py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
              FOUR-LAYER EVALUATION
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Verifying code the way high-scale engineering teams verify code.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
              No subjective TA grading. No multiple-choice quizzes. Your solution passes when it survives
              deterministic tests, line-by-line rubric scrutiny, and an unscripted code interrogation.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2">
            {VERIFICATION_LAYERS.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.layer} className="bg-raised p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-8 place-items-center rounded border border-line bg-inset text-accent">
                        <Icon size={16} />
                      </span>
                      <span className="font-mono text-[10px] text-ink-3 uppercase tracking-wider">
                        {v.layer} · {v.trigger}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-ink">{v.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink-2">{v.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded border border-accent/30 bg-accent-soft px-5 py-3.5 font-mono text-xs">
            <span className="text-ink-2">
              TRANSPARENCY GUARANTEE: Every evaluation prompt, token count, and AST trace is auditable.
            </span>
            <Link href="/submit" className="link-arrow">
              <span>Read ingestion specs</span>
              <IconArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------- 5. 13-PHASE PIPELINE ARCHITECTURE ------------------- */}
      <section id="curriculum" className="border-b border-line bg-canvas py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
            <div>
              <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
                CURRICULUM SPECIFICATION
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                13 Phases. 700 to 950 Hours. One Running Pipeline.
              </h2>
            </div>
            <Link href="/curriculum" className="btn-ghost">
              <span>Open 13-Phase Matrix</span>
              <IconArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-8 divide-y divide-line border-y border-line">
            {PHASE_BLOCKS.map((block) => (
              <Link
                key={block.id}
                href={`/curriculum#phase-${block.id}`}
                className="group grid grid-cols-[70px_1fr] sm:grid-cols-[100px_1fr_120px] items-center gap-4 py-4 transition-colors hover:bg-raised-2/50 px-2"
              >
                <div className="font-mono text-xs text-accent font-semibold">
                  PHASE {block.id}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                      {block.name}
                    </h3>
                    {block.badge ? (
                      <span className="rounded border border-amber/30 bg-amber-soft px-1.5 py-0.2 font-mono text-[10px] text-amber">
                        {block.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-3">{block.focus}</p>
                </div>
                <div className="hidden sm:block text-right font-mono text-xs text-ink-3 tabular-nums">
                  {block.hours}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- 6. PORTFOLIO DELIVERABLES & OUTCOMES ----------------- */}
      <section className="border-b border-line bg-raised/20 py-16 sm:py-20">
        <div className="shell">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
              VERIFIED GRADUATION ARTIFACTS
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              What you walk away with when you finish.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
              We make zero inflated marketing claims about instant six-figure salaries. What we guarantee
              is an undeniable, signature-backed proof of work that real hiring managers can inspect.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DELIVERABLES.map((item) => (
              <div key={item.title} className="rounded border border-line bg-raised p-5 space-y-2">
                <div className="flex items-center gap-2 text-pass">
                  <IconCheckCircle size={14} />
                  <h3 className="text-xs font-semibold text-ink">{item.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-ink-3">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------- 7. TRANSPARENT PRICING & REBATES -------------------- */}
      <section className="border-b border-line bg-canvas py-16 sm:py-20">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-start">
            {/* Left: Pricing & Rebate Math */}
            <div>
              <span className="font-mono text-xs font-semibold text-amber uppercase tracking-wider">
                TUITION & REBATE CONSOLE
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Pay once. Earn 30% cash back by finishing.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                Zero recurring monthly subscriptions. Monthly subscriptions quietly incentivize schools to keep
                you enrolled forever. Keel gives you cash back when you hit production milestones on schedule.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded border border-line bg-raised p-5 space-y-3">
                  <span className="font-mono text-[10px] text-ink-3 uppercase">Self-Guided Tier</span>
                  <div className="font-mono text-3xl font-semibold text-ink tabular-nums">$1,950</div>
                  <p className="text-xs text-pass font-mono">$585 (30%) refund upon completion</p>
                  <p className="text-xs text-ink-3">Net investment: $1,365</p>
                  <Link href="/pricing" className="btn-ghost w-full mt-2 text-xs">
                    View Self-Guided Specs
                  </Link>
                </div>

                <div className="rounded border border-line bg-raised p-5 space-y-3">
                  <span className="font-mono text-[10px] text-accent uppercase">Cohort+ Pod Tier</span>
                  <div className="font-mono text-3xl font-semibold text-ink tabular-nums">$2,450</div>
                  <p className="text-xs text-pass font-mono">$735 (30%) refund upon completion</p>
                  <p className="text-xs text-ink-3">Net investment: $1,715</p>
                  <Link href="/pricing" className="btn-amber w-full mt-2 text-xs">
                    Join Next Pod
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Shortcomings & Constraints */}
            <div className="rounded border border-line bg-raised p-6 space-y-4">
              <span className="font-mono text-xs font-semibold text-warn uppercase tracking-wider flex items-center gap-2">
                <IconAlertTriangle size={14} />
                <span>HONEST PLATFORM LIMITATIONS</span>
              </span>
              <div className="divide-y divide-line">
                {SHORTCOMINGS.map((item) => (
                  <div key={item.title} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <h4 className="text-xs font-semibold text-ink">{item.title}</h4>
                    <p className="text-[11px] leading-relaxed text-ink-3">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 8. PRODUCTION FAQ -------------------- */}
      <section className="border-b border-line bg-raised/20 py-16 sm:py-20">
        <div className="shell max-w-3xl">
          <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Plain answers to fair questions.
          </h2>

          <div className="mt-8 divide-y divide-line border-y border-line">
            {HOME_FAQS.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-ink transition-colors hover:text-accent">
                  <span>{faq.q}</span>
                  <IconArrowRight size={14} className="shrink-0 text-ink-4 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-2.5 text-xs leading-relaxed text-ink-2">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Link href="/faq" className="link-arrow text-xs">
              <span>Read all production FAQ</span>
              <IconArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------- 9. FINAL DRILL EXECUTION CALLOUT -------------------- */}
      <section className="bg-canvas py-16 sm:py-20 border-b border-line">
        <div className="shell max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded border border-line bg-raised px-3 py-1 font-mono text-xs text-ink-2">
            <span className="size-1.5 rounded-full bg-pass" />
            <span>UNIT 3.2.1 CONTAINER RUNNER ACCEPTING PUSHES</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Start with the unit that is live today.
          </h2>

          <p className="text-sm leading-relaxed text-ink-2 max-w-xl mx-auto">
            Unit 3.2.1 takes about six hours. Build a schema-constrained claims extraction engine, push to GitHub,
            and inspect your line-by-line verdict from our automated grading pipeline.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {first ? (
              <Link href={`/units/${first.id}`} className="btn-primary">
                <span>Start Unit {first.id} Immediately</span>
                <IconArrowRight size={14} />
              </Link>
            ) : null}
            <Link href="/pricing" className="btn-ghost">
              <span>View Tuition & Rebate Terms</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
