import type { SubmissionStatus, Verdict } from "@/lib/grading";
import { Badge } from "@/components/ui/badge";

function bannerConfig(
  status: SubmissionStatus,
  verdict: Verdict | null,
): {
  title: string;
  body: string;
  badge: string;
  variant: "default" | "success" | "warning" | "danger" | "info";
} {
  if (status === "queued") {
    return {
      title: "Queued for Sandbox Container",
      body: "Your repository push was received. An isolated Docker runner environment is spinning up.",
      badge: "QUEUED",
      variant: "warning",
    };
  }
  if (status === "grading") {
    return {
      title: "Automated Grading in Progress",
      body: "Layer 1 sandbox checks and Layer 2 rubric judge are executing in Docker. Live telemetry recorded below.",
      badge: "GRADING",
      variant: "info",
    };
  }
  if (status === "error") {
    return {
      title: "Grading Pipeline Interrupted",
      body: "The test runner encountered an environment or timeout failure before writing a verdict. Review timeline diagnostics.",
      badge: "ERROR",
      variant: "danger",
    };
  }
  if (verdict?.overall === "pass") {
    return {
      title: "Verdict: Full Verification Passed",
      body: "All deterministic sandbox checks and LLM-as-judge rubric criteria met the required bar.",
      badge: "PASS",
      variant: "success",
    };
  }
  if (verdict?.overall === "fail") {
    return {
      title: "Verdict: Requirements Not Met",
      body: "One or more test checks or rubric criteria failed. Inspect the cited evidence and container output below.",
      badge: "FAIL",
      variant: "danger",
    };
  }
  return {
    title: "Evaluation Graded",
    body: "Automated evaluation completed. Inspect the verdict details and execution ledger below.",
    badge: "GRADED",
    variant: "default",
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
      className={`rounded-lg border p-5 transition-all ${
        config.variant === "success"
          ? "border-emerald-800/80 bg-emerald-950/40 text-emerald-100"
          : config.variant === "danger"
          ? "border-rose-800/80 bg-rose-950/40 text-rose-100"
          : config.variant === "warning"
          ? "border-amber-800/80 bg-amber-950/40 text-amber-100"
          : config.variant === "info"
          ? "border-sky-800/80 bg-sky-950/40 text-sky-100"
          : "border-zinc-800 bg-zinc-900/60 text-zinc-100"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                config.variant === "success"
                  ? "bg-emerald-400"
                  : config.variant === "danger"
                  ? "bg-rose-400"
                  : config.variant === "warning"
                  ? "bg-amber-400 animate-pulse"
                  : config.variant === "info"
                  ? "bg-sky-400 animate-pulse"
                  : "bg-zinc-400"
              }`}
            />
            <h2 className="text-base font-semibold tracking-tight">{config.title}</h2>
          </div>
          <p className="text-xs text-zinc-300/90 leading-relaxed max-w-3xl">
            {config.body}
          </p>
        </div>

        <Badge
          variant={
            config.variant === "success"
              ? "success"
              : config.variant === "danger"
              ? "danger"
              : config.variant === "warning"
              ? "warning"
              : config.variant === "info"
              ? "info"
              : "default"
          }
          className="text-xs px-3 py-1 font-mono uppercase tracking-widest font-bold shadow-sm"
        >
          {config.badge}
        </Badge>
      </div>
    </div>
  );
}
