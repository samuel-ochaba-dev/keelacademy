import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Curriculum",
  description:
    "Thirteen phases, one anchor client, 700 to 950 hours. The full AI Engineer's Path curriculum, phase by phase, with real outcomes per phase.",
};

type Phase = {
  id: string;
  name: string;
  why: string;
  outcome: string;
  modules: string[];
  note?: string;
};

const PHASES: Phase[] = [
  {
    id: "Phase 0",
    name: "Orientation & Setup",
    why: "Setup is where self-taught learners quietly quit, so the school treats it as the first deliverable instead of a chore before the real work. Sandbox, environment, and the first drill all happen in the first session.",
    outcome: "Your environment runs, and you have already met the client you will serve for the entire program.",
    modules: ["0.1 Meet the client", "0.2 How the curriculum works", "0.3 Environment setup"],
  },
  {
    id: "Phase 1",
    name: "Software Engineering Foundations",
    why: "Every later phase stands on this, so nothing here is taught as abstract syntax. Python, git, APIs, async, and testing are all taught as pieces of the Meridian claims pipeline.",
    outcome: "You can write, test, and structure the code the rest of the program is built on.",
    modules: ["1.1 Python for AI engineering", "1.2 Version control & collaborative workflow", "1.3 Working with APIs & web services", "1.4 Async programming & concurrency", "1.5 Testing & code quality"],
    note: "Already program for a living? A 20-minute placement diagnostic skips you past the basics.",
  },
  {
    id: "Phase 2",
    name: "LLM Fundamentals",
    why: "Most AI flakiness is a mental-model problem. If you think in prompts-as-magic, every failure is a surprise.",
    outcome: "You can predict model behavior: what fits in a context window, why outputs drift, when to switch providers, and how to call an LLM API like an engineer, with retries, timeouts, and structured handling.",
    modules: ["2.1 How transformer models work, practically", "2.2 Tokens, context windows & model behavior", "2.3 The model provider landscape and how to choose", "2.4 Calling LLM APIs like an engineer"],
  },
  {
    id: "Phase 3",
    name: "Prompt Engineering as a Discipline",
    why: "A prompt you cannot diff, version, or test is not engineering. It is an incantation.",
    outcome: "You write prompts as code: versioned, tested, and trusted, with structured outputs that parse every time or fail loudly.",
    modules: ["3.1 System prompt design", "3.2 Structured outputs & schema-constrained generation", "3.3 Few-shot & in-context learning design", "3.4 Prompts as code: versioning & testing"],
    note: "Unit 3.2.1 is live today. It is the unit you can enroll in right now.",
  },
  {
    id: "Phase 4",
    name: "Retrieval-Augmented Generation & Knowledge Grounding",
    why: "Retrieval fails silently. The answer sounds right while being grounded in nothing, and nobody notices until a client does.",
    outcome: "You can ground answers in real policy documents and prove the grounding holds, with chunking, embeddings, hybrid search, and reranking working together.",
    modules: ["4.1 Chunking & document processing", "4.2 Embeddings & vector databases", "4.3 Hybrid search & reranking", "4.4 Agentic & graph-based retrieval"],
  },
  {
    id: "Phase 5",
    name: "Tool Use & Agent Orchestration",
    why: "Agents fail in loops, and they fail expensively. This is also where most self-taught builders stall, and the curriculum says so out loud before you get there.",
    outcome: "You build agents that call tools with budgets, stop conditions, and memory that survives a long conversation.",
    modules: ["5.1 Function calling & tool schemas", "5.2 Single-agent reasoning loops", "5.3 Multi-agent orchestration", "5.4 Orchestration frameworks & interoperability protocols", "5.5 Memory & state design"],
    note: "Clearing the Phase 5 integration gate inside its window earns the first completion rebate.",
  },
  {
    id: "Phase 6",
    name: "Fine-Tuning & Model Adaptation",
    why: "Fine-tuning is the most over-prescribed tool in the stack. Used wrong, it is an expensive way to avoid fixing your retrieval.",
    outcome: "You choose between prompting, RAG, and fine-tuning on evidence, and you only pay for LoRA when it actually wins.",
    modules: ["6.1 When to fine-tune (vs. prompt vs. RAG)", "6.2 Supervised fine-tuning fundamentals", "6.3 LoRA/QLoRA hands-on", "6.4 Preference-based methods"],
  },
  {
    id: "Phase 7",
    name: "Evaluation & Observability",
    why: "This is the phase the entire school is built on. The platform grades your work with exactly the discipline this phase teaches: golden sets, judges calibrated against humans, full traces, regression gates.",
    outcome: "You can put a number on 'it works', trace any single decision the system made, and catch a regression before a user does.",
    modules: ["7.1 Building golden datasets", "7.2 Automated & LLM-as-judge evaluation", "7.3 Production observability & tracing", "7.4 Regression testing for non-deterministic systems"],
  },
  {
    id: "Phase 8",
    name: "Cost & Performance Engineering",
    why: "Three thousand claims a month is where demo economics go to die. A system that costs more than the labor it saves is a science project.",
    outcome: "You can model token spend before you ship, route cheap tasks to cheap models, and hand a CFO a cost sheet they accept.",
    modules: ["8.1 Token & cost modeling", "8.2 Model routing", "8.3 Prompt caching & latency optimization"],
  },
  {
    id: "Phase 9",
    name: "Security, Safety & Governance",
    why: "A claims system reads hostile input for a living. Prompt injection is not an edge case here; it is Tuesday.",
    outcome: "You build the defenses, the human-in-the-loop checkpoints, and the audit trail that let a compliance officer say yes to running this on real customer data.",
    modules: ["9.1 Prompt injection & adversarial input defense", "9.2 The standard risk categories for LLM applications", "9.3 Human-in-the-loop design for high-stakes actions", "9.4 Audit trails, data privacy & access control"],
  },
  {
    id: "Phase 10",
    name: "Deployment & Production (LLMOps)",
    why: "Shipping a probabilistic system is a different discipline from shipping deterministic software, and most deployment courses pretend otherwise.",
    outcome: "You wrap the system as an API, containerize it, wire CI/CD that tolerates non-determinism, and run monitoring and on-call without heroics.",
    modules: ["10.1 Wrapping AI systems as APIs", "10.2 Containerization & environment management", "10.3 CI/CD for probabilistic systems", "10.4 Monitoring, alerting & on-call"],
  },
  {
    id: "Phase 11",
    name: "The Business of AI Engineering (parallel track)",
    why: "Finishing technically strong and financially broke is the most common ending to this story, and it happens because the business skills get saved for 'later'. This track runs from week one, paired with the technical phases, and every artifact gets rehearsed against an AI counterparty before it gets written.",
    outcome: "You leave with a niche, case studies, a pricing model, rehearsed discovery calls, and a sendable proposal with an explicit not-included section.",
    modules: ["11.1 Positioning & niche selection", "11.2 Portfolio & case studies", "11.3 Pricing models", "11.4 Finding & qualifying leads", "11.5 Discovery calls & scoping", "11.6 Proposals & contracts", "11.7 Scope management & client communication", "11.8 Delivery, reporting & retainer conversion", "11.9 Testimonials, referrals & staying current"],
  },
  {
    id: "Phase 12",
    name: "Capstone & Portfolio",
    why: "One project proves depth. Three more prove it was not a fluke of the industry you happened to start in.",
    outcome: "The Meridian system end to end, three cross-industry portfolio projects, and the full project ladder in one place, verified.",
    modules: ["12.1 The capstone: Meridian Mutual, end to end", "12.2 Portfolio projects beyond insurance", "12.3 The full project ladder"],
    note: "Clearing the capstone gate inside its window earns the second completion rebate.",
  },
];

const DONE_BAR = [
  "The system works, with a golden-set accuracy score you are not embarrassed by.",
  "You can explain every why, not just every how, in a recorded defense.",
  "It survives a skeptical technical reviewer and a skeptical business owner.",
  "The business layer is real: one outreach email, actually sent to a real business.",
  "Your first pitch is ready to send the day you finish, because the capstone recording is the pitch.",
];

export default function CurriculumPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <p className="eyebrow">The curriculum</p>
      <h1 className="font-display mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
        Thirteen phases, one client, no electives.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Everything you build serves one engagement: turning Meridian Mutual&apos;s
        manual claims intake into a pipeline a regulator, a claims manager, and a
        CFO would all sign off on. Every phase ends in an integration project that
        plugs into that running system. The business track runs in parallel from
        week one, because saving it for the end is how engineers finish skilled
        and broke.
      </p>
      <p className="mt-4 max-w-2xl font-mono text-sm text-ink-soft">
        700 to 950 hours total · 9 to 15 months at 12 to 15 hours a week · faster full-time
      </p>

      <div className="mt-14 space-y-0 border-t border-line">
        {PHASES.map((phase) => (
          <section key={phase.id} className="reveal border-b border-line py-10">
            <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
              <div>
                <p className="eyebrow">{phase.id}</p>
                <h2 className="font-display mt-2 text-2xl font-semibold leading-snug">
                  {phase.name}
                </h2>
                {phase.note ? (
                  <p className="mt-3 border-l-2 border-school pl-3 text-sm text-ink-soft">
                    {phase.note}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="leading-relaxed text-ink-soft">{phase.why}</p>
                <p className="mt-4 leading-relaxed">
                  <em>{phase.outcome}</em>
                </p>
                <ul className="mt-4 grid gap-x-8 gap-y-1.5 text-sm text-ink-soft sm:grid-cols-2">
                  {phase.modules.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="py-14">
        <p className="eyebrow">Section 14</p>
        <h2 className="font-display mt-4 text-3xl font-semibold">
          What &ldquo;done&rdquo; means.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          There is no exam. The bar is the curriculum&apos;s own definition of done,
          made checkable:
        </p>
        <ul className="mt-6 max-w-2xl space-y-3">
          {DONE_BAR.map((item) => (
            <li key={item.slice(0, 24)} className="flex gap-3 leading-relaxed">
              <span aria-hidden className="mt-1 text-school">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line pt-12 pb-4">
        <h2 className="font-display text-2xl font-semibold">
          The honest fine print
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          One unit, 3.2.1, is live and fully graded today. The other twelve phases
          above are the published spec the school is building against, phase by
          phase, in curriculum order. Tools named in the lessons are the current
          defaults as of 2026, and the tool-specific sections of every lesson are
          re-audited quarterly, because this stack moves and the school pretends
          otherwise at its peril.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary">
              Start Unit {first.id}
            </Link>
          ) : null}
          <Link href="/pricing" className="btn-secondary">
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
