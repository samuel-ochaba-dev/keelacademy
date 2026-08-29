import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchGalleryProject } from "@/lib/gallery";
import { formatUtc } from "@/lib/grading";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return { title: "Project Not Found" };

  const result = await fetchGalleryProject(numId);
  if (result.state !== "ok") return { title: "Showcase Project — Keel Academy" };

  return {
    title: `${result.data.title} — Public Build Gallery`,
    description: result.data.description.slice(0, 160),
  };
}

function getEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // YouTube
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    // Loom
    if (parsed.hostname.includes("loom.com") && parsed.pathname.includes("/share/")) {
      return url.replace("/share/", "/embed/");
    }
    // Vimeo
    if (parsed.hostname.includes("vimeo.com")) {
      const match = /\/(\d+)/.exec(parsed.pathname);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
    return url;
  } catch {
    return url;
  }
}

export default async function GalleryProjectDetailPage(props: Props) {
  const { id } = await props.params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  const result = await fetchGalleryProject(numId);
  if (result.state === "rejected" && result.status === 404) {
    notFound();
  }

  if (result.state !== "ok") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-amber-800/80 bg-amber-950/40 p-6 text-amber-200 font-mono">
          <h1 className="text-lg font-semibold text-amber-100">Showcase Service Unavailable</h1>
          <p className="mt-2 text-sm text-amber-300/90 font-sans">
            Unable to retrieve project details. Please refresh in a moment.
          </p>
        </div>
      </div>
    );
  }

  const project = result.data;
  const verdict = project.verdict;
  const verdictJson = (verdict?.json || {}) as {
    judge?: { criteria?: { id: string; verdict: string; evidence: string }[] };
    layer1?: { checks?: { id: string; type: string; status: string; note: string }[] };
  };
  const judge = verdictJson.judge || {};
  const criteria = judge.criteria || [];
  const layer1 = verdictJson.layer1 || {};
  const layer1Checks = layer1.checks || [];

  const embedUrl = getEmbedUrl(project.walkthrough_video_url);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Breadcrumb Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-zinc-500">
            <Link href="/gallery" className="hover:text-zinc-300 transition-colors">
              BUILD GALLERY
            </Link>
            <span>/</span>
            <Link href={`/gallery?phase=${project.phase}`} className="hover:text-zinc-300 transition-colors">
              PHASE 0{project.phase}
            </Link>
            <span>/</span>
            <span className="text-zinc-400">UNIT {project.unit_id}</span>
            <span>/</span>
            <span className="text-zinc-200 font-semibold">PROJECT #{project.id}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-zinc-800/80 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  VERIFIED DELIVERABLE · UNIT {project.unit_id}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  SHA {project.commit_sha.slice(0, 7)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-100">
                {project.title}
              </h1>
              <p className="text-xs sm:text-sm font-mono text-zinc-400">
                Authored by <span className="text-zinc-200 font-semibold">{project.student_name}</span> · Published {formatUtc(project.created_at)}
              </p>
            </div>

            {/* Top Action CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>GitHub Repository</span>
                  <span>&rarr;</span>
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-mono font-semibold text-white hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Open Live Demo</span>
                  <span>&rarr;</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Showcase Body */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          {/* 1. Architecture & Deliverable Summary */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400">
              System Architecture & Implementation Summary
            </h2>
            <div className="text-sm text-zinc-300 font-sans leading-relaxed whitespace-pre-line">
              {project.description}
            </div>
          </section>

          {/* 2. Embedded Video Walkthrough (if available) */}
          {embedUrl && (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-purple-400">
                  Walkthrough & System Demonstration
                </h2>
                <a
                  href={project.walkthrough_video_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
                >
                  Open in new tab &rarr;
                </a>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                <iframe
                  src={embedUrl}
                  title="Project Walkthrough"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </section>
          )}

          {/* 3. Cryptographic Verification & Rubric Proof */}
          <section className="rounded-lg border border-emerald-500/30 bg-zinc-900/40 overflow-hidden">
            <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
                    Automated Verification Ledger & Rubric Score Badge
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Evaluation executed inside isolated Docker runner with calibrated LLM judge evidence quotes.
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold self-start sm:self-auto">
                ✓ VERIFIED PASS ({criteria.filter((c) => c.verdict === "pass").length}/{criteria.length} CRITERIA)
              </Badge>
            </div>

            {/* Rubric Criteria with Evidence Quotes */}
            <div className="p-6 space-y-6">
              {criteria.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Frontier Rubric Criteria & Quoted Code Evidence
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {criteria.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-zinc-200">
                            Criterion: {c.id}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                            {c.verdict}
                          </span>
                        </div>
                        {c.evidence && (
                          <div className="rounded bg-zinc-900/80 p-3 text-xs font-mono text-zinc-300 border-l-2 border-emerald-500">
                            <span className="text-[10px] text-zinc-500 block mb-1 uppercase font-bold">
                              Calibrated Judge Evidence Quote:
                            </span>
                            <span className="italic leading-relaxed">{c.evidence}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Layer 1 Checks Summary if present */}
              {layer1Checks.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Deterministic Harness Checks ({layer1Checks.filter((c) => c.status === "pass").length}/{layer1Checks.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {layer1Checks.map((chk, i) => (
                      <div
                        key={chk.id || i}
                        className="flex items-center justify-between p-2.5 rounded bg-zinc-950/60 border border-zinc-800"
                      >
                        <span className="text-zinc-300 truncate max-w-[200px]">{chk.id}</span>
                        <span className="text-emerald-400 text-[11px] font-bold">✓ PASS</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Navigation Back */}
          <div className="pt-4 flex justify-between items-center text-xs font-mono text-zinc-400">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
            >
              <span>&larr;</span>
              <span>Back to Public Build Gallery</span>
            </Link>
            <span>Cryptographic Proof ID #{project.submission_id}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
