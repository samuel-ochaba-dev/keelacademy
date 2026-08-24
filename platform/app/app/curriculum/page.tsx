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
    why: "Environment setup is where self-taught learners quietly drop off. We treat sandboxing, tooling, and your first drill as the initial deliverable completed in your first session.",
    outcome: "Your isolated Docker environment runs, and you meet Meridian Mutual: the anchor client you serve across all thirteen phases.",
    modules: ["0.1 Meet the client: Meridian Mutual", "0.2 How the curriculum and grading loop work", "0.3 One-click Docker environment setup"],
  },
  {
    id: "phase-1",
    phaseNum: 1,
    name: "Software Engineering Foundations",
    estHours: "100 hours",
    why: "Every subsequent phase stands on engineering fundamentals. Python, git workflows, HTTP APIs, async programming, and pytest are taught as components of the claims intake pipeline.",
    outcome: "You structure, test, and containerize asynchronous backend code ready for high-throughput model pipelines.",
    modules: [
      "1.1 Python for AI engineering (type hints, Pydantic, data structures)",
      "1.2 Version control & collaborative git workflows",
      "1.3 Working with HTTP APIs, webhooks, and rate limits",
      "1.4 Asynchronous programming, event loops & concurrency",
      "1.5 Testing suites, code quality & pytest fixtures",
    ],
    note: "Experienced programmers can take a 20-minute adaptive diagnostic to place straight into Phase 2.",
  },
  {
    id: "phase-2",
    phaseNum: 2,
    name: "LLM Fundamentals & Model Physics",
    estHours: "60 hours",
    why: "Most prompt fragility comes from flawed mental models. When models are treated as magic, non-deterministic failures feel impossible to debug.",
    outcome: "You predict model behavior: tokenization nuances, context compression, attention mechanics, provider differences, and engineered API handling.",
    modules: [
      "2.1 How transformer models work practically (next-token prediction)",
      "2.2 Tokens, context windows & model degradation patterns",
      "2.3 The model provider landscape and trade-off matrices",
      "2.4 Calling LLM APIs with retries, backoff, and timeouts",
    ],
  },
  {
    id: "phase-3",
    phaseNum: 3,
    name: "Prompt Engineering as a Discipline",
    estHours: "80 hours",
    badge: "Unit 3.2.1 live",
    why: "Prompts you cannot diff, test, and version in git are incantations, not engineering. We treat prompts as strict software artifacts.",
    outcome: "You author versioned, schema-constrained prompts with deterministic JSON outputs that parse every time or fail with structured error logs.",
    modules: [
      "3.1 System prompt design & role conditioning",
      "3.2 Structured outputs & schema-constrained generation (Unit 3.2.1)",
      "3.3 Few-shot exemplars & dynamic in-context retrieval",
      "3.4 Prompts as code: versioning, CI testing & regression gates",
    ],
    note: "Unit 3.2.1 is live and accepting submissions today with full automated grading.",
  },
  {
    id: "phase-4",
    phaseNum: 4,
    name: "Retrieval-Augmented Generation (RAG) & Grounding",
    estHours: "80 hours",
    why: "Retrieval fails quietly: the model hallucinates plausible answers without grounding, and nobody notices until an auditor or customer checks the policy clause.",
    outcome: "You ground answers in Meridian policy documents using hybrid search, chunking strategies, dense embeddings, and cross-encoder rerankers.",
    modules: [
      "4.1 Semantic chunking, metadata extraction & PDF parsing",
      "4.2 Dense vector embeddings & vector databases (Qdrant)",
      "4.3 Hybrid search (BM25 + vector) & reciprocal rank fusion",
      "4.4 Agentic retrieval loops & graph-based knowledge indices",
    ],
  },
  {
    id: "phase-5",
    phaseNum: 5,
    name: "Tool Use & Agent Orchestration",
    estHours: "80 hours",
    badge: "15% rebate gate",
    why: "Autonomous agents fail in infinite loops and blow through budgets. This is where most builders stall; we provide explicit stop conditions and state machines.",
    outcome: "You build multi-tool agents that query policy databases, calculate payouts, and make triage routing decisions within strict token budgets.",
    modules: [
      "5.1 Function calling schemas & structured parameter validation",
      "5.2 Single-agent ReAct reasoning loops with hard stop conditions",
      "5.3 Multi-agent orchestration & hierarchical routing",
      "5.4 Orchestration frameworks & protocol interoperability",
      "5.5 Persistent conversation memory & state compaction",
    ],
    note: "Passing the Phase 5 integration gate inside 365 days triggers your first 15% completion rebate.",
  },
  {
    id: "phase-6",
    phaseNum: 6,
    name: "Fine-Tuning & Model Adaptation",
    estHours: "60 hours",
    why: "Fine-tuning is frequently misapplied to fix retrieval problems. We teach you when fine-tuning is economically justified and how to execute parameter-efficient tuning.",
    outcome: "You know when to prompt, when to retrieve, and when to fine-tune. You prepare instruction datasets and train LoRA adapters on open models.",
    modules: [
      "6.1 Decision framework: Prompting vs RAG vs Fine-tuning",
      "6.2 Dataset preparation, data synthesis & formatting",
      "6.3 Hands-on LoRA/QLoRA parameter-efficient training",
      "6.4 Preference optimization (DPO) for domain tone alignment",
    ],
  },
  {
    id: "phase-7",
    phaseNum: 7,
    name: "Evaluation & Production Observability",
    estHours: "70 hours",
    badge: "The school's core discipline",
    why: "This is the cornerstone discipline of the entire school. Keel grades your work using the exact evaluation methodology taught in this phase.",
    outcome: "You build golden evaluation datasets, calibrate LLM judges against human baselines, instrument distributed traces, and wire automated CI regression gates.",
    modules: [
      "7.1 Curating representative golden evaluation datasets",
      "7.2 Heuristic and LLM-as-judge scoring with quoted evidence",
      "7.3 Distributed tracing, token cost accounting & latency telemetry",
      "7.4 CI/CD regression testing for probabilistic models",
    ],
  },
  {
    id: "phase-8",
    phaseNum: 8,
    name: "Cost & Performance Engineering",
    estHours: "50 hours",
    why: "At 3,000 claims a month, inefficient LLM calls destroy unit economics. A system that costs more than the human labor it replaces is unviable.",
    outcome: "You model token costs, implement dynamic model routing from low-tier to frontier models, leverage prompt caching, and optimize latency.",
    modules: [
      "8.1 Token economics, context modeling & ROI calculations",
      "8.2 Dynamic cascading model routers (cheap-first fallbacks)",
      "8.3 Prompt prefix caching, semantic caching & batching",
    ],
  },
  {
    id: "phase-9",
    phaseNum: 9,
    name: "Security, Safety & Governance",
    estHours: "60 hours",
    why: "An automated claims system ingests untrusted user documents. Adversarial prompt injection and data leakage must be defended systematically.",
    outcome: "You build input guardrails, prevent prompt injections, enforce human-in-the-loop approvals for high-value payouts, and maintain tamper-evident audit logs.",
    modules: [
      "9.1 Direct and indirect prompt injection defense",
      "9.2 PII redaction, data sanitization & access policies",
      "9.3 Human-in-the-loop checkpoints for critical decisions",
      "9.4 Immutable audit logging & regulatory compliance trails",
    ],
  },
  {
    id: "phase-10",
    phaseNum: 10,
    name: "Deployment & Production LLMOps",
    estHours: "60 hours",
    why: "Deploying probabilistic systems is fundamentally different from traditional web development. Latency spikes and model drift require dedicated infrastructure.",
    outcome: "You wrap your system in FastAPI endpoints, containerize with Docker, deploy to scalable infrastructure, and build monitoring dashboards.",
    modules: [
      "10.1 Packaging AI pipelines as robust REST APIs",
      "10.2 Ephemeral containerization & sandbox runners",
      "10.3 CI/CD deployment pipelines with evaluation barriers",
      "10.4 Production monitoring, drift alerting & on-call runbooks",
    ],
  },
  {
    id: "phase-11",
    phaseNum: 11,
    name: "The Business of AI Engineering",
    estHours: "80 hours",
    badge: "Parallel track from day one",
    why: "Graduating technically competent but financially broke is the standard failure mode of self-taught engineers. This track runs in parallel from week one.",
    outcome: "You rehearse discovery calls against AI prospects, calculate value-based pricing, draft sendable proposals with explicit exclusions, and send real outreach.",
    modules: [
      "11.1 Positioning, niche selection & positioning statements",
      "11.2 Architectural case studies & portfolio assets",
      "11.3 Value-based pricing models & ROI calculators",
      "11.4 Prospect qualification & outreach workflows",
      "11.5 Discovery call simulations scored against rubrics",
      "11.6 Proposals, contracts & mandatory not-included scope",
      "11.7 Retainer conversion, handoff & client communication",
    ],
    note: "Unlocked on day one alongside the technical phases so business reps compound with technical building.",
  },
  {
    id: "phase-12",
    phaseNum: 12,
    name: "Capstone & Cross-Industry Portfolio",
    estHours: "100 hours",
    badge: "15% rebate gate",
    why: "One vertical project proves depth; three additional projects prove you can architect AI systems across healthcare, finance, and legal domains.",
    outcome: "The complete Meridian claims triage pipeline running in production, plus three cross-domain portfolio deliverables and an unscripted video walkthrough.",
    modules: [
      "12.1 The Capstone: Meridian Mutual end to end in production",
      "12.2 Cross-Industry Portfolio: Legal brief analyzer",
      "12.3 Cross-Industry Portfolio: Healthcare clinical notes extractor",
      "12.4 Cross-Industry Portfolio: Financial earnings report synthesizer",
    ],
    note: "Clearing the capstone gate inside 365 days triggers your final 15% completion rebate.",
  },
];

const SECTION_14_CRITERIA = [
  {
    title: "Verified golden-set accuracy",
    description: "Your capstone system achieves a verified accuracy score on a held-out golden dataset of 100+ adversarial claims.",
  },
  {
    title: "Recorded defend-your-work defense",
    description: "You answer unscripted interview questions explaining every architectural decision, trade-off, and failure recovery path.",
  },
  {
    title: "Technical stakeholder defense",
    description: "Your system survives a simulated review from a skeptical CTO persona requiring telemetry, cost caps, and security audits.",
  },
  {
    title: "Business owner defense",
    description: "Your proposal and case study survive a CFO persona evaluation focused on ROI, unit economics, and risk management.",
  },
  {
    title: "Real-world outreach gate",
    description: "You submit proof of one real outreach email sent to a real business with a sendable, priced proposal.",
  },
];

export default function CurriculumPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div>
      {/* Header */}
      <section className="border-b border-line">
        <div className="shell pt-16 pb-10 sm:pt-20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Thirteen phases, one client, no electives.
          </h1>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-2 sm:text-lg">
            Every sub-module serves a single anchor engagement: transforming Meridian Mutual&apos;s
            manual claims triage into a production pipeline a compliance officer, CTO, and CFO will
            all sign off on.
          </p>

          {/* Phase jump rail */}
          <nav
            aria-label="Jump to phase"
            className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PHASES.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="shrink-0 rounded-full border border-line-strong px-3.5 py-1.5 font-mono text-xs text-ink-3 transition-colors hover:border-accent/50 hover:text-accent"
              >
                P{p.phaseNum}
              </a>
            ))}
            <a
              href="#capstone"
              className="shrink-0 rounded-full border border-accent/40 px-3.5 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent-soft"
            >
              Capstone bar
            </a>
          </nav>
        </div>
      </section>

      {/* Phase timeline */}
      <section className="shell py-16 sm:py-20">
        <div className="relative">
          {/* Timeline rail */}
          <div
            className="absolute top-2 bottom-2 left-[13px] w-px bg-line sm:left-[17px]"
            aria-hidden
          />
          <div className="space-y-12">
            {PHASES.map((phase) => (
              <PhaseBlock key={phase.id} phase={phase} firstUnitId={first?.id ?? null} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 14: Graduation bar */}
      <section id="capstone" className="border-t border-line bg-raised/30">
        <div className="shell section">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
                <IconAward size={19} />
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                What &ldquo;done&rdquo; means.
              </h2>
            </div>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              There is no multiple-choice final exam. You graduate by clearing five checks lifted
              directly from Section 14 of the architecture.
            </p>
          </Reveal>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {SECTION_14_CRITERIA.map((criterion, index) => (
              <Reveal key={criterion.title} delay={Math.min(index * 0.05, 0.2)}>
                <div className="grid gap-2 py-5 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-accent">{index + 1}</span>
                    <h3 className="text-[15px] font-semibold text-ink">{criterion.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-2">{criterion.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <p className="max-w-[72ch] rounded-xl border border-accent/25 bg-accent-soft px-6 py-5 text-sm leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">The Delivery-Ready credential:</span>{" "}
              clearing all five checks updates your public verified profile with immutable
              references to your git commits, test runs, and judge verdicts.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line">
        <div className="shell flex flex-col items-start justify-between gap-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Ready to start Phase 3?</h2>
            <p className="mt-2 text-sm text-ink-2">
              Unit 3.2.1 is open for enrollment with the live grading pipeline.
            </p>
          </div>
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary px-5 py-3 text-[15px]">
              Start Unit {first.id}
              <IconArrowRight size={16} />
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function PhaseBlock({ phase, firstUnitId }: { phase: Phase; firstUnitId: string | null }) {
  return (
    <article id={phase.id} className="relative scroll-mt-24 pl-10 sm:pl-14">
      {/* Timeline node */}
      <span
        className="absolute top-1.5 left-0 grid size-7 place-items-center rounded-full border border-line-strong bg-raised font-mono text-[10px] text-accent sm:size-9 sm:text-[11px]"
        aria-hidden
      >
        {phase.phaseNum}
      </span>

      <Reveal>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {phase.name}
          </h2>
          <span className="font-mono text-xs text-ink-3">{phase.estHours}</span>
          {phase.badge ? <span className="chip-accent">{phase.badge}</span> : null}
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
              Why this phase exists
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{phase.why}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
              The concrete outcome
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{phase.outcome}</p>
          </div>
        </div>

        <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {phase.modules.map((m) => (
            <li key={m} className="flex items-start gap-2.5 text-sm text-ink-2">
              <IconCheck size={14} className="mt-1 shrink-0 text-accent" />
              {m}
            </li>
          ))}
        </ul>

        {phase.note ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-inset px-4 py-3">
            <p className="text-[13px] leading-relaxed text-ink-3">
              <span className="text-ink-2">Note:</span> {phase.note}
            </p>
            {phase.phaseNum === 3 && firstUnitId ? (
              <Link href={`/units/${firstUnitId}`} className="link-arrow shrink-0 text-xs">
                Start Unit {firstUnitId}
                <IconArrowRight size={12} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </Reveal>
    </article>
  );
}
