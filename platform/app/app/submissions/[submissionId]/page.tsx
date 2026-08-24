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
    <article>
      <header className="border-b border-line bg-raised/30">
        <div className="shell pt-8 pb-8">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/me">dashboard</Link>
            <IconChevronRight size={11} />
            <Link href={`/units/${submission.unit_id}`}>unit-{submission.unit_id}</Link>
            <IconChevronRight size={11} />
            <span className="text-ink-2">submission-{submission.id}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Unit {submission.unit_id} grading verdict
              </h1>
              <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-ink-3">
                <span className="size-1 rounded-full bg-accent" aria-hidden />
                PRIVATE LINK / VISIBLE ONLY TO THE SUBMITTING ACCOUNT
              </p>
            </div>

            <Link href={`/units/${submission.unit_id}`} className="btn-ghost shrink-0">
              Back to unit specs
              <IconArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <StatusBanner status={submission.status} verdict={verdict} />
            <SubmissionFacts view={lookup.view} />
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="shell space-y-6 py-10">
        {verdict ? (
          <>
            <Layer1Section layer1={verdict.json?.layer1} />
            <JudgeSection judge={verdict.json?.judge} />
            <VerdictFacts view={lookup.view} />
          </>
        ) : submission.status === "error" ? (
          <div className="panel p-6">
            <h2 className="text-base font-semibold text-ink">Execution failure details</h2>
            <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-2">
              No verdict could be generated due to a runner execution error or token budget
              exhaustion. Review the timeline below or retry your push.
            </p>
          </div>
        ) : (
          <div className="scanline panel p-6">
            <h2 className="text-base font-semibold text-ink">Evaluating submission</h2>
            <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-2">
              Your tests and rubric criteria are executing in a sandboxed Docker runner. When
              complete, this page displays your Layer 1 and Layer 2 results.
            </p>
          </div>
        )}

        <Timeline events={events} />
      </div>
    </article>
  );
}
