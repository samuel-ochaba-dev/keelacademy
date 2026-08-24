import type { SubmissionStatus, Verdict } from "@/lib/grading";
import {
  IconCheckCircle,
  IconXCircle,
  IconClock,
  IconPlay,
  IconAlertTriangle,
  IconShieldCheck,
} from "@/components/icons";

function bannerConfig(
  status: SubmissionStatus,
  verdict: Verdict | null,
): {
  title: string;
  body: string;
  badge: string;
  tone: "pass" | "fail" | "warn" | "accent" | "neutral";
  icon: typeof IconCheckCircle;
} {
  if (status === "queued") {
    return {
      title: "Queued for a sandbox container",
      body: "Your repository push was received and is waiting for an available isolated runner.",
      badge: "QUEUED",
      tone: "warn",
      icon: IconClock,
    };
  }
  if (status === "grading") {
    return {
      title: "Automated grading in progress",
      body: "Layer 1 sandbox checks and the Layer 2 rubric judge are executing in Docker. Results appear within seconds.",
      badge: "GRADING",
      tone: "accent",
      icon: IconPlay,
    };
  }
  if (status === "error") {
    return {
      title: "Grading interrupted",
      body: "The test runner hit an environment or timeout failure before writing a verdict. Review the timeline below.",
      badge: "ERROR",
      tone: "fail",
      icon: IconAlertTriangle,
    };
  }
  if (verdict?.overall === "pass") {
    return {
      title: "Verdict: passed",
      body: "All automated sandbox checks and rubric criteria passed. Your progress is recorded in the immutable ledger.",
      badge: "PASS",
      tone: "pass",
      icon: IconCheckCircle,
    };
  }
  if (verdict?.overall === "fail") {
    return {
      title: "Verdict: not passed",
      body: "One or more checks or rubric criteria did not meet the required bar. Inspect the failure breakdown and quoted evidence below.",
      badge: "FAIL",
      tone: "fail",
      icon: IconXCircle,
    };
  }
  return {
    title: "Graded",
    body: "Evaluation completed. Inspect the verdict details below.",
    badge: "GRADED",
    tone: "neutral",
    icon: IconShieldCheck,
  };
}

const TONES = {
  pass: { border: "border-pass/40", bg: "bg-pass/5", text: "text-pass", chip: "chip-pass" },
  fail: { border: "border-fail/40", bg: "bg-fail/5", text: "text-fail", chip: "chip-fail" },
  warn: { border: "border-warn/40", bg: "bg-warn/5", text: "text-warn", chip: "chip-warn" },
  accent: {
    border: "border-accent/40",
    bg: "bg-accent-soft",
    text: "text-accent",
    chip: "chip-accent",
  },
  neutral: { border: "border-line-strong", bg: "bg-raised", text: "text-ink", chip: "chip" },
} as const;

export function StatusBanner({
  status,
  verdict,
}: {
  status: SubmissionStatus;
  verdict: Verdict | null;
}) {
  const config = bannerConfig(status, verdict);
  const Icon = config.icon;
  const tone = TONES[config.tone];

  return (
    <div className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${tone.border} ${tone.bg}`}>
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span
          className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg border ${tone.border} ${tone.bg} ${tone.text}`}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{config.title}</h2>
          <p className="mt-1 max-w-[72ch] text-sm leading-relaxed text-ink-2">{config.body}</p>
        </div>
      </div>
      <span className={`${tone.chip} shrink-0`}>{config.badge}</span>
    </div>
  );
}
