import Link from "next/link";
import { listUnits, loadCurriculumMap } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const units = listUnits();
  const curriculumMap = loadCurriculumMap();

  // Key phases highlighted for the curriculum showcase
  const highlightPhaseNums = [0, 1, 3, 5, 11];
  const highlightPhases = curriculumMap.phases.filter((p) =>
    highlightPhaseNums.includes(p.phase)
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/50 via-zinc-950 to-zinc-950 px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative mx-auto max-w-6xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-medium text-emerald-400 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Zero-Staff School • Automated Verification • 150+ Production Units</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-zinc-50 font-mono">
                The Self-Operating School for AI Engineers
              </h1>
              
              <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl font-sans">
                No video lectures. No teaching assistants. Ship real autonomous systems against automated test suites, an LLM rubric judge, and defend-your-work interviews.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/curriculum"
                  className="rounded-md border border-zinc-200 bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition-all hover:bg-zinc-200 active:scale-[0.98] font-mono inline-flex items-center gap-2"
                >
                  Explore Curriculum
                  <span className="text-zinc-500">&rarr;</span>
                </Link>
                
                <a
                  href="#how-it-works"
                  className="rounded-md border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800 font-mono"
                >
                  How Verification Works
                </a>
              </div>

              <div className="pt-2">
                <Link
                  href="/pricing"
                  className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  View Transparent Pricing & Rebates (Earn up to 30% back) &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80 max-w-lg text-xs font-mono text-zinc-400">
                <div>
                  <div className="text-zinc-100 font-semibold text-sm">700–950h</div>
                  <div>Rigorous total load</div>
                </div>
                <div>
                  <div className="text-zinc-100 font-semibold text-sm">13 Phases</div>
                  <div>Foundations to capstone</div>
                </div>
                <div>
                  <div className="text-zinc-100 font-semibold text-sm">4 Layers</div>
                  <div>Automated evaluation</div>
                </div>
              </div>
            </div>

            {/* Right: Live Sandbox Grading Terminal Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden font-mono text-xs">
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 text-zinc-400 text-[11px]">grading-engine // runner-v2</span>
                  </div>
                  <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                    VERIFIED PASS
                  </span>
                </div>

                {/* Terminal Body */}
                <div className="p-4 space-y-4 text-zinc-300">
                  <div className="text-zinc-500">
                    $ agy grade --unit 3.2.1 --submission ./claim_extractor.py
                  </div>

                  {/* Layer 1 */}
                  <div className="space-y-1.5 border-l-2 border-emerald-500/60 pl-3">
                    <div className="flex items-center justify-between text-zinc-200">
                      <span className="font-semibold text-emerald-400">[Layer 1] Deterministic Sandbox</span>
                      <span className="text-zinc-400 text-[11px]">0.42s</span>
                    </div>
                    <div className="text-zinc-400 space-y-0.5 text-[11px]">
                      <div>✓ test_pydantic_schema_validation PASSED</div>
                      <div>✓ test_edge_case_missing_fields PASSED</div>
                      <div>✓ test_ambiguous_policy_flags PASSED</div>
                      <div className="text-emerald-400 font-semibold">Checks: 12/12 passed (100%)</div>
                    </div>
                  </div>

                  {/* Layer 2 */}
                  <div className="space-y-1.5 border-l-2 border-emerald-500/60 pl-3">
                    <div className="flex items-center justify-between text-zinc-200">
                      <span className="font-semibold text-emerald-400">[Layer 2] LLM Rubric Judge</span>
                      <span className="text-zinc-400 text-[11px]">Tier: Frontier</span>
                    </div>
                    <div className="text-zinc-300 space-y-1 text-[11px] bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80">
                      <div className="text-zinc-400">
                        <span className="text-zinc-200 font-medium">Criterion:</span> Graceful schema failure under adversarial injection
                      </div>
                      <div className="text-zinc-300 italic text-[10px] text-zinc-400">
                        &quot;Extractor isolated policy limits correctly without hallucinations despite malformed claimant notes.&quot;
                      </div>
                      <div className="text-emerald-400 font-semibold text-[11px]">Verdict: PASS (Score: 1.0 / 1.0)</div>
                    </div>
                  </div>

                  {/* Layer 3 summary badge */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80">
                    <span>Layer 3 Interview: <span className="text-zinc-200">Defend Your Work unlocked</span></span>
                    <span className="text-emerald-400 font-mono">Ready &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Core Architectural Pillars */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Architectural Engine
            </span>
            <h2 className="text-3xl font-bold font-mono tracking-tight sm:text-4xl text-zinc-50">
              How Keel Trains Engineers Without TAs
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              We replaced human graders and vague lecture videos with an automated verification infrastructure and an end-to-end production thread.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="h-10 w-10 rounded-md border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
                01
              </div>
              <h3 className="text-lg font-bold font-mono text-zinc-100">
                Layered Verification Engine
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Four layers of progressive proof. Your code runs in isolated sandboxes against private test suites, undergoes LLM rubric judgment with cited evidence, passes interactive voice/text defense drills, and culminates in unscripted video walkthroughs.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400/90 space-y-1 border-t border-zinc-800">
                <div>• L1: Deterministic Pytest Sandboxes</div>
                <div>• L2: LLM Rubric Judge with Quoted Evidence</div>
                <div>• L3: Interactive Defense Drills</div>
                <div>• L4: Capstone System Walkthrough</div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="h-10 w-10 rounded-md border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
                02
              </div>
              <h3 className="text-lg font-bold font-mono text-zinc-100">
                The Meridian Production Thread
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Instead of disjointed toy exercises, you build one continuous, multi-agent insurance claims platform for <em>Meridian Mutual</em> across 12 technical phases. Every drill compounds into an enterprise system handling intake, grounding, routing, and audit trails.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400/90 space-y-1 border-t border-zinc-800">
                <div>• Single coherent production codebase</div>
                <div>• Multi-tool triage & cost routers</div>
                <div>• Adversarial security & tamper-evident logs</div>
                <div>• Fast, reproducible local Docker execution</div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 space-y-4 hover:border-zinc-700 transition-colors">
              <div className="h-10 w-10 rounded-md border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center font-mono font-bold text-emerald-400 text-sm">
                03
              </div>
              <h3 className="text-lg font-bold font-mono text-zinc-100">
                Earned Completion Rebates
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Skin in the game that pays you back. Pay transparent tuition upfront, and earn automatic cash refunds when you pass major integration milestones on schedule. We keep our incentives aligned with your graduation.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400/90 space-y-1 border-t border-zinc-800">
                <div>• 15% rebate at Phase 5 Agent Integration Gate</div>
                <div>• 15% rebate at Capstone System Graduation</div>
                <div>• Up to 30% ($600) cash returned automatically</div>
                <div>• Zero hidden subscription traps</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The "Why Zero-TA" Philosophy Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80 bg-zinc-900/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Honest Comparison
            </span>
            <h2 className="text-3xl font-bold font-mono tracking-tight sm:text-4xl text-zinc-50">
              Why Traditional AI Bootcamps Fail
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              Most bootcamps charge $15,000+ to have underpaid teaching assistants skim superficial Jupyter notebooks. We built a school around objective verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard Bootcamps / Video Courses */}
            <div className="rounded-lg border border-red-900/30 bg-red-950/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-mono font-bold text-sm">
                  ✕
                </span>
                <h3 className="text-lg font-bold font-mono text-zinc-100">
                  Standard Video Bootcamps
                </h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>Vanity completion metrics:</strong> Watching 40 hours of videos gives an illusion of mastery without production building competence.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>Subjective, delayed grading:</strong> Overwhelmed TAs skim code without running edge cases, giving passing marks to brittle prompt scripts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>Toy copy-paste demos:</strong> 10 disconnected 20-line scripts using wrapper frameworks that break the moment production traffic hits.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>$15,000–$25,000 bloated cost:</strong> You subsidize expensive mentor payrolls and sales teams rather than curriculum rigor.</span>
                </li>
              </ul>
            </div>

            {/* Keel Academy Model */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-sm">
                  ✓
                </span>
                <h3 className="text-lg font-bold font-mono text-zinc-100">
                  Keel Academy Platform
                </h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span><strong>Deterministic verification:</strong> Private golden sets and sandboxes execute your code immediately upon commit or submit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span><strong>Evidence-backed rubric judges:</strong> LLM judges evaluate architectural trade-offs, quoting exact lines from your submission.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span><strong>One deep enterprise codebase:</strong> 150+ incremental units forming an end-to-end multi-agent claims system you can defend in any interview.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span><strong>Transparent pricing & rebates:</strong> Fraction of legacy cost, with up to 30% returned to your card when you clear gates on schedule.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Curriculum Phase Overview & Quick Jump */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Full Roadmap
              </span>
              <h2 className="text-3xl font-bold font-mono tracking-tight sm:text-4xl text-zinc-50 mt-1">
                Curriculum Highlights
              </h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-xl">
                13 structured phases covering software engineering, model mechanics, agent loops, production observability, and client business acquisition.
              </p>
            </div>
            <Link
              href="/curriculum"
              className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              View Full 13-Phase Syllabus &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlightPhases.map((phase) => (
              <div
                key={phase.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-semibold">Phase {phase.phase}</span>
                    <span className="text-zinc-500">{phase.est_hours}h load</span>
                  </div>
                  <h3 className="text-base font-bold font-mono text-zinc-100">
                    {phase.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {phase.why}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">{phase.modules.length} Modules</span>
                  <Link
                    href={`/curriculum#phase-${phase.phase}`}
                    className="text-emerald-400 hover:underline"
                  >
                    View Units &rarr;
                  </Link>
                </div>
              </div>
            ))}

            {/* Extra Card: Live Units & Interactive Map */}
            <div className="rounded-lg border border-dashed border-emerald-500/40 bg-emerald-950/10 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">Active Pipeline</span>
                  <span className="text-emerald-400/80">Interactive</span>
                </div>
                <h3 className="text-base font-bold font-mono text-zinc-100">
                  Interactive Meridian Map
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Explore how every unit connects across the claims lifecycle. Track your prerequisites, gate locks, and submission verification status in real time.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">150+ Planned Units</span>
                <Link
                  href="/map"
                  className="rounded bg-emerald-500/20 px-2.5 py-1 text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-colors"
                >
                  Open Map &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
            No Fluff • No Video Lecturing
          </span>
          <h2 className="text-3xl font-bold font-mono tracking-tight sm:text-4xl text-zinc-50">
            Ready to Build Systems That Survive Production?
          </h2>
          <p className="text-base text-zinc-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Start Phase 0 in your local containerized environment today. Submit against automated test runners and build unshakeable competence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/sign-up"
              className="rounded-md border border-zinc-200 bg-zinc-100 px-8 py-3.5 text-sm font-semibold text-zinc-950 shadow-sm transition-all hover:bg-zinc-200 active:scale-[0.98] font-mono"
            >
              Get Started Now
            </Link>
            <Link
              href="/curriculum"
              className="rounded-md border border-zinc-800 bg-zinc-900 px-8 py-3.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800 font-mono"
            >
              Review Full Curriculum
            </Link>
          </div>

          <div className="pt-4 text-xs font-mono text-zinc-500">
            Self-paced • 365-day access window • Up to 30% earned rebates
          </div>
        </div>
      </section>
    </div>
  );
}
