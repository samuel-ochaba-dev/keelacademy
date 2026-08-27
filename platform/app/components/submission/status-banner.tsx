import type { SubmissionStatus, Verdict } from "@/lib/grading";

function bannerConfig(
  status: SubmissionStatus,
  verdict: Verdict | null,
): {
  title: string;
  body: string;
  badge: string;
} {
  if (status === "queued") {
    return {
      title: "Queued for a sandbox container",
      body: "Your repository push was received and is waiting for an available isolated runner.",
      badge: "QUEUED",
    };
  }
  if (status === "grading") {
    return {
      title: "Automated grading in progress",
      body: "Layer 1 sandbox checks and the Layer 2 rubric judge are executing in Docker. Results appear within seconds.",
      badge: "GRADING",
    };
  }
  if (status === "error") {
    return {
      title: "Grading interrupted",
      body: "The test runner hit an environment or timeout failure before writing a verdict. Review the timeline below.",
      badge: "ERROR",
    };
  }
  if (verdict?.overall === "pass") {
    return {
      title: "Verdict: passed",
      body: "All automated sandbox checks and rubric criteria passed. Your progress is recorded in the immutable ledger.",
      badge: "PASS",
    };
  }
  if (verdict?.overall === "fail") {
    return {
      title: "Verdict: not passed",
      body: "One or more checks or rubric criteria did not meet the required bar. Inspect the failure breakdown and quoted evidence below.",
      badge: "FAIL",
    };
  }
  return {
    title: "Graded",
    body: "Evaluation completed. Inspect the verdict details below.",
    badge: "GRADED",
  };
}

export function StatusBanner({
  status,
  verdict,
}: {
  status: SubmissionStatus;
  verdict: Verdict | null;
}) {
  const config = bannerConfig(status, verdict);

  return (
    <div>
      <div>
        <div>
          <h2>{config.title}</h2>
          <p>{config.body}</p>
        </div>
      </div>
      <span>{config.badge}</span>
    </div>
  );
}
