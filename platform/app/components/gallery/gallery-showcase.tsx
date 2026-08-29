"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentGalleryProject } from "@/lib/gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GalleryShowcaseProps = {
  submissionId: number;
  unitId: string;
  isPassed: boolean;
  defaultRepoUrl?: string | null;
  initialProject: StudentGalleryProject | null;
};

export function GalleryShowcase({
  submissionId,
  unitId,
  isPassed,
  defaultRepoUrl,
  initialProject,
}: GalleryShowcaseProps) {
  const [project, setProject] = useState<StudentGalleryProject | null>(initialProject);
  const [isEditing, setIsEditing] = useState(!initialProject || !initialProject.published);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState(
    initialProject?.title || `Unit ${unitId} Implementation Deliverable`,
  );
  const [description, setDescription] = useState(
    initialProject?.description ||
      `Production-grade implementation of Unit ${unitId} with full test coverage and automated rubric verification.`,
  );
  const [repoUrl, setRepoUrl] = useState(initialProject?.repo_url || defaultRepoUrl || "");
  const [demoUrl, setDemoUrl] = useState(initialProject?.demo_url || "");
  const [walkthroughVideoUrl, setWalkthroughVideoUrl] = useState(
    initialProject?.walkthrough_video_url || "",
  );

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/gallery/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          title,
          description,
          repo_url: repoUrl || undefined,
          demo_url: demoUrl || undefined,
          walkthrough_video_url: walkthroughVideoUrl || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProject(data);
        setIsEditing(false);
        setSuccessMsg("Deliverable successfully published to the Public Build Gallery!");
      } else {
        setErrorMsg(data.message || data.error || "Failed to publish to gallery.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    if (!project) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/gallery/unpublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          unit_id: unitId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProject((prev) => (prev ? { ...prev, published: false } : null));
        setSuccessMsg("Project unpublished from public view.");
      } else {
        setErrorMsg(data.message || data.error || "Failed to unpublish project.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isPassed) {
    return (
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-sm">🔒</span>
            <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Public Build Gallery Showcase
            </h2>
          </div>
          <Badge variant="outline" className="text-zinc-500 border-zinc-700">
            VERIFICATION REQUIRED
          </Badge>
        </div>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Public showcase publication is locked. Only submissions with a verified PASS verdict from the automated verification engine are eligible for the public gallery.
        </p>
      </section>
    );
  }

  const isPublished = project && project.published;

  return (
    <section className="rounded-lg border border-emerald-500/30 bg-zinc-900/50 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400">
              Public Build Gallery Showcase (Opt-In)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Verified passing deliverable for Unit {unitId}. Showcase your architecture and code across cohorts.
          </p>
        </div>
        <div>
          {isPublished ? (
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono">
              PUBLISHED LIVE
            </Badge>
          ) : (
            <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-400 font-mono">
              DRAFT / UNPUBLISHED
            </Badge>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-red-500/30 bg-red-950/30 px-4 py-2.5 text-xs font-mono text-red-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-950/30 px-4 py-2.5 text-xs font-mono text-emerald-200">
          {successMsg}
        </div>
      )}

      {isPublished && !isEditing ? (
        <div className="space-y-4">
          <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-mono text-zinc-100">{project.title}</h3>
                <p className="mt-1 text-xs text-zinc-300 font-sans leading-relaxed">{project.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono">
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Repository</span> &rarr;
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Live Demo</span> &rarr;
                </a>
              )}
              {project.walkthrough_video_url && (
                <a
                  href={project.walkthrough_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Video Walkthrough</span> &rarr;
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={`/gallery/${project.id}`}
              className="rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-mono font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors inline-flex items-center gap-1.5"
            >
              <span>View Public Showcase Page</span>
              <span>&rarr;</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs font-mono"
            >
              Edit Details
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleUnpublish}
              disabled={isSubmitting}
              className="text-xs font-mono"
            >
              {isSubmitting ? "Unpublishing..." : "Unpublish Project"}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-zinc-300 font-semibold">
              Project Showcase Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. High-Throughput Insurance Claims Extraction Engine"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-zinc-300 font-semibold">
              Architecture & System Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your design decisions, extraction pipeline architecture, and how edge-case fallbacks were handled."
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-sans text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-400">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/project"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-400">
                Live Demo URL (Optional)
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://my-demo.dev"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-zinc-400">
                Video Walkthrough URL (Loom / YouTube)
              </label>
              <input
                type="url"
                value={walkthroughVideoUrl}
                onChange={(e) => setWalkthroughVideoUrl(e.target.value)}
                placeholder="https://loom.com/share/..."
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-emerald-600 px-4 py-2 text-xs font-mono font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isSubmitting ? "Publishing..." : isPublished ? "Update Showcase" : "Publish to Public Gallery"}
            </button>
            {isPublished && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                type="button"
                className="text-xs font-mono"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
