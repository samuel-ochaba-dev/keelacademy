import Link from "next/link";
import {
  listUnits,
  loadCurriculumMap,
  loadPlacementDiagnostic,
  loadUnit,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const units = listUnits();
  const first = units[0];
  const firstUnit = first ? loadUnit(first.id) : null;
  const rubricCriteria = firstUnit?.rubric?.criteria ?? [];

  // Every figure on this page is read from content/, so the landing claims
  // cannot drift from the curriculum they describe.
  const map = loadCurriculumMap();
  const phaseCount = map.phases.length;
  const totalHours = map.phases.reduce((sum, p) => sum + p.est_hours, 0);
  const placement = loadPlacementDiagnostic("placement-phase-1");

  return (
    <div>
      {/* Hero */}
      <section className="shell grid items-center gap-16 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
        <div>
          <p className="eyebrow">Applied AI engineering program</p>
          <h1 className="display-heading mt-5">
            <span className="text-lime-pulse">Learn AI engineering</span> by
            shipping one real system.
          </h1>
          <p className="lead mt-6">
            Across {phaseCount} phases you build an invoice reconciliation and
            dispute triage pipeline for OmniSupply Operations, a simulated B2B
            distributor, from first commit to deployed system. Every submission
            runs against real tests and a published rubric. It passes only when
            the work holds up.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/sign-up" className="btn btn-accent">
              Start building
            </Link>
            <Link href="/curriculum" className="btn btn-ghost">
              See the curriculum
            </Link>
          </div>
          <p className="mt-5 text-[14px] text-[color:var(--text-faint-on-dark)]">
            Enroll per unit, clear milestone gates, earn a rebate as you go.
          </p>
        </div>

        {/* Grading preview panel: the real rubric, loaded live from content */}
        {rubricCriteria.length > 0 ? (
          <aside
            aria-label="What passing looks like"
            className="code-block code-window"
          >
            <span className="code-title" aria-hidden>
              rubric-{first.id}.yaml
            </span>
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">What passing looks like</p>
              <span className="chip chip-outline">Unit {first.id}</span>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
              Every unit publishes its rubric before you build. Your submission
              is graded against each criterion, and each verdict has to quote
              the lines of your own code that earned it.
            </p>
            <ul className="mt-6 space-y-5">
              {rubricCriteria.slice(0, 4).map((criterion) => (
                <li key={criterion.id} className="flex gap-3.5">
                  <svg
                    aria-hidden
                    className="mt-1 shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle cx="8" cy="8" r="7" stroke="var(--color-lime-pulse)" strokeWidth="1.4" />
                    <path
                      d="M4.8 8.2l2.1 2.1 4.3-4.6"
                      stroke="var(--color-lime-pulse)"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="font-goga text-[15px] font-medium text-phosphor-white">
                      {criterion.id
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[color:var(--text-faint-on-dark)]">
                      {criterion.description.split(".")[0]}.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-t border-[color:var(--line-on-dark)] pt-4 text-[12.5px] text-[color:var(--text-faint-on-dark)]">
              The published rubric for Unit {first.id}, loaded live from the
              curriculum. {firstUnit?.checks?.length ?? 0} automated checks run
              on every submission first.
            </p>
          </aside>
        ) : null}
      </section>

      {/* Stats */}
      <section aria-label="Program at a glance" className="shell pb-24">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
          <div>
            <p className="stat-number">{phaseCount}</p>
            <p className="stat-label">Phases, one system</p>
          </div>
          <div>
            <p className="stat-number">{totalHours}</p>
            <p className="stat-label">Hours of real build work</p>
          </div>
          <div>
            <p className="stat-number">3</p>
            <p className="stat-label">Ways every milestone is checked</p>
          </div>
          <div>
            <p className="stat-number">15%</p>
            <p className="stat-label">Rebate at each milestone gate</p>
          </div>
        </div>
      </section>

      {/* How a unit works */}
      <section className="section" id="how-it-works">
        <div className="shell">
          <div className="max-w-[62ch]">
            <p className="eyebrow">How a unit works</p>
            <h2 className="heading-xl mt-4">
              Six steps, the same loop in every unit.
            </h2>
            <p className="lead mt-5">
              Each unit is a small engineering engagement: learn the concept,
              practice on a parallel task, build the deliverable, get it graded,
              unblock yourself fast when stuck, and move on.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Learn",
                body: "One written lesson, read start to finish. It works the concept, then the client's numbers, then the exact thing you are about to produce, with checkpoints you answer before you read an answer.",
              },
              {
                step: "02",
                title: "Practice",
                body: "Study a fully worked example of a parallel task, then fill the gaps in a completion problem that is auto-graded on every save.",
              },
              {
                step: "03",
                title: "Build",
                body: "Ship the deliverable to your own git repository. The deliverable and the submission contract are published up front.",
              },
              {
                step: "04",
                title: "Verify",
                body: "Your push triggers the checks and the rubric review. Every verdict quotes evidence from your code, so you know exactly what to fix.",
              },
              {
                step: "05",
                title: "Unstuck",
                body: "Every unit lists its common failure modes with the specific fix, and an assistant scoped to that unit answers questions any hour.",
              },
              {
                step: "06",
                title: "Move on",
                body: "Passing a unit unlocks the next. Passing a milestone gate earns a 15% rebate. Progress is measured only in verified work.",
              },
            ].map((item) => (
              <li
                key={item.step}
                className="card-dark p-7"
              >
                <span className="text-[12px] font-medium tracking-[0.12em] text-moss-70">
                  STEP {item.step}
                </span>
                <h3 className="heading-md mt-3">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Grading */}
      <section className="section" id="grading">
        <div className="shell">
          <div className="max-w-[62ch]">
            <p className="eyebrow">Graded for real</p>
            <h2 className="heading-xl mt-4">
              A pass means the work was checked, not watched.
            </h2>
            <p className="lead mt-5">
              Most courses grade what you watched. This program grades what you
              shipped. Every deliverable is checked three ways, and the bar is
              published before you write a line.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: "1",
                title: "Automated checks",
                body: "Your code runs in a clean, isolated environment against the unit's test suite and data. The results name every check that passed or failed, with the command output to read.",
              },
              {
                num: "2",
                title: "Rubric review",
                body: "A language model grades your submission against the unit's published criteria, and every verdict has to quote the lines of your own code that earned it. No evidence, no pass.",
              },
              {
                num: "3",
                title: "Defend the build",
                body: "Milestone work is defended in conversation, once to a technical reviewer and once to the budget holder. Both are AI following a written brief, and your side of the transcript is scored against a rubric you can read first.",
              },
            ].map((stage) => (
              <article key={stage.num} className="card-dark p-8">
                <div className="flex items-baseline gap-4">
                  <span className="font-goga text-[28px] font-medium text-phosphor-white">
                    {stage.num}
                  </span>
                  <h3 className="font-goga text-[20px] font-medium text-phosphor-white">
                    {stage.title}
                  </h3>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                  {stage.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="shell section-tight" id="support">
        <div className="card-dark p-8 lg:p-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="eyebrow">Support on every unit</p>
              <h2 className="heading-lg mt-4">
                Help that shows up at 2am, scoped to the exact lesson.
              </h2>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                Stuck is normal. What matters is how fast you get unstuck. Each
                unit carries its own failure-mode list, and an assistant that
                knows the lesson answers questions whenever you have them.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/curriculum" className="btn btn-primary">
                  Browse the units
                </Link>
                <Link href="/faq" className="btn btn-ghost">
                  Read the FAQ
                </Link>
              </div>
            </div>
            <ul className="space-y-7">
              {[
                {
                  title: "An assistant scoped to the unit",
                  body: "Ask why a concept works, request another practice exercise, or get unblocked on an error. It knows the curriculum, not the internet.",
                },
                {
                  title: "Planned failure modes, published",
                  body: "Every unit lists what usually breaks, with the specific fix linked. Most stuck moments end in one click.",
                },
                {
                  title: "A pod that ships with you",
                  body: "You post what shipped, what broke, and what is next, every week. Peers review milestone work against the same rubric the platform uses.",
                },
                {
                  title: "A public gallery of real work",
                  body: "Passed projects can be published with their verification attached. Your portfolio proves itself.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-lime-pulse"
                  />
                  <div>
                    <h3 className="font-goga text-[17px] font-medium text-phosphor-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Units */}
      <section className="shell section" id="units">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[56ch]">
            <p className="eyebrow">Curriculum Units</p>
            <h2 className="heading-lg mt-4">
              Units open for enrollment.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
              Each unit page shows the full lesson, the practice set, the
              deliverable, and the exact rubric before you pay.
            </p>
          </div>
          <Link href="/curriculum" className="btn btn-ghost btn-sm">
            All {phaseCount} phases
          </Link>
        </div>

        {units.length > 0 ? (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {units.map((u) => {
              const unit = loadUnit(u.id);
              return (
                <li key={u.id} className="card-dark flex flex-col p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="chip chip-outline">Unit {u.id}</span>
                    <span className="text-[13px] text-[color:var(--text-faint-on-dark)]">
                      Phase {u.phase}
                    </span>
                  </div>
                  <h3 className="mt-4 font-goga text-[19px] font-medium leading-snug text-phosphor-white">
                    {unit?.script?.title ?? unit?.curriculum?.title ?? `Unit ${u.id}`}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                    {unit?.yaml.build.deliverable}
                  </p>
                  <div className="mt-6 flex-1" />
                  <Link href={`/units/${u.id}`} className="btn btn-ghost btn-sm self-start">
                    Open the unit
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {/* Final CTA */}
      <section className="shell pb-8">
        <div className="card-dark flex flex-col items-start justify-between gap-8 p-12 md:flex-row md:items-center">
          <div>
            <h2 className="heading-lg">Your first submission is one push away.</h2>
            <p className="mt-3 max-w-[48ch] text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
              Create an account
              {placement ? `, take the ${placement.est_minutes}-minute placement check,` : ","} and
              open your first unit the same session.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-4">
            <Link href="/sign-up" className="btn btn-primary">
              Start building
            </Link>
            <Link href="/pricing" className="btn btn-ghost">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
