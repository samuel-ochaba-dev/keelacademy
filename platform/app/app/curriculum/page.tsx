import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { IconCheck, IconAward, IconArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "13-Phase Curriculum & Capstone Standard",
  description:
    "Thirteen phases, one anchor client, 700 to 950 hours. The complete AI Engineer's Path curriculum from setup to production capstone.",
};

type Phase = {
  id: string;
  phaseNum: number;
  name: string;
  estHours: string;
  badge?: string;
  why: string;
  outcome: string;
  modules: string[];
  note?: string;
};

const PHASES: Phase[] = [
  {
    id: "phase-0",
    phaseNum: 0,
    name: "Orientation & Environment Setup",
    estHours: "20 hours",
    why: "Complex local setups cause most developers to stall early. You get an isolated, one-click environment running in your first hour so you can start writing code immediately.",
    outcome: "Your development container is live, and you meet Meridian Mutual: the anchor client you build for across all thirteen phases.",
    modules: ["0.1 Meet the client: Meridian Mutual", "0.2 How your code is graded and verified", "0.3 One-click environment setup"],
  },
  {
    id: "phase-1",
    phaseNum: 1,
    name: "Software Engineering Foundations",
    estHours: "100 hours",
    why: "AI engineering is software engineering first. You master Python type systems, git workflows, asynchronous concurrency, and automated testing by building real pipeline components.",
    outcome: "You write clean, tested, containerized backend services capable of handling high-throughput AI workloads.",
    modules: [
      "1.1 Python for AI engineering (type hints, Pydantic, clean architecture)",
      "1.2 Version control & collaborative git branching",
      "1.3 Working with external APIs, webhooks, and rate limiters",
      "1.4 Asynchronous programming, event loops & concurrency",
      "1.5 Automated test suites, code quality & pytest harnesses",
    ],
    note: "Already program professionally? Take our 20-minute diagnostic to place straight into Phase 2.",
  },
  {
    id: "phase-2",
    phaseNum: 2,
    name: "LLM Fundamentals & Model Physics",
    estHours: "60 hours",
    why: "When you treat models like black boxes, non-deterministic bugs feel impossible to fix. You learn the underlying mechanics so you can anticipate and debug failures.",
    outcome: "You understand tokenization, context compression, attention mechanics, and model trade-offs, and write resilient API wrappers with backoff and timeouts.",
    modules: [
      "2.1 How transformer models actually work (predicting next tokens)",
      "2.2 Tokens, context limits & degradation patterns",
      "2.3 Model providers and cost-performance trade-offs",
      "2.4 Resilient API integration with exponential backoff and retries",
    ],
  },
  {
    id: "phase-3",
    phaseNum: 3,
    name: "Prompt Engineering as a Software Discipline",
    estHours: "80 hours",
    badge: "Unit 3.2.1 live",
    why: "Prompts you can't test, version, and track in git are fragile guesses. You treat prompts like strict software artifacts with regression tests.",
    outcome: "You build schema-constrained prompts that return clean, validated JSON every single time, or log structured errors when inputs fail.",
    modules: [
      "3.1 System prompt design & precise role conditioning",
      "3.2 Structured outputs & schema-constrained extraction (Unit 3.2.1)",
      "3.3 Dynamic few-shot examples & in-context retrieval",
      "3.4 Prompts as code: version control, CI tests & regression gates",
    ],
    note: "Unit 3.2.1 is live today with full automated grading. Start building now.",
  },
  {
    id: "phase-4",
    phaseNum: 4,
    name: "Retrieval-Augmented Generation (RAG) & Grounding",
    estHours: "80 hours",
    why: "Models hallucinate plausible-sounding falsehoods unless properly grounded. You learn how to connect your pipeline directly to authoritative source documents.",
    outcome: "You build hybrid search systems (vector embeddings + keyword search) that retrieve exact policy clauses and ground every generation in verifiable facts.",
    modules: [
      "4.1 Document chunking, metadata extraction & messy PDF parsing",
      "4.2 Dense vector embeddings & vector databases (Qdrant)",
      "4.3 Hybrid search (BM25 + vector) & reciprocal rank fusion",
      "4.4 Agentic retrieval loops & knowledge graphs",
    ],
  },
  {
    id: "phase-5",
    phaseNum: 5,
    name: "Tool-Using Agents & Orchestration",
    estHours: "80 hours",
    badge: "15% rebate gate",
    why: "Autonomous agents easily get stuck in infinite loops and burn through API budgets. You master state machines and hard boundary conditions.",
    outcome: "You build multi-tool agents that query policy databases, calculate payouts, and route complex insurance claims, all within strict token budgets.",
    modules: [
      "5.1 Function calling schemas & strict parameter validation",
      "5.2 ReAct reasoning loops with guaranteed stop conditions",
      "5.3 Multi-agent collaboration & hierarchical task routing",
      "5.4 Orchestration patterns & protocol interoperability",
      "5.5 Persistent conversation memory & state compaction",
    ],
    note: "Pass the Phase 5 integration gate within 365 days to claim your first 15% tuition rebate.",
  },
  {
    id: "phase-6",
    phaseNum: 6,
    name: "Fine-Tuning & Model Adaptation",
    estHours: "60 hours",
    why: "Fine-tuning is expensive and often misused for retrieval problems. You learn the economics of when to prompt, when to retrieve, and when to fine-tune.",
    outcome: "You know when adaptation is justified, curate high-quality instruction datasets, and train custom LoRA adapters on open-source models.",
    modules: [
      "6.1 Decision framework: Prompting vs RAG vs Fine-tuning",
      "6.2 High-quality training dataset curation & synthetic data",
      "6.3 Hands-on LoRA/QLoRA parameter-efficient fine-tuning",
      "6.4 Direct Preference Optimization (DPO) for domain tone",
    ],
  },
  {
    id: "phase-7",
    phaseNum: 7,
    name: "Evaluation & Production Observability",
    estHours: "70 hours",
    badge: "Core engineering discipline",
    why: "If you can't measure your system's accuracy, you can't improve it. This phase teaches the exact evaluation methodology used to grade your work across the school.",
    outcome: "You curate golden test sets, build automated AI judges with evidence quoting, track distributed latency/cost traces, and set up CI regression barriers.",
    modules: [
      "7.1 Curating representative golden evaluation datasets",
      "7.2 Heuristic and LLM-as-judge scoring with line-by-line quotes",
      "7.3 Distributed tracing, token accounting & latency telemetry",
      "7.4 Automated CI/CD regression testing for probabilistic models",
    ],
  },
  {
    id: "phase-8",
    phaseNum: 8,
    name: "Cost & Performance Engineering",
    estHours: "50 hours",
    why: "At enterprise volume, inefficient model calls wipe out profit margins. You build cost models and routing systems that keep unit economics viable.",
    outcome: "You build dynamic cascading routers that send simple tasks to cheap models and frontier models only when needed, plus prompt caching and batching.",
    modules: [
      "8.1 Token economics, context optimization & ROI calculations",
      "8.2 Dynamic cascading model routers (cheap-first fallbacks)",
      "8.3 Prompt prefix caching, semantic caching & batching",
    ],
  },
  {
    id: "phase-9",
    phaseNum: 9,
    name: "Security, Guardrails & LLMOps",
    estHours: "60 hours",
    why: "Production systems ingest untrusted inputs from real users. You learn how to defend systematically against prompt injection and protect private customer data.",
    outcome: "You build input/output guardrails, prevent prompt injection, require human approval on high-stakes decisions, and maintain tamper-proof audit trails.",
    modules: [
      "9.1 Direct and indirect prompt injection defense",
      "9.2 Sensitive data redaction, sanitization & access policies",
      "9.3 Human-in-the-loop checkpoints for high-risk decisions",
      "9.4 Immutable audit logging & compliance verification",
    ],
  },
  {
    id: "phase-10",
    phaseNum: 10,
    name: "Deployment & Scalable Infrastructure",
    estHours: "60 hours",
    why: "Deploying AI systems requires handling async streaming, model timeouts, and sudden traffic spikes. You build production-ready infrastructure.",
    outcome: "You package your pipeline as a fast FastAPI backend, containerize with Docker, deploy to production, and monitor for model drift.",
    modules: [
      "10.1 Packaging AI pipelines into robust REST endpoints",
      "10.2 Ephemeral container execution & isolated runners",
      "10.3 CI/CD deployment pipelines with evaluation checkpoints",
      "10.4 Production monitoring, drift alerts & on-call runbooks",
    ],
  },
  {
    id: "phase-11",
    phaseNum: 11,
    name: "The Business of AI Engineering",
    estHours: "80 hours",
    badge: "Runs from day one",
    why: "Technical skill alone won't get you clients or promotions if you can't communicate value. This track runs alongside your technical building from week one.",
    outcome: "You practice simulated discovery calls with AI business personas, calculate value-based pricing, write sendable proposals, and send real outreach.",
    modules: [
      "11.1 Positioning, niche selection & technical case studies",
      "11.2 Architectural case studies & portfolio assets that sell",
      "11.3 Value-based pricing models & ROI calculators",
      "11.4 Prospect qualification & outreach workflows",
      "11.5 Discovery call simulations scored against real rubrics",
      "11.6 Proposals, contracts & explicit out-of-scope boundaries",
      "11.7 Retainer conversion, client handoff & ongoing communication",
    ],
    note: "Unlocked on day one so you build business reps in parallel with technical skills.",
  },
  {
    id: "phase-12",
    phaseNum: 12,
    name: "Capstone & 4-Vertical Portfolio",
    estHours: "100 hours",
    badge: "15% rebate gate",
    why: "One insurance project proves depth; three additional projects in healthcare, finance, and law prove your architectural skills transfer anywhere.",
    outcome: "A deployed, production-ready claims system plus three cross-industry deliverables and an unscripted video walkthrough you can share with employers.",
    modules: [
      "12.1 The Capstone: Meridian Mutual pipeline running live in production",
      "12.2 Cross-Industry Deliverable: Legal contract analysis pipeline",
      "12.3 Cross-Industry Deliverable: Healthcare clinical notes extraction",
      "12.4 Cross-Industry Deliverable: Financial earnings report synthesizer",
    ],
    note: "Clear the capstone gate within 365 days to claim your final 15% completion rebate.",
  },
];

const SECTION_14_CRITERIA = [
  {
    title: "Verified golden test set accuracy",
    description: "Your capstone system achieves verified precision and recall on a held-out test suite of 100+ messy, adversarial claims.",
  },
  {
    title: "Recorded defend-your-work interview",
    description: "You answer unscripted technical questions explaining every architectural choice, trade-off, and error recovery path.",
  },
  {
    title: "Technical stakeholder defense",
    description: "Your system passes a simulated review from a skeptical CTO persona demanding telemetry, cost caps, and security audits.",
  },
  {
    title: "Business owner defense",
    description: "Your proposal and case study pass a CFO persona evaluation focused on ROI, unit economics, and risk management.",
  },
  {
    title: "Real-world outreach milestone",
    description: "You submit verified proof of one real outreach email sent to a real business with a sendable, priced proposal.",
  },
];

export default function CurriculumPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div className="space-y-0">
      {/* Header */}
      <section className="border-b border-line bg-canvas pt-12 pb-10">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            <span>FULL 13-PHASE PRODUCTION BLUEPRINT</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Thirteen phases. One enterprise client. No electives.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            Every module builds directly upon the previous phase to engineer a production claims pipeline for
            Meridian Mutual. 700 to 950 hours of structured, graded engineering.
          </p>

          {/* Phase jump rail */}
          <div className="mt-8 flex gap-1.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PHASES.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="shrink-0 rounded border border-line bg-raised px-2.5 py-1 font-mono text-xs text-ink-3 transition-colors hover:border-accent hover:text-accent"
              >
                P{p.phaseNum}
              </a>
            ))}
            <a
              href="#capstone"
              className="shrink-0 rounded border border-amber/40 bg-amber-soft px-2.5 py-1 font-mono text-xs text-amber transition-colors hover:bg-amber/20"
            >
              SECTION 14 SPEC
            </a>
          </div>
        </div>
      </section>

      {/* Phase Timeline & Specification Grid */}
      <section className="shell py-14">
        <div className="space-y-8">
          {PHASES.map((phase) => (
            <PhaseBlock key={phase.id} phase={phase} firstUnitId={first?.id ?? null} />
          ))}
        </div>
      </section>

      {/* Section 14: Graduation Bar */}
      <section id="capstone" className="border-t border-line bg-raised/30 py-16">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-accent">
            <IconAward size={14} />
            <span>SECTION 14 QUALIFICATION CRITERIA</span>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            What completion and delivery readiness actually mean.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
            Graduation requires clearing all five mandatory criteria. No multiple-choice tests.
            Your credential is an immutable cryptographic ledger of your git commits, passing test runner logs, and recorded technical defenses.
          </p>

          <div className="mt-8 divide-y divide-line border-y border-line">
            {SECTION_14_CRITERIA.map((criterion, index) => (
              <div key={criterion.title} className="grid gap-2 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-accent font-semibold">CHECK 0{index + 1}</span>
                  <h3 className="text-xs font-semibold text-ink">{criterion.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-ink-2">{criterion.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded border border-accent/30 bg-accent-soft p-4 font-mono text-xs text-ink-2">
            <span className="text-ink font-semibold">DELIVERY-READY CREDENTIAL:</span> Clearing all 5 checks certifies your production code with public git signatures and full evaluation telemetry.
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line bg-canvas py-12">
        <div className="shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-ink">Ready to start Phase 3?</h2>
            <p className="text-xs text-ink-3">
              Unit 3.2.1 is open for enrollment with active sandbox evaluation.
            </p>
          </div>
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary">
              <span>Start Unit {first.id} [Live Workbench]</span>
              <IconArrowRight size={14} />
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function PhaseBlock({ phase, firstUnitId }: { phase: Phase; firstUnitId: string | null }) {
  return (
    <article id={phase.id} className="rounded-lg border border-line bg-raised overflow-hidden scroll-mt-20">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded border border-line bg-raised px-2 py-0.5 font-mono text-xs font-semibold text-accent">
            PHASE 0{phase.phaseNum}
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-ink">{phase.name}</h2>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          {phase.badge ? (
            <span className="rounded border border-amber/40 bg-amber-soft px-2 py-0.5 text-amber">
              {phase.badge}
            </span>
          ) : null}
          <span className="text-ink-3 tabular-nums">{phase.estHours}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider">
              ENGINEERING RATIONALE
            </span>
            <p className="text-xs leading-relaxed text-ink-2">{phase.why}</p>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider">
              CONCRETE OUTCOME
            </span>
            <p className="text-xs leading-relaxed text-ink-2">{phase.outcome}</p>
          </div>
        </div>

        {/* Modules */}
        <div className="pt-3 border-t border-line">
          <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider">
            CORE DELIVERABLES & MODULES
          </span>
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {phase.modules.map((m) => (
              <li key={m} className="flex items-start gap-2 text-xs text-ink-2">
                <IconCheck size={12} className="mt-0.5 shrink-0 text-accent" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {phase.note ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-inset px-4 py-2.5">
            <p className="text-xs text-ink-3">
              <span className="text-ink-2 font-mono font-medium">SPEC NOTE:</span> {phase.note}
            </p>
            {phase.phaseNum === 3 && firstUnitId ? (
              <Link href={`/units/${firstUnitId}`} className="link-arrow shrink-0 text-xs">
                <span>Start Unit {firstUnitId}</span>
                <IconArrowRight size={12} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
