import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

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
    <div>
      {/* Header */}
      <section>
        <div>
          <div>
            
            <span>FULL 13-PHASE PRODUCTION BLUEPRINT</span>
          </div>

          <h1>
            Thirteen phases. One enterprise client. No electives.
          </h1>

          <p>
            Every module builds directly upon the previous phase to engineer a production claims pipeline for
            Meridian Mutual. 700 to 950 hours of structured, graded engineering.
          </p>

          {/* Phase jump rail */}
          <div>
            {PHASES.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
              >
                P{p.phaseNum}
              </a>
            ))}
            <a
              href="#capstone"
            >
              SECTION 14 SPEC
            </a>
          </div>
        </div>
      </section>

      {/* Phase Timeline & Specification Grid */}
      <section>
        <div>
          {PHASES.map((phase) => (
            <PhaseBlock key={phase.id} phase={phase} firstUnitId={first?.id ?? null} />
          ))}
        </div>
      </section>

      {/* Section 14: Graduation Bar */}
      <section id="capstone">
        <div>
          <div>
            <span>SECTION 14 QUALIFICATION CRITERIA</span>
          </div>

          <h2>
            What completion and delivery readiness actually mean.
          </h2>

          <p>
            Graduation requires clearing all five mandatory criteria. No multiple-choice tests.
            Your credential is an immutable cryptographic ledger of your git commits, passing test runner logs, and recorded technical defenses.
          </p>

          <div>
            {SECTION_14_CRITERIA.map((criterion, index) => (
              <div key={criterion.title}>
                <div>
                  <span>CHECK 0{index + 1}</span>
                  <h3>{criterion.title}</h3>
                </div>
                <p>{criterion.description}</p>
              </div>
            ))}
          </div>

          <div>
            <span>DELIVERY-READY CREDENTIAL:</span> Clearing all 5 checks certifies your production code with public git signatures and full evaluation telemetry.
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section>
        <div>
          <div>
            <h2>Ready to start Phase 3?</h2>
            <p>
              Unit 3.2.1 is open for enrollment with active sandbox evaluation.
            </p>
          </div>
          {first ? (
            <Link href={`/units/${first.id}`}>
              <span>Start Unit {first.id} [Live Workbench]</span>
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function PhaseBlock({ phase, firstUnitId }: { phase: Phase; firstUnitId: string | null }) {
  return (
    <article id={phase.id}>
      {/* Header bar */}
      <div>
        <div>
          <span>
            PHASE 0{phase.phaseNum}
          </span>
          <h2>{phase.name}</h2>
        </div>
        <div>
          {phase.badge ? (
            <span>
              {phase.badge}
            </span>
          ) : null}
          <span>{phase.estHours}</span>
        </div>
      </div>

      <div>
        <div>
          <div>
            <span>
              ENGINEERING RATIONALE
            </span>
            <p>{phase.why}</p>
          </div>
          <div>
            <span>
              CONCRETE OUTCOME
            </span>
            <p>{phase.outcome}</p>
          </div>
        </div>

        {/* Modules */}
        <div>
          <span>
            CORE DELIVERABLES & MODULES
          </span>
          <ul>
            {phase.modules.map((m) => (
              <li key={m}>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        {phase.note ? (
          <div>
            <p>
              <span>SPEC NOTE:</span> {phase.note}
            </p>
            {phase.phaseNum === 3 && firstUnitId ? (
              <Link href={`/units/${firstUnitId}`}>
                <span>Start Unit {firstUnitId}</span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
