import type { Metadata } from "next";
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
      <div>
        <h1>Grading service unreachable</h1>
        <p>
          The grading service reader endpoint is currently not responding. This is a platform issue;
          your submission is preserved. Refresh in a moment.
        </p>
        <p>
          <code>{readerBaseUrl()} ({lookup.detail})</code>
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
          Grading pages belong to the authenticated account that submitted the repository.
          The account verification service did not answer. Refresh in a moment.
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
        <p>
          <small>Submission #{submission.id}</small>
        </p>
        <h1>
          Unit {submission.unit_id} Grading Verdict
        </h1>
        <p>
          Pushed by {user.email}
        </p>

        <div>
          <StatusBanner status={submission.status} verdict={verdict} />
        </div>

        <div>
          <SubmissionFacts view={lookup.view} />
        </div>
      </header>

      {verdict ? (
        <>
          <Layer1Section layer1={verdict.json?.layer1} />
          <JudgeSection judge={verdict.json?.judge} />
          <VerdictFacts view={lookup.view} />
        </>
      ) : submission.status === "error" ? (
        <section>
          <div>
            <hr />
            <h2>Grading Error Details</h2>
            <p>
              No verdict could be recorded. If your token budget was exceeded, top up your tokens on your
              dashboard to trigger an automated regrade.
            </p>
          </div>
        </section>
      ) : (
        <section>
          <div>
            <hr />
            <h2>Evaluating Submission</h2>
            <p>
              Your tests are executing in a sandboxed runner. When completed, this page will update with
              the Layer 1 check results and Layer 2 judge evaluation.
            </p>
          </div>
        </section>
      )}

      <Timeline events={events} />
    </article>
  );
}
