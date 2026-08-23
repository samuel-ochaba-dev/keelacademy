import Link from "next/link";
import { listUnits, loadUnit } from "@/lib/content";
import { HeroInspection } from "@/components/hero-inspection";

export const dynamic = "force-dynamic";

const PAIN_PARAGRAPHS = [
  "You know the pattern. You follow a tutorial, wire up a framework, and by Sunday night you have a demo that reads a PDF and answers questions about it. It feels like progress.",
  "Then somebody asks how you know it works. Not once, but on the three-thousandth input. What it costs to run at that volume. What happens when a claim arrives as a blurry scan stapled to a rude email and a policy document with exclusions on page fourteen. You tweak the prompt, rerun the demo, and hope. That is not engineering. That is guessing with nicer tooling.",
  "The sinking feeling is not a you problem. Nobody ever graded your work, so you never found out where the gaps were. Tutorials cannot do that part. They can only show you theirs.",
];

const UNIT_STEPS = [
  {
    num: "01",
    name: "Learn",
    body: "A written lesson, not a video playlist. Every lesson is built in three layers: the concept that changes slowly, how that concept shows up in the Meridian pipeline, and the current tool syntax, which is marked separately so it gets re-audited every quarter.",
  },
  {
    num: "02",
    name: "Practice",
    body: "A fully worked example of a parallel task, annotated line by line with the why behind each decision. Then a completion problem: the same example with pieces removed, auto-graded. In Unit 3.2.1 the parallel task is an invoice-notes parser, the same shape as your claim-notes extractor, different enough that copying it gets you nothing.",
  },
  {
    num: "03",
    name: "Build",
    body: "The deliverable, verbatim from the curriculum, against your own variant of the Meridian data. Your corpus is seeded from your student id, so an answer key copied from another student fails on your data.",
  },
  {
    num: "04",
    name: "Verify",
    body: "You push to git. Sandboxed tests run, a judge grades the work against a versioned rubric and quotes your own code as evidence, and at gate units you answer defend-your-work questions about the decisions the judge flagged.",
  },
  {
    num: "05",
    name: "Unstuck",
    body: "Every unit carries a panel of the specific ways it usually breaks, written from real student failures. It is the answer you would have asked a TA for at 11pm, except you do not wait for anyone.",
  },
];

const VERIFICATION_LAYERS = [
  {
    layer: "Layer 1",
    name: "Sandboxed tests",
    detail: "Runs on every submission",
    body: "Your code executes in an isolated container with hard limits on time, memory, and network. In Unit 3.2.1 that is 8 checks against 20 deliberately messy claim notes, including the ones designed to break a naive parser.",
  },
  {
    layer: "Layer 2",
    name: "Rubric judgment",
    detail: "Calibrated against human grades",
    body: "A versioned rubric (5 criteria in 3.2.1) graded by a judge that must quote your code or your logs as evidence for every call. The judge is calibrated against a golden set of pre-graded submissions, and any rubric change that degrades its agreement with human grades blocks its own merge.",
  },
  {
    layer: "Layer 3",
    name: "Defend your work",
    detail: "At gate units",
    body: "Short interview questions about the decisions the judge flagged. Why this schema, why log instead of drop, what breaks at ten times the volume. Submissions written by pasting AI output tend to fall apart here, which is the point.",
  },
  {
    layer: "Layer 4",
    name: "Recorded walkthrough",
    detail: "At the high-stakes gates",
    body: "You narrate the system running, end to end. It doubles as the first asset in your portfolio, because a client can watch it too.",
  },
];

const PHASE_ROWS = [
  { id: "0-1", title: "Orientation and engineering foundations", focus: "Setup in the first hour, then Python, git, APIs, async, and testing, taught as pieces of the claims pipeline." },
  { id: "2-3", title: "LLM fundamentals and prompt engineering", focus: "How the models actually behave, then prompts as versioned, tested code. Unit 3.2.1 is live today." },
  { id: "4-5", title: "Retrieval and agents", focus: "Grounding answers in real policy documents, then tool-using agents with budgets and stop conditions." },
  { id: "6-8", title: "Fine-tuning, evaluation, and cost", focus: "When adaptation is worth paying for, how to put a number on 'it works', and a cost model a CFO accepts." },
  { id: "9-10", title: "Security and production", focus: "Prompt-injection defense, audit trails, and the CI/CD and monitoring that keep a probabilistic system alive." },
  { id: "11", title: "The business track, in parallel from week one", focus: "Positioning, pricing, discovery calls rehearsed against AI personas, and a proposal with an explicit not-included section." },
  { id: "12", title: "Capstone and portfolio", focus: "The Meridian system end to end, plus three projects in other industries so your proof is not one vertical deep." },
];

const TAKEAWAYS = [
  "A working, verified claims-triage system: intake, extraction, retrieval, agent triage, evaluation, cost controls, audit trail, deployment.",
  "Three portfolio projects outside insurance, so you can pitch more than one industry.",
  "A priced, sendable proposal, with the explicit not-included section that keeps scope honest.",
  "One real outreach email, actually sent to one real business. That is a graduation requirement, not a suggestion.",
  "A Delivery-Ready credential that means something, because every gate behind it was checked by something that does not know you and does not grade on sympathy.",
];

const SHORTCOMINGS = [
  {
    title: "We are one unit deep.",
    body: "Unit 3.2.1 is live with full grading. The rest of the curriculum exists as a published, fully specified plan and is being built phase by phase. You can read the entire plan before you pay for anything, and you should.",
  },
  {
    title: "There are no videos and no live classes.",
    body: "Lessons are text, help comes from written worked examples, an always-on concierge, and the unstuck panels. If you learn best by watching someone talk, this format will feel dry.",
  },
  {
    title: "There is no certificate PDF.",
    body: "The credential is the verified work itself: the repos, the verdicts, the recorded walkthroughs. If you need a frameable document, we cannot give you one.",
  },
  {
    title: "Finishing is still on you.",
    body: "Pods, weekly digests, and the completion rebate all push in the right direction. Nothing drags you across the line. Most people who start a 700-hour self-paced program do not finish it, and we would rather you know that now.",
  },
];

const HOME_FAQS = [
  {
    q: "Do I get a certificate?",
    a: "No. You get something harder to fake: a verified portfolio and a Delivery-Ready credential that only exists because your work passed tests, rubric grading, and a defense. A PDF that says you watched videos proves the opposite of what we are going for.",
  },
  {
    q: "Who is this not for?",
    a: "Anyone who wants to watch rather than build, anyone looking for a six-week transformation, and anyone who needs a teacher checking in to keep going. The program is 700 to 950 hours of graded building. That filters most people out, and it is supposed to.",
  },
  {
    q: "Can I start today?",
    a: "Yes. Unit 3.2.1 is open for enrollment right now, with the full grading pipeline behind it. It sits inside Phase 3, prompt engineering as a discipline, and it is a real slice of the whole method.",
  },
  {
    q: "What does it cost?",
    a: "The pricing page has the current number and the completion rebate, which hands money back when you clear the big gates. Short version: one-time pricing, no subscription, and part of it comes back when you do the work.",
  },
];

export default function LandingPage() {
  const units = listUnits();
  const first = units[0];
  const firstUnit = first ? loadUnit(first.id) : null;
  const checksCount = firstUnit?.checks?.length ?? 0;
  const criteriaCount = firstUnit?.rubric?.criteria.length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* 1. HERO */}
      <section className="py-16 sm:py-24">
        <p className="eyebrow">Keel Academy · The AI Engineer&apos;s Path</p>
        <h1 className="font-display mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-6xl">
          You don&apos;t need another AI course. You need your work graded.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Keel is a self-paced engineering school. You build one production-grade
          AI system end to end, a claims-triage pipeline for a fictional insurer,
          and every deliverable is checked by sandboxed tests, a calibrated rubric
          judge, and a defend-your-work interview. 700 to 950 hours. No videos.
          No credit for showing up.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary">
              Start Unit {first.id}
            </Link>
          ) : null}
          <Link href="/curriculum" className="btn-secondary">
            Read the full curriculum
          </Link>
        </div>

        {firstUnit && (
          <div className="card mt-12 max-w-2xl">
            <p className="eyebrow">Now teaching</p>
            <p className="mt-3 font-display text-xl font-semibold">
              Unit {firstUnit.yaml.id} · {firstUnit.lesson?.title ?? "Structured outputs"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {firstUnit.yaml.build.deliverable}
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-ink-soft">
              {firstUnit.yaml.est_hours} hours · {checksCount} sandbox checks · {criteriaCount} rubric criteria
            </p>
            <p className="mt-3 text-xs text-ink-soft">
              This card is rendered from the actual unit files in the content repo,
              not from marketing copy.
            </p>
          </div>
        )}
      </section>

      <hr />

      {/* 2. PAIN */}
      <section className="py-16 sm:py-20">
        <p className="eyebrow">Sound familiar?</p>
        <div className="reveal mt-6 max-w-2xl">
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            The demo works. Then someone asks questions.
          </h2>
          <div className="mt-6 space-y-5 leading-relaxed">
            {PAIN_PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>

        <div className="reveal mt-12">
          <HeroInspection />
        </div>
      </section>

      <hr />

      {/* 3. REFRAME + PIVOT */}
      <section className="py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="leading-relaxed">
            Here is the good news. Reliability, evaluation, cost control, security:
            these are learnable engineering disciplines, not taste. But they cannot
            be learned by watching. You learn them by building something real and
            having it graded honestly, over and over, until the work holds up.
          </p>
          <p className="mt-5 font-display text-2xl font-semibold">
            I built Keel to be that grader.
          </p>
        </div>
      </section>

      <hr />

      {/* 4. METHOD */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <p className="eyebrow">The method</p>
        <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
          Every unit runs the same loop.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          The curriculum has more than 150 units, and every one of them works the
          same five-step way. You always know what today looks like.
        </p>

        <ol className="mt-10 space-y-0 border-t border-line">
          {UNIT_STEPS.map((step) => (
            <li key={step.num} className="reveal grid gap-3 border-b border-line py-8 sm:grid-cols-[4rem_10rem_1fr]">
              <span className="font-mono text-sm text-ink-soft">{step.num}</span>
              <span className="font-display text-xl font-semibold">{step.name}</span>
              <p className="leading-relaxed text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <hr />

      {/* 5. GRADING */}
      <section id="verification" className="py-16 sm:py-20">
        <p className="eyebrow">How you are graded</p>
        <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
          Four layers between you and a false pass.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          Most courses grade you the way a smoke detector guards a casino: loudly,
          and only when it doesn&apos;t matter. Keel&apos;s whole reason to exist is
          the verification stack, so here is exactly how it works.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {VERIFICATION_LAYERS.map((v) => (
            <div key={v.layer} className="card reveal">
              <p className="eyebrow">{v.layer} · {v.detail}</p>
              <h3 className="font-display mt-3 text-xl font-semibold">{v.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink-soft">
          One more thing, because it matters: the school grades itself with the same
          discipline it teaches. Every grading call is traced, prompt and response,
          and the trace is auditable later. The evaluation rigor you learn in
          Phase 7 is the rigor applied to your own verdicts from day one.
        </p>
      </section>

      <hr />

      {/* 6. CURRICULUM MAP */}
      <section id="curriculum" className="py-16 sm:py-20">
        <p className="eyebrow">The map</p>
        <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
          One client. Thirteen phases. 700 to 950 hours.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          From your first unit to your capstone, you work for one fictional client:
          Meridian Mutual, a 65-person regional insurer processing about 3,000
          claims a month. Today a human reads every intake form, scan, photo, and
          phone note, and routing a claim takes two to three days. Your job, across
          thirteen phases, is to build the system that fixes that, and then learn
          to sell it.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="w-28">Phases</th>
                <th className="w-72">Block</th>
                <th>What it covers</th>
              </tr>
            </thead>
            <tbody>
              {PHASE_ROWS.map((row) => (
                <tr key={row.id} className="reveal">
                  <td className="font-mono text-ink-soft">{row.id}</td>
                  <td className="font-medium">{row.title}</td>
                  <td className="text-ink-soft">{row.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm">
          <Link href="/curriculum">Read the full curriculum, phase by phase →</Link>
        </p>
      </section>

      <hr />

      {/* 7. WHAT YOU WALK AWAY WITH */}
      <section className="py-16 sm:py-20">
        <p className="eyebrow">The finish line</p>
        <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
          What you walk away with.
        </h2>
        <ul className="mt-8 max-w-2xl space-y-4">
          {TAKEAWAYS.map((t) => (
            <li key={t.slice(0, 24)} className="reveal flex gap-3 leading-relaxed">
              <span aria-hidden className="mt-1 text-school">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl leading-relaxed text-ink-soft">
          We cannot guarantee you clients. Nobody honestly can. What we guarantee
          is narrower and stronger: if you finish, the work is real, and it was
          verified by something with no reason to be kind to you.
        </p>
      </section>

      <hr />

      {/* 8. HONEST LIMITATIONS */}
      <section className="py-16 sm:py-20">
        <p className="eyebrow">Before you decide</p>
        <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
          Where Keel falls short today.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {SHORTCOMINGS.map((s) => (
            <div key={s.title} className="reveal border-l-2 border-mark pl-5">
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr />

      {/* 9. FOUNDER */}
      <section className="py-16 sm:py-20">
        <p className="eyebrow">The person behind it</p>
        <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
          Hi, I&apos;m <span className="need">[NEED: founder first name]</span>.
        </h2>
        <div className="mt-6 max-w-2xl space-y-5 leading-relaxed">
          <p>
            <span className="need">[NEED: origin story. In what year, at what company, did you hit the wall this school solves? One specific memory, not a resume summary.]</span>
          </p>
          <p>
            <span className="need">[NEED: credibility specifics. Systems you have built, scale, years, domains. Real facts only.]</span>
          </p>
          <p>
            What I can tell you now, because the repo proves it: Keel has no
            teaching staff by design. The grading pipeline is built with the same
            evaluation discipline the curriculum teaches in Phase 7, every verdict
            is traced and auditable, and keeping the rubrics honest is the one job
            I deliberately did not automate.
          </p>
          <p>
            <span className="need">[NEED: closing line to the reader, in your own words. Why does this school exist for you?]</span>
          </p>
        </div>
      </section>

      <hr />

      {/* 10. QUESTIONS */}
      <section className="py-16 sm:py-20">
        <p className="eyebrow">Fair questions</p>
        <h2 className="font-display mt-6 text-3xl font-semibold sm:text-4xl">
          Asked by skeptics, answered plainly.
        </h2>
        <dl className="mt-10 max-w-3xl space-y-8">
          {HOME_FAQS.map((faq) => (
            <div key={faq.q} className="reveal">
              <dt className="font-display text-lg font-semibold">{faq.q}</dt>
              <dd className="mt-2 leading-relaxed text-ink-soft">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm">
          <Link href="/faq">Read the full FAQ →</Link>
        </p>
      </section>

      <hr />

      {/* 11. FINAL CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Start with the unit that&apos;s live.
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            {firstUnit
              ? `Unit ${firstUnit.yaml.id} takes about ${firstUnit.yaml.est_hours} hours. You will build a structured-extraction pipeline for messy claim notes, run it against sandboxed tests, and get a real rubric verdict with evidence quoted from your own code. If the loop works on you the way it should, the other twelve phases are waiting.`
              : "The first unit is being wired up right now. Check back shortly."}
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
        </div>
      </section>
    </div>
  );
}
