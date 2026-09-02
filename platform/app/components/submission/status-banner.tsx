import type { SubmissionStatus, Verdict } from "@/lib/grading";

function bannerConfig(
  status: SubmissionStatus,
  verdict: Verdict | null,
): {
  title: string;
  body: string;
  badge: string;
  tone: "outline" | "live" | "alert";
} {
  if (status === "queued") {
    return {
      title: "Queued",
      body: "Your push arrived. It is waiting for a free machine to run on.",
      badge: "QUEUED",
      tone: "outline",
    };
  }
  if (status === "grading") {
    return {
      title: "Grading now",
      body: "The automated checks are running against your commit, and rubric review follows them.",
      badge: "GRADING",
      tone: "outline",
    };
  }
  if (status === "error") {
    return {
      title: "Grading stopped early",
      body: "Something went wrong before a verdict was written. Nothing about your work is lost.",
      badge: "ERROR",
      tone: "alert",
    };
  }
  if (verdict?.overall === "pass") {
    return {
      title: "Passed",
      body: "Every automated check and every rubric criterion came back passing.",
      badge: "PASSED",
      tone: "live",
    };
  }
  if (verdict?.overall === "fail") {
    return {
      title: "Not yet",
      body: "At least one check or criterion did not clear the bar. The details below say which.",
      badge: "NOT YET",
      tone: "alert",
    };
  }
  return {
    title: "Graded",
    body: "Grading finished. The details are below.",
    badge: "GRADED",
    tone: "outline",
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
    <div
      data-keel-status={status}
      className="rounded-lg border border-circuit-border bg-carbon-veil p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[62ch]">
          <h2 className="heading-md">{config.title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            {config.body}
          </p>
        </div>
        <span className={`chip chip-${config.tone}`}>{config.badge}</span>
      </div>
    </div>
  );
}
