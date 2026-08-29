import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import { lookupSubmission, readerBaseUrl } from "@/lib/grading";
import { StatusBanner } from "@/components/submission/status-banner";
import { SubmissionFacts } from "@/components/submission/submission-facts";
import { CheckList } from "@/components/submission/check-list";
import { VerdictView } from "@/components/submission/verdict-view";
import { DefendSection } from "@/components/submission/defend-section";
import { VerdictFacts } from "@/components/submission/verdict-facts";
import { Timeline } from "@/components/submission/timeline";
import { Button } from "@/components/ui/button";
import { fetchSubmissionGalleryProject } from "@/lib/gallery";
import { GalleryShowcase } from "@/components/gallery/gallery-showcase";
import { fetchStudentDefenses } from "@/lib/simulation";


export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ submissionId: string }>;
};

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const { submissionId } = await props.params;
  const lookup = await lookupSubmission(submissionId);
  const title =
    lookup.state === "ok" ? `Submission #${lookup.view.submission.id} — Verification HUD` : "Submission Not Found";
  return { title, robots: { index: false } };
}

export default async function SubmissionPage(props: Props) {
  const { submissionId } = await props.params;

  const user = await getSessionUser();
  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/submissions/${submissionId}`)}`);
  }
  const bridged = await ensureStudent(user);
  const lookup = await lookupSubmission(submissionId);

  if (lookup.state === "not-found") notFound();

  if (lookup.state === "unreachable") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-amber-800/80 bg-amber-950/40 p-6 text-amber-200">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold">!</span>
            <h1 className="text-lg font-semibold tracking-tight text-amber-100">
              Grading service unreachable
            </h1>
          </div>
          <p className="mt-2 text-sm text-amber-300/90 leading-relaxed">
            The grading service reader endpoint is not responding right now. This is a temporary
            platform issue; your submission is preserved in the queue and will not be lost.
          </p>
          <div className="mt-4 rounded bg-zinc-950/80 p-3 font-mono text-xs text-zinc-400">
            Endpoint: {readerBaseUrl()} ({lookup.detail})
          </div>
        </div>
      </div>
    );
  }

  const { submission, verdict, events } = lookup.view;

  if (bridged.state !== "ok") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-300">
          <h1 className="text-lg font-semibold text-zinc-100">Verifying account ownership</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Grading audit records belong to the authenticated account that submitted the repository. Please
            refresh in a moment.
          </p>
        </div>
      </div>
    );
  }

  if (submission.student_id !== bridged.data) {
    notFound();
  }

  const isPassed = verdict?.overall === "pass";
  const galleryLookup = isPassed ? await fetchSubmissionGalleryProject(submission.id) : null;
  const initialGalleryProject = galleryLookup?.state === "ok" ? galleryLookup.data.project : null;

  const isCapstone = submission.unit_id === "12.1" || submission.unit_id.startsWith("12.");
  const defensesLookup = isCapstone ? await fetchStudentDefenses(submission.student_id) : null;
  const defenses = defensesLookup?.state === "ok" ? defensesLookup.data : null;


  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top HUD Header */}
      <header className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <Link href="/me" className="hover:text-zinc-300 transition-colors">
            COCKPIT
          </Link>
          <span>/</span>
          <Link href={`/units/${submission.unit_id}`} className="hover:text-zinc-300 transition-colors">
            UNIT-{submission.unit_id}
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-semibold">SUBMISSION-{submission.id}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded border border-emerald-800/60 bg-emerald-950/60 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                AUDIT RECORD #{submission.id}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                LOCKED TO {submission.commit_sha.slice(0, 7)}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Unit {submission.unit_id} Verification Command Center
            </h1>
            <p className="font-mono text-xs text-zinc-400">
              CRYPTOGRAPHIC VERDICT LEDGER · VISIBLE ONLY TO SUBMITTING ACCOUNT
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              href={`/units/${submission.unit_id}`}
              variant="outline"
              size="sm"
            >
              Workbench
            </Button>
            <Button
              href="/submit"
              variant="secondary"
              size="sm"
            >
              Submission Protocol
            </Button>
          </div>
        </div>

        {/* Real-time Status & Telemetry Strip */}
        <div className="space-y-4">
          <StatusBanner status={submission.status} verdict={verdict} />
          <SubmissionFacts view={lookup.view} studentEmail={user.email} />
        </div>
      </header>

      {/* Verification Matrix Sections */}
      <div className="space-y-8">
        {verdict ? (
          <>
            {/* Layer 1 Deterministic Matrix */}
            <CheckList layer1={verdict.json?.layer1} />

            {/* Layer 2 Rubric Matrix */}
            <VerdictView judge={verdict.json?.judge} />

            {/* Layer 3 Defend Matrix */}
            <DefendSection defend={verdict.json?.defend} />

            {/* Standing Skeptical Reviewer Defenses (Capstone Section 14) */}
            {isCapstone && defenses && (
              <section
                data-keel-section="capstone-skeptical-defenses"
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${defenses.defense_cleared ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
                      <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
                        Section 14 Capstone Defense Clearance
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">
                      Final capstone credentialing requires passing defense simulations with both Marcus Vance and Elena Rostova.
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold border self-start sm:self-auto ${
                      defenses.defense_cleared
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {defenses.defense_cleared ? "DEFENSES CLEARED" : "DEFENSES PENDING"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        Technical Defense (Marcus Vance)
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${defenses.technical_stakeholder.passed ? "text-emerald-400" : "text-zinc-500"}`}>
                        {defenses.technical_stakeholder.passed ? "PASSED" : "NOT CLEARED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Demands evaluation metrics, token economics, cascading routers, and prompt injection defense.
                    </p>
                    <Link
                      href="/simulations/technical-stakeholder"
                      className="text-xs font-mono text-emerald-400 hover:underline inline-block pt-1"
                    >
                      Open Defense Workbench &rarr;
                    </Link>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        Business Defense (Elena Rostova)
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${defenses.business_owner.passed ? "text-emerald-400" : "text-zinc-500"}`}>
                        {defenses.business_owner.passed ? "PASSED" : "NOT CLEARED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Demands plain-language dollar ROI, adjuster hours saved, and human-in-the-loop fallback for $50k claims.
                    </p>
                    <Link
                      href="/simulations/business-owner"
                      className="text-xs font-mono text-emerald-400 hover:underline inline-block pt-1"
                    >
                      Open Defense Workbench &rarr;
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Telemetry & Ledger Details */}
            <VerdictFacts view={lookup.view} />

            {/* Public Build Gallery Showcase (Opt-In) */}
            <GalleryShowcase
              submissionId={submission.id}
              unitId={submission.unit_id}
              isPassed={isPassed}
              defaultRepoUrl={submission.repo_url}
              initialProject={initialGalleryProject}
            />
          </>

        ) : submission.status === "error" ? (
          <div className="rounded-lg border border-rose-800/80 bg-rose-950/30 p-6 space-y-3">
            <h2 className="text-base font-semibold text-rose-300 font-mono">
              RUNNER EXECUTION FAILURE DETAILS
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              No verdict could be generated due to a runner execution error or token budget exhaustion. Review the execution event log below or verify your repository setup before submitting again.
            </p>
            <div className="pt-2">
              <Button href="/submit" variant="danger" size="sm">
                View Submission Guide & Troubleshooting
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-sky-800/80 bg-sky-950/30 p-8 text-center space-y-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-900/60 text-sky-400 font-mono text-sm animate-spin">
              ◌
            </div>
            <h2 className="text-base font-semibold text-sky-200">
              EVALUATION IN PROGRESS
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl mx-auto leading-relaxed">
              Your test suites and rubric criteria are currently executing inside an isolated sandboxed Docker runner. When completed, this command center populates with line-by-line evidence quotes and author defense questions.
            </p>
          </div>
        )}

        {/* Execution Event Stream */}
        <Timeline events={events} />
      </div>
    </article>
  );
}
