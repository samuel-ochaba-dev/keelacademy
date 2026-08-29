import type { Metadata } from "next";
import Link from "next/link";
import { fetchGalleryProjects } from "@/lib/gallery";
import { formatUtc } from "@/lib/grading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Build Gallery — Keel Academy",
  description:
    "Opt-in showcase of verified Meridian-style systems and production portfolio deliverables shipped by students across cohorts.",
};

type Props = {
  searchParams: Promise<{
    phase?: string;
    unit_id?: string;
    search?: string;
  }>;
};

const PHASE_FILTERS = [
  { label: "All Phases", value: undefined },
  { label: "Phase 0: Setup", value: "0" },
  { label: "Phase 1: Foundations", value: "1" },
  { label: "Phase 2: LLM Physics", value: "2" },
  { label: "Phase 3: Prompts & Schemas", value: "3" },
  { label: "Phase 5: Agents & Triage", value: "5" },
  { label: "Phase 12: Capstone", value: "12" },
];

export default async function GalleryPage({ searchParams }: Props) {
  const { phase, unit_id, search } = await searchParams;
  const phaseNum = phase !== undefined && phase !== "" ? parseInt(phase, 10) : undefined;

  const result = await fetchGalleryProjects({
    phase: isNaN(phaseNum as number) ? undefined : phaseNum,
    unitId: unit_id || undefined,
    search: search || undefined,
    limit: 50,
  });

  const projects = result.state === "ok" ? result.data.projects : [];
  const total = result.state === "ok" ? result.data.total : 0;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Gallery Showcase Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              OPT-IN PUBLIC PORTFOLIO SHOWCASE
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-zinc-100">
              Public Build Gallery
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-3xl font-sans leading-relaxed">
              Real Meridian-style insurance extraction pipelines, multi-agent triage architectures, and
              production capstones shipped by Keel Academy learners. Every project in this showcase holds a
              cryptographically verified PASS verdict from the automated grading engine.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Phase Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {PHASE_FILTERS.map((f) => {
                const isActive = (phase === undefined && f.value === undefined) || phase === f.value;
                const href = f.value !== undefined ? `/gallery?phase=${f.value}` : "/gallery";
                return (
                  <Link
                    key={f.label}
                    href={href}
                    className={`rounded-full px-3 py-1 text-xs font-mono transition-colors ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-semibold"
                        : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>

            {/* Total verified badge */}
            <div className="text-xs font-mono text-zinc-400 self-start md:self-auto">
              <span className="text-emerald-400 font-bold">{total}</span> VERIFIED SHOWCASES
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Section */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {result.state !== "ok" ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-8 text-center space-y-3 font-mono">
              <h2 className="text-base font-bold text-amber-300">Showcase Service Temporarily Offline</h2>
              <p className="text-xs text-zinc-400">
                The public gallery discovery service is currently restarting. Refresh in a moment.
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4 font-mono">
              <div className="text-3xl">🏛️</div>
              <h2 className="text-base font-bold text-zinc-200">No Showcase Projects Found</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-sans">
                {phase !== undefined
                  ? `No verified projects have been opted into the public gallery for Phase ${phase} yet.`
                  : "No student deliverables have been published to the gallery yet."}
              </p>
              <div className="pt-2">
                <Link
                  href="/gallery"
                  className="rounded border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs font-mono text-zinc-200 hover:bg-zinc-700"
                >
                  Clear Phase Filter
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <article
                  key={proj.id}
                  className="group relative flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div className="space-y-3">
                    {/* Card Top Pill Strip */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 uppercase">
                          PHASE 0{proj.phase} · UNIT {proj.unit_id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {formatUtc(proj.created_at)}
                      </span>
                    </div>

                    {/* Title & Author */}
                    <div>
                      <h2 className="text-base font-bold font-mono text-zinc-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
                        <Link href={`/gallery/${proj.id}`}>
                          <span className="absolute inset-0" aria-hidden="true" />
                          {proj.title}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs font-mono text-zinc-400">
                        By <span className="text-zinc-200">{proj.student_name}</span>
                      </p>
                    </div>

                    {/* Description Snippet */}
                    <p className="text-xs text-zinc-400 font-sans line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Card Bottom: Verification Proof Badge & Links */}
                  <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-3">
                    {/* Rubric Verification Badge */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <span>✓</span>
                        <span>VERIFIED PASS</span>
                      </span>
                      <span className="text-zinc-500 text-[10px]">
                        {proj.verdict.criteria_passed > 0
                          ? `${proj.verdict.criteria_passed}/${proj.verdict.total_criteria} CRITERIA`
                          : "RUBRIC PROOF"}
                      </span>
                    </div>

                    {/* Links Row */}
                    <div className="flex items-center justify-between text-xs font-mono pt-1 text-zinc-400">
                      <span className="text-emerald-400 group-hover:underline inline-flex items-center gap-1">
                        View showcase &rarr;
                      </span>
                      <div className="flex items-center gap-2 relative z-10">
                        {proj.repo_url && (
                          <a
                            href={proj.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-zinc-100 p-1"
                            title="GitHub Repository"
                          >
                            Repo
                          </a>
                        )}
                        {proj.walkthrough_video_url && (
                          <a
                            href={proj.walkthrough_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 p-1"
                            title="Video Walkthrough"
                          >
                            Video
                          </a>
                        )}
                        {proj.demo_url && (
                          <a
                            href={proj.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 p-1"
                            title="Live Demo"
                          >
                            Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
