import type { SubmissionStatus, Verdict } from "@/lib/grading";

function banner(
  status: SubmissionStatus,
  verdict: Verdict | null,
): { word: string; body: string } {
  if (status === "queued") {
    return {
      word: "Queued for grading",
      body: "Your repository push has been received and is waiting for an available sandbox runner.",
    };
  }
  if (status === "grading") {
    return {
      word: "Grading in progress",
      body: "The automated sandbox checks and rubric judge are running right now. This usually finishes in under 30 seconds.",
    };
  }
  if (status === "error") {
    return {
      word: "Grading stopped",
      body: "The run stopped due to an infrastructure error instead of writing a verdict. The timeline below shows the recorded events.",
    };
  }
  if (verdict?.overall === "pass") {
    return {
      word: "Verdict: Passed",
      body: "All automated sandbox checks and rubric evaluation criteria passed. Your progress has been updated in the ledger.",
    };
  }
  if (verdict?.overall === "fail") {
    return {
      word: "Verdict: Not passed",
      body: "One or more checks or rubric criteria did not clear the required bar. See the breakdown below with quoted evidence from your code.",
    };
  }
  return {
    word: "Graded",
    body: "Grading completed. See the details below.",
  };
}

export function StatusBanner({ status, verdict }: { status: SubmissionStatus; verdict: Verdict | null }) {
  const { word, body } = banner(status, verdict);
  return (
    <div data-keel-status={status}>
      <h2>{word}</h2>
      <p>{body}</p>
    </div>
  );
}
