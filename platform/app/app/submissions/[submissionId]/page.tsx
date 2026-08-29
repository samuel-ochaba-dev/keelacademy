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
    lookup.state === "ok" ? `Submission #${lookup.view.submission.id}` : "Submission Not Found";
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
      <div>
        
        <h1>
          Grading service unreachable
        </h1>
        <p>
          The grading service reader endpoint is not responding right now. This is a temporary
          platform issue; your submission is preserved in the queue.
        </p>
        <p>
          {readerBaseUrl()} ({lookup.detail})
        </p>
      </div>
    );
  }

  const { submission, verdict, events } = lookup.view;

  if (bridged.state !== "ok") {
    return (
      <div>
        <h1>Verifying account ownership</h1>
        <p>
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
      <header>
        <div>
          <nav aria-label="Breadcrumb">
            <Link href="/me">COCKPIT</Link>
            <Link href={`/units/${submission.unit_id}`}>UNIT-{submission.unit_id}</Link>
            <span>SUBMISSION-{submission.id}</span>
          </nav>

          <div>
            <div>
              <div>
                <span>
                  AUDIT RECORD #{submission.id}
                </span>
              </div>
              <h1>
                Unit {submission.unit_id} Grading Verdict
              </h1>
              <p>
                
                <span>CRYPTOGRAPHIC VERDICT LEDGER · VISIBLE ONLY TO SUBMITTING ACCOUNT</span>
              </p>
            </div>

            <Link href={`/units/${submission.unit_id}`}>
              <span>BACK TO WORKBENCH</span>
            </Link>
          </div>

          <div>
            <StatusBanner status={submission.status} verdict={verdict} />
            <SubmissionFacts view={lookup.view} studentEmail={user.email} />
          </div>
        </div>
      </header>

      {/* Results */}
      <div>
        {verdict ? (
          <>
            <Layer1Section layer1={verdict.json?.layer1} />
            <JudgeSection judge={verdict.json?.judge} />
            <VerdictFacts view={lookup.view} />
          </>
        ) : submission.status === "error" ? (
          <div>
            <h2>RUNNER EXECUTION FAILURE DETAILS</h2>
            <p>
              No verdict could be generated due to a runner execution error or token budget exhaustion. Review the timeline below or retry your git push.
            </p>
          </div>
        ) : (
          <div>
            <h2>EVALUATION IN PROGRESS</h2>
            <p>
              Your tests and rubric criteria are executing in a sandboxed Docker runner. When complete, this page updates with exact line-by-line evidence quotes.
            </p>
          </div>
        )}

        <Timeline events={events} />
      </div>
    </article>
  );
}
