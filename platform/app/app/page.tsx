import Link from "next/link";
import Image from "next/image";
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
} from "@/components/icons";

export const dynamic = "force-dynamic";

const PAIN_POINTS = [
  {
    title: "The weekend demo trap",
    body: "You follow a tutorial, wire up a framework, and by Sunday night you have a demo that reads a PDF and answers questions. It feels like progress.",
  },
  {
    title: "The 3,000th input problem",
    body: "Then someone asks how you know it works on messy real-world scans, rude emails, or hostile inputs. What it costs to run at volume. You tweak the prompt, rerun once, and hope. That is not engineering.",
  },
  {
    title: "The missing grader",
    body: "The sinking feeling is not a you problem. Nobody ever graded your work, so you never found out where the gaps were. Tutorials show you their happy path; they cannot evaluate yours.",
  },
];

const UNIT_STEPS = [
  {
    name: "Learn",
    body: "A written lesson in three layers: the enduring concept, how it lands in the Meridian pipeline, and current tool specifics audited quarterly.",
  },
  {
    name: "Practice",
    body: "An annotated worked example of a parallel task, then a completion problem with gaps you fill and verify against deterministic checks.",
  },
  {
    name: "Build",
    body: "The curriculum deliverable against your own variant of the Meridian corpus. Copied answer keys fail on your data.",
  },
  {
    name: "Verify",
    body: "Push your repo. Isolated containers run the tests, a calibrated judge grades against a versioned rubric, and gates trigger code defenses.",
  },
  {
    name: "Unstuck",
    body: "A panel of specific failure modes and concrete fixes, grown from real student attempts. The answer you would ask a TA for at 11pm.",
  },
];

const VERIFICATION_LAYERS = [
  {
    layer: "Layer 1",
    name: "Automated sandbox checks",
    detail: "Runs on every git push",
    icon: IconTerminal,
    body: "Your code executes in an isolated Docker container with strict CPU, memory, time, and network bounds. In Unit 3.2.1, eight checks run against 20 messy claim notes including adversarial inputs.",
  },
  {
    layer: "Layer 2",
    name: "Calibrated rubric judge",
    detail: "Calibrated against human grades",
    icon: IconShieldCheck,
    body: "A versioned rubric with concrete criteria. The judge must quote exact lines of your code or logs as auditable evidence. Rubric changes that degrade agreement with human baselines block their own merge.",
  },
  {
    layer: "Layer 3",
    name: "Defend your work",
    detail: "Mandatory at gate units",
    icon: IconCpu,
    body: "Follow-up questions generated directly from your submitted code. Why this schema, why log instead of drop, what breaks at ten times volume. Copy-pasted AI code falls apart here.",
  },
  {
    layer: "Layer 4",
    name: "Recorded walkthrough",
    detail: "High-stakes integration gates",
    icon: IconAward,
    body: "An unscripted video walkthrough of your system running end to end. Hard to fake, and it doubles as a proof asset for your client portfolio.",
  },
];

const PHASE_BLOCKS = [
  { id: "0-1", title: "Orientation and engineering foundations", hours: "120h", focus: "Setup in the first hour, then Python, git, APIs, async, and testing taught through the claims pipeline." },
  { id: "2-3", title: "LLM fundamentals, prompts as code", hours: "140h", focus: "Model physics, context limits, and prompts as versioned, tested artifacts. Unit 3.2.1 is live today." },
  { id: "4-5", title: "Retrieval and agent orchestration", hours: "160h", focus: "Grounding answers in policy documents, then tool-using agents with budgets and stop conditions." },
  { id: "6-8", title: "Fine-tuning, evaluation, cost engineering", hours: "180h", focus: "When adaptation is worth paying for, putting a number on reliability, and cost models a CFO accepts." },
  { id: "9-10", title: "Security, governance, LLMOps", hours: "140h", focus: "Prompt-injection defense, audit trails, and the CI/CD and monitoring that keep probabilistic systems stable." },
  { id: "11", title: "The business of AI engineering", hours: "80h", focus: "A parallel track from day one: pricing, discovery calls rehearsed against AI personas, proposals with explicit exclusions." },
  { id: "12", title: "Capstone and cross-industry portfolio", hours: "100h", focus: "The Meridian system end to end, plus three projects in other verticals so your proof is not one industry deep." },
];

const TAKEAWAYS = [
  "A working, verified claims-triage system: intake, extraction, retrieval, agent triage, evaluation, cost controls, audit trails, and deployment.",
  "Three portfolio projects outside insurance, proving your architecture transfers across domains.",
  "A priced, sendable proposal with the explicit not-included scope that keeps client engagements honest.",
  "One real outreach email actually sent to one real business: a strict graduation requirement.",
  "A Delivery-Ready credential backed by an immutable ledger of test logs and rubric evidence.",
];

const SHORTCOMINGS = [
  {
    title: "We are one unit deep today",
    body: "Unit 3.2.1 is live with full automated grading. The other twelve phases exist as an open, fully specified blueprint and are built phase by phase. You can inspect the entire plan before paying.",
  },
  {
    title: "No videos and no live lectures",
    body: "Lessons are concise technical text. Help comes from annotated worked examples, an always-on concierge, and unstuck panels. If you need video instruction, this will feel dry.",
  },
  {
    title: "No attendance certificate PDF",
    body: "The credential is the verified work itself: git repositories, test logs, rubric quotes, and defend interviews. We do not issue participation PDFs.",
  },
  {
    title: "Finishing is entirely on you",
    body: "Pods, weekly digests, and the completion rebate provide structure, but nobody will drag you across the finish line. Most people who start self-paced programs quit; we design for the ones who finish.",
  },
];

const HOME_FAQS = [
  {
    q: "Do I get a certificate when I finish?",
    a: "No. You get something harder to fake: a verified portfolio and a Delivery-Ready credential that exists only because your work passed sandboxed tests, rubric grading, and an unscripted defense.",
  },
  {
    q: "Who is this school not for?",
    a: "Anyone who wants to watch video playlists rather than write code, anyone looking for a six-week shortcut, and anyone who needs a human teacher chasing them for homework. This is 700 to 950 hours of graded building.",
  },
  {
    q: "Can I start Unit 3.2.1 right now?",
    a: "Yes. Unit 3.2.1 is open for enrollment today with the complete grading pipeline active. It sits inside Phase 3, structured outputs, and demonstrates the exact learning and grading loop used across the entire school.",
  },
  {
    q: "How does the completion rebate work?",
    a: "You pay once. Clear the Phase 5 integration gate inside 365 days and 15% comes back. Clear the final capstone gate and another 15% comes back. You earn back 30% total by completing the work on schedule.",
  },
];

export default function LandingPage() {
  const units = listUnits();
  const first = units[0];
  const firstUnit = first ? loadUnit(first.id) : null;
  const checksCount = firstUnit?.checks?.length ?? 0;
  const criteriaCount = firstUnit?.rubric?.criteria.length ?? 0;
  const unitTitle = firstUnit?.lesson?.title ?? "Structured Outputs";

  return (
    <div>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Bathymetric texture, masked so type stays dominant. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/depth-chart.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.28]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ground/70 via-ground/55 to-ground" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(45,212,191,0.09),transparent_70%)]" />
        </div>

        <div className="shell-wide relative grid items-center gap-12 pt-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-24">
          <div>
            {first ? (
              <p className="rise inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent-soft px-3.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-accent">
                <span className="live-dot" aria-hidden />
                UNIT {first.id} LIVE, NOW ENROLLING
              </p>
            ) : null}

            <h1 className="rise rise-1 mt-6 max-w-[13ch] text-4xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
              You do not need another AI tutorial.
              <span className="block text-accent-strong">You need your work graded.</span>
            </h1>

            <p className="rise rise-2 mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-2">
              Build one production-grade claims pipeline across 13 phases. Every deliverable faces
              sandboxed tests, calibrated judges, and a code defense.
            </p>

            <div className="rise rise-3 mt-8 flex flex-wrap items-center gap-3">
              {first ? (
                <Link href={`/units/${first.id}`} className="btn-primary px-5 py-3 text-[15px]">
                  Start Unit {first.id}
                  <IconArrowRight size={16} />
                </Link>
              ) : null}
              <Link href="/curriculum" className="btn-ghost px-5 py-3 text-[15px]">
                Explore the curriculum
              </Link>
            </div>
          </div>

          {/* Live unit card: real content-repo data, rendered at request time. */}
          {firstUnit && first ? (
            <div className="rise rise-2 panel relative overflow-hidden bg-raised/90 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] backdrop-blur-sm">
              <div className="scanline flex items-center justify-between gap-4 border-b border-line px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
                    <IconCpu size={20} />
                  </span>
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.08em] text-ink-3">
                      NOW ENROLLING
                    </p>
                    <p className="text-sm font-semibold text-ink">
                      Unit {firstUnit.yaml.id}: {unitTitle}
                    </p>
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-3 divide-x divide-line border-b border-line">
                <Stat value={String(firstUnit.yaml.est_hours)} label="hours" />
                <Stat value={String(checksCount)} label="sandbox checks" />
                <Stat value={String(criteriaCount)} label="rubric criteria" />
              </dl>

              <div className="px-6 py-5">
                <p className="text-sm leading-relaxed text-ink-2">
                  <span className="font-medium text-ink">Deliverable:</span>{" "}
                  {firstUnit.yaml.build.deliverable}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="font-mono text-xs text-ink-3">
                    data variant: {firstUnit.yaml.build.data_variant}
                  </span>
                  <Link href={`/units/${firstUnit.yaml.id}`} className="link-arrow text-xs">
                    Inspect unit specs
                    <IconArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <p className="border-t border-line bg-inset/60 px-6 py-3 font-mono text-[11px] tracking-[0.06em] text-ink-3">
                700-950 HOURS TOTAL / NO VIDEOS / NO CREDIT FOR SHOWING UP
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* -------------------- THE PROBLEM + INSPECTION BENCH ------------------ */}
      <section className="section">
        <div className="shell">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              The demo works. Then someone asks questions.
            </h2>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              Reliability, evaluation, cost controls, and security are learnable engineering
              disciplines, not intuitions. You master them by building real systems and having them
              graded honestly.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {PAIN_POINTS.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <div className="border-l-2 border-line-strong pl-5 md:border-l-0 md:border-t-2 md:pt-5 md:pl-0">
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14" delay={0.1}>
            <HeroInspection />
          </Reveal>
        </div>
      </section>

      {/* --------------------------- THE UNIT LOOP --------------------------- */}
      <section id="method" className="section border-t border-line bg-raised/30">
        <div className="shell">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Every unit runs the same five-step loop.
            </h2>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              Across 150+ units the cadence never changes, so you always know what today looks like
              before opening your editor.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-5">
            {UNIT_STEPS.map((step, index) => (
              <li key={step.name} className="bg-raised p-6 transition-colors hover:bg-raised-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-medium tracking-[0.06em] text-accent">
                    {step.name.toUpperCase()}
                  </span>
                  {index < UNIT_STEPS.length - 1 ? (
                    <IconArrowRight size={12} className="text-ink-3 md:hidden" />
                  ) : null}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------- VERIFICATION ENGINE ------------------------- */}
      <section id="verification" className="section border-t border-line">
        <div className="shell">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Four verification layers between you and a false pass.
            </h2>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              Most courses verify completion with multiple-choice quizzes or basic string matching.
              Keel runs an automated evaluation pipeline that catches fragile prompts, test gaming,
              and hallucinations.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {VERIFICATION_LAYERS.map((v, index) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.layer} delay={index * 0.06}>
                  <div className="flex h-full flex-col gap-4 bg-raised p-7">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-10 place-items-center rounded-lg border border-line-strong bg-inset text-accent">
                        <Icon size={19} />
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-ink-3">
                        {v.layer} / {v.detail}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ink">{v.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-2">{v.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-accent/25 bg-accent-soft px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-ink">
                  The platform evaluates itself the way it teaches evaluation
                </p>
                <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-2">
                  Every grading call is traced with full prompts, responses, token usage, and
                  latency. The Phase 7 observability discipline is active on your submissions from
                  day one.
                </p>
              </div>
              <Link href="/submit" className="link-arrow shrink-0">
                Read the submission contract
                <IconArrowRight size={13} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------- CURRICULUM MAP -------------------------- */}
      <section id="curriculum" className="section border-t border-line bg-raised/30">
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                One client. Thirteen phases. 700 to 950 hours.
              </h2>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink-2">
                From setup to capstone, you work for Meridian Mutual, a regional insurer handling
                3,000 messy claims monthly. Every sub-module connects to that running architecture.
              </p>
              <Link href="/curriculum" className="btn-ghost mt-7">
                Read the complete curriculum
                <IconArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          <div className="divide-y divide-line border-y border-line">
            {PHASE_BLOCKS.map((block, index) => (
              <Reveal key={block.id} delay={Math.min(index * 0.04, 0.2)}>
                <Link
                  href={`/curriculum#phase-${block.id.split("-")[0]}`}
                  className="group grid grid-cols-[86px_1fr] items-baseline gap-4 py-5 transition-colors hover:bg-raised-2/50 sm:grid-cols-[110px_1fr]"
                >
                  <div className="font-mono text-xs text-ink-3">
                    <span className="text-accent">P{block.id}</span> {block.hours}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink transition-colors group-hover:text-accent-strong">
                      {block.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">{block.focus}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- TAKEAWAYS ------------------------------ */}
      <section className="section border-t border-line">
        <div className="shell">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              What you walk away with.
            </h2>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              We cannot guarantee clients; nobody honestly can. What we guarantee is narrower: when
              you finish, your work is real, defended, and checked by a system with no incentive to
              flatter you.
            </p>
          </Reveal>

          <ul className="mt-12 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {TAKEAWAYS.map((takeaway, index) => (
              <Reveal key={takeaway.slice(0, 30)} delay={Math.min(index * 0.05, 0.2)}>
                <li className="flex gap-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-pass/40 bg-pass/10 text-pass">
                    <IconCheckCircle size={13} />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-2">{takeaway}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------- HONEST LIMITATIONS ------------------------- */}
      <section className="section border-t border-line bg-raised/30">
        <div className="shell">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Where Keel falls short today.
            </h2>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              Most courses hide their limitations behind marketing adjectives. Ours sit on the
              homepage so you can make a clear-eyed decision.
            </p>
          </Reveal>

          <Reveal className="mt-12">
            <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
              {SHORTCOMINGS.map((item) => (
                <div key={item.title} className="bg-raised p-7">
                  <div className="flex items-center gap-2.5">
                    <IconAlertTriangle size={16} className="text-warn" />
                    <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">{item.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------- FOUNDER STATEMENT ------------------------- */}
      <section className="section border-t border-line">
        <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Why Keel has zero teaching staff, by design.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="space-y-5 text-base leading-relaxed text-ink-2">
              <p>
                When human TAs grade student code, two things consistently happen: grading becomes
                subjective and inconsistent across reviewers, and the price of the school must scale
                to feed a growing teaching staff.
              </p>
              <p>
                Keel runs on a different premise: that automated verification, deterministic sandbox
                checks, LLM judges calibrated against human golden sets, code-defense interviews,
                and recorded walkthroughs, can deliver faster and more rigorous feedback at a
                fraction of the cost.
              </p>
              <p>
                Every grading verdict is logged as an immutable trace. Keeping the rubrics strict
                and the engineering honest is the single job we do not automate.
              </p>
              <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
                <span className="font-mono text-xs text-ink-3">KEEL PLATFORM ARCHITECTURE</span>
                <Link href="/pricing" className="link-arrow">
                  Pricing and the rebate model
                  <IconArrowRight size={13} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- FAQ --------------------------------- */}
      <section className="section border-t border-line bg-raised/30">
        <div className="shell max-w-3xl">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Plain answers to fair questions.
            </h2>
          </Reveal>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {HOME_FAQS.map((faq) => (
              <Reveal key={faq.q}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink transition-colors hover:text-accent-strong">
                    {faq.q}
                    <IconArrowRight
                      size={15}
                      className="shrink-0 text-ink-3 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-ink-2">{faq.a}</p>
                </details>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <Link href="/faq" className="link-arrow">
              Read all frequently asked questions
              <IconArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ FINAL CTA ------------------------------ */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <Image
            src="/depth-chart.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-bottom opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ground via-ground/60 to-ground/80" />
        </div>

        <div className="shell relative py-24 text-center sm:py-28">
          <Reveal>
            <p className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.08em] text-accent">
              <span className="live-dot" aria-hidden />
              UNIT {first ? first.id : "3.2.1"} READY TO GRADE
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Start with the unit that is live today.
            </h2>
            <p className="mx-auto mt-4 max-w-[58ch] text-base leading-relaxed text-ink-2">
              Unit 3.2.1 takes about six hours. You build a schema-constrained extraction engine
              for messy claim notes, push to git, and receive a verified rubric verdict with quoted
              evidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {first ? (
                <Link href={`/units/${first.id}`} className="btn-primary px-5 py-3 text-[15px]">
                  Start Unit {first.id}
                  <IconArrowRight size={16} />
                </Link>
              ) : null}
              <Link href="/pricing" className="btn-ghost px-5 py-3 text-[15px]">
                View pricing and the rebate
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-5 py-4 text-center sm:px-6">
      <dt className="order-2 mt-1 block font-mono text-[10px] tracking-[0.1em] text-ink-3 uppercase">
        {label}
      </dt>
      <dd className="order-1 text-2xl font-semibold tracking-tight text-ink">{value}</dd>
    </div>
  );
}
