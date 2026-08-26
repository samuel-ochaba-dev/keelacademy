import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import { lookupSubmission, readerBaseUrl } from "@/lib/grading";
import { StatusBanner } from "@/components/submission/status-banner";
import { SubmissionFacts } from "@/components/submission/submission-facts";
import { Layer1Section } from "@/components/submission/layer1-section";
import { JudgeSection } from "@/components/submission/judge-section";
import { VerdictFacts } from "@/components/submission/verdict-facts";
import { Timeline } from "@/components/submission/timeline";
import { IconChevronRight, IconArrowRight, IconAlertTriangle } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/submissions/[submissionId]">,
): Promise<Metadata> {
  const { submissionId } = await props.params;
  const lookup = await lookupSubmission(submissionId);
  const title =
    lookup.state === "ok" ? `Submission #${lookup.view.submission.id}` : "Submission Not Found";
  return { title, robots: { index: false } };
}

export default async function SubmissionPage(props: PageProps<"/submissions/[submissionId]">) {
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
      <div className="shell flex max-w-xl flex-col items-start py-24">
        <span className="grid size-12 place-items-center rounded-xl border border-warn/40 bg-warn/10 text-warn">
          <IconAlertTriangle size={24} />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
          Grading service unreachable
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          The grading service reader endpoint is not responding right now. This is a temporary
          platform issue; your submission is preserved in the queue.
        </p>
        <p className="mt-4 rounded-lg border border-line bg-inset px-4 py-3 font-mono text-xs text-ink-3">
          {readerBaseUrl()} ({lookup.detail})
        </p>
      </div>
    );
  }

  const { submission, verdict, events } = lookup.view;

  if (bridged.state !== "ok") {
    return (
      <div className="shell max-w-xl py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Verifying account ownership</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Grading pages belong to the authenticated account that submitted the repository. Please
          refresh in a moment.
        </p>
      </div>
    );
  }

  if (submission.student_id !== bridged.data) {
    notFound();
  }

  return (
    <article className="space-y-0">
      <header className="border-b border-line bg-canvas pt-8 pb-8">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/me">COCKPIT</Link>
            <IconChevronRight size={10} />
            <Link href={`/units/${submission.unit_id}`}>UNIT-{submission.unit_id}</Link>
            <IconChevronRight size={10} />
            <span className="text-ink font-semibold">SUBMISSION-{submission.id}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-accent/40 bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent font-semibold">
                  AUDIT RECORD #{submission.id}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Unit {submission.unit_id} Grading Verdict
              </h1>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-ink-3">
                <span className="size-1.5 rounded-full bg-pass" />
                <span>CRYPTOGRAPHIC VERDICT LEDGER · VISIBLE ONLY TO SUBMITTING ACCOUNT</span>
              </p>
            </div>

            <Link href={`/units/${submission.unit_id}`} className="btn-ghost shrink-0 font-mono text-xs">
              <span>BACK TO WORKBENCH</span>
              <IconArrowRight size={11} />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <StatusBanner status={submission.status} verdict={verdict} />
            <SubmissionFacts view={lookup.view} />
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="shell space-y-6 py-8">
        {verdict ? (
          <>
            <Layer1Section layer1={verdict.json?.layer1} />
            <JudgeSection judge={verdict.json?.judge} />
            <VerdictFacts view={lookup.view} />
          </>
        ) : submission.status === "error" ? (
          <div className="rounded border border-fail/40 bg-fail-soft p-5 space-y-2">
            <h2 className="font-mono text-xs font-semibold text-fail uppercase tracking-wider">RUNNER EXECUTION FAILURE DETAILS</h2>
            <p className="text-xs leading-relaxed text-ink-2">
              No verdict could be generated due to a runner execution error or token budget exhaustion. Review the timeline below or retry your git push.
            </p>
          </div>
        ) : (
          <div className="rounded border border-line bg-raised p-5 space-y-2">
            <h2 className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">EVALUATION IN PROGRESS</h2>
            <p className="text-xs leading-relaxed text-ink-2">
              Your tests and rubric criteria are executing in a sandboxed Docker runner. When complete, this page updates with exact line-by-line evidence quotes.
            </p>
          </div>
        )}

        <Timeline events={events} />
      </div>
    </article>
  );
}
