import type { Metadata } from "next";
import Link from "next/link";
import { loadCurriculumMap, listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Curriculum Syllabus & Phase Directory — Keel Academy",
  description:
    "Explore all 13 phases and 150+ units of the Meridian Mutual claims engineering curriculum.",
};

export default function CurriculumPage() {
  const curriculumMap = loadCurriculumMap();
  const authoredUnits = listUnits();
  const authoredSet = new Set(authoredUnits.map((u) => u.id));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <section className="border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950 px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-medium text-emerald-400">
            <span>700–950 Hours • 13 Phases • 150+ Verification Checkpoints</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl font-mono text-zinc-50">
            Curriculum Syllabus & Phase Directory
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-sans leading-relaxed">
            The complete 13-phase roadmap for building the Meridian Mutual autonomous claims triage platform.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/map"
              className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-mono font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Interactive Meridian Map</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-mono font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Pricing & Rebates
            </Link>
          </div>
        </div>
      </section>

      {/* Main Directory */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {curriculumMap.phases.map((phase) => (
          <section
            key={phase.id}
            id={`phase-${phase.phase}`}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-6 scroll-mt-20"
          >
            {/* Phase Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400">
                    PHASE 0{phase.phase}
                  </span>
                  <h2 className="text-xl font-bold font-mono text-zinc-100">
                    {phase.title}
                  </h2>
                  <span className="text-xs font-mono text-zinc-500">
                    ~{phase.est_hours} Hours
                  </span>
                  {phase.badge ? (
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                      {phase.badge}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs font-mono text-zinc-400">
                  <span className="text-zinc-500">Meridian Role:</span> {phase.meridian_role}
                </p>
              </div>

              {phase.gate_id ? (
                <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400 self-start sm:self-auto">
                  $300 REBATE GATE
                </span>
              ) : null}
            </div>

            {/* Why & Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3.5 space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase text-zinc-500 block">
                  Why It Exists
                </span>
                <p className="text-zinc-300 leading-relaxed">{phase.why}</p>
              </div>
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3.5 space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase text-zinc-500 block">
                  Concrete Outcome
                </span>
                <p className="text-zinc-300 leading-relaxed">{phase.outcome}</p>
              </div>
            </div>

            {/* Units & Modules Grid */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Phase Modules & Units ({phase.modules.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {phase.modules.map((mod) => {
                  const isAuthored = authoredSet.has(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-2 flex flex-col justify-between hover:border-zinc-700 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-emerald-400">UNIT {mod.id}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isAuthored
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                            }`}
                          >
                            {isAuthored ? "BENCH ACTIVE" : "SPEC READY"}
                          </span>
                        </div>

                        <h4 className="text-sm font-mono font-bold text-zinc-200 line-clamp-1">
                          {mod.title}
                        </h4>

                        <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                        {isAuthored ? (
                          <Link
                            href={`/units/${mod.id}`}
                            className="text-emerald-400 hover:underline font-semibold"
                          >
                            Open Lesson & Workbench &rarr;
                          </Link>
                        ) : (
                          <span className="text-zinc-500">Planned in sequence</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

