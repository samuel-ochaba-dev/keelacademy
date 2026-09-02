"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runPracticeAttemptAction } from "@/app/units/[unitId]/practice-actions";
import type {
  PracticeAttemptResult,
  PracticeAttemptSummary,
  PracticeCheckResult,
  PracticeManifest,
} from "@/lib/practice";
import { formatUtc } from "@/lib/grading";

type PracticeWorkbenchProps = {
  unitId: string;
  manifest: PracticeManifest | null;
  initialAttempts: PracticeAttemptSummary[];
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown: boolean;
};

export function PracticeWorkbench({
  unitId,
  manifest,
  initialAttempts,
  isEnrolled,
  isSignedIn,
  serviceDown,
}: PracticeWorkbenchProps) {
  const editableFiles = manifest?.editable_files ?? [];
  const baseFiles = manifest?.base_files ?? {};

  // Form state for each editable file
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const fname of editableFiles) {
      initial[fname] = baseFiles[fname] ?? "";
    }
    return initial;
  });

  const [activeFile, setActiveFile] = useState<string>(
    editableFiles[0] ?? "schemas.py",
  );
  const [isPending, startTransition] = useTransition();
  const [latestResult, setLatestResult] = useState<PracticeAttemptResult | null>(
    null,
  );
  const [attempts, setAttempts] = useState<PracticeAttemptSummary[]>(initialAttempts);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  function handleFileChange(filename: string, content: string) {
    setFileContents((prev) => ({ ...prev, [filename]: content }));
  }

  function handleResetFile(filename: string) {
    if (baseFiles[filename] !== undefined) {
      setFileContents((prev) => ({ ...prev, [filename]: baseFiles[filename] }));
    }
  }

  function handleResetAll() {
    const reset: Record<string, string> = {};
    for (const fname of editableFiles) {
      reset[fname] = baseFiles[fname] ?? "";
    }
    setFileContents(reset);
  }

  function handleSubmit() {
    setErrorBanner(null);
    startTransition(async () => {
      const res = await runPracticeAttemptAction(unitId, fileContents);
      if (res.state === "ok") {
        setLatestResult(res.data);
        const newSummary: PracticeAttemptSummary = {
          id: res.data.attempt_id,
          student_id: res.data.student_id,
          unit_id: res.data.unit_id,
          passed: res.data.passed,
          pass_count: res.data.pass_count,
          total_checks: res.data.total_checks,
          checks: res.data.checks,
          created_at: res.data.created_at,
        };
        setAttempts((prev) => [newSummary, ...prev]);
      } else if (res.state === "unreachable") {
        setErrorBanner(
          "The checks did not run because the grading service did not answer. Your work in the editor is still here. Try again in a moment.",
        );
      } else if (res.state === "rejected") {
        setErrorBanner(
          res.message ||
            (res.code === "not_enrolled"
              ? "Running the checks needs an active enrollment in this unit."
              : "The checks did not run. Nothing was charged. Try again in a moment."),
        );
      }
    });
  }

  if (serviceDown || !manifest) {
    return (
      <div className="rounded-lg border border-circuit-border bg-carbon-veil p-5">
        <p className="text-[14.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
          The practice editor is not loading just now, so there is nothing to type into yet. The
          lesson and the worked example above are unaffected. Reload in a moment.
        </p>
      </div>
    );
  }

  return (
    <div data-keel-practice-workbench className="space-y-6">
      {/* Workbench panel */}
      <div className="card-dark p-0 overflow-hidden border border-circuit-border">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4 p-3.5 bg-carbon-veil border-b border-phosphor-blue-black">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-lime-pulse" />
            <span className="font-code-mono text-[12px] font-medium text-phosphor-white">
              practice-workbench
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isPending}
              className="text-[12px] font-code-mono text-moss-70 hover:text-phosphor-white transition-colors"
            >
              Reset all files
            </button>
          </div>
        </div>

        {/* File tabs */}
        <div className="flex items-center gap-1 p-2 bg-ground-iron border-b border-phosphor-blue-black overflow-x-auto">
          {editableFiles.map((fname) => (
            <button
              key={fname}
              type="button"
              onClick={() => setActiveFile(fname)}
              className={`px-3.5 py-1.5 rounded text-[13px] font-code-mono transition-colors ${
                activeFile === fname
                  ? "bg-carbon-veil text-lime-pulse font-medium"
                  : "text-moss-70 hover:text-phosphor-white"
              }`}
            >
              {fname}
            </button>
          ))}
        </div>

        {/* Code editor area */}
        <div className="p-4 bg-void-black/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-code-mono text-moss-70">
            <span>
              Editing: <span className="text-phosphor-white">{activeFile}</span>
            </span>
            <button
              type="button"
              onClick={() => handleResetFile(activeFile)}
              disabled={isPending}
              className="hover:text-phosphor-white transition-colors"
            >
              Reset this file
            </button>
          </div>

          <textarea
            aria-label={`Code editor for ${activeFile}`}
            value={fileContents[activeFile] ?? ""}
            onChange={(e) => handleFileChange(activeFile, e.target.value)}
            disabled={isPending || !isEnrolled}
            rows={16}
            spellCheck={false}
            className="w-full font-code-mono text-[13.5px] leading-relaxed p-4 bg-void-black text-moss-80 border border-circuit-border rounded-lg focus:border-lime-pulse focus:outline-none resize-y"
          />
        </div>

        {/* Submit action strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-carbon-veil border-t border-phosphor-blue-black">
          <div className="text-[13px] text-[color:var(--text-muted-on-dark)]">
            {!isSignedIn ? (
              <p>
                <Link
                  href={`/sign-in?next=/units/${unitId}#practice`}
                  className="text-fern-link underline hover:text-phosphor-white"
                >
                  Sign in
                </Link>{" "}
                and enroll to run the checks here.
              </p>
            ) : !isEnrolled ? (
              <p>
                Running the checks needs an active enrollment in this unit.{" "}
                <Link
                  href={`/map`}
                  className="text-fern-link underline hover:text-phosphor-white"
                >
                  Enroll from your progress map
                </Link>
                .
              </p>
            ) : (
              <p>
                These are the same automated checks that grade a submission. They run in a clean
                environment, cost you nothing, and you can run them as often as you like.
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !isEnrolled}
              className="btn btn-accent btn-sm"
            >
              {isPending ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-void-black animate-pulse" />
                  Running the checks...
                </>
              ) : (
                "Run the checks"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {errorBanner ? (
        <p
          role="alert"
          className="rounded-lg border border-circuit-border bg-carbon-veil p-4 text-[14px] leading-relaxed text-phosphor-white"
        >
          {errorBanner}
        </p>
      ) : null}

      {/* Latest attempt results */}
      {latestResult ? (
        <div className="card-dark space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-phosphor-blue-black pb-4">
            <div className="flex items-center gap-3">
              <span
                className={`chip ${
                  latestResult.passed ? "chip-live" : "chip-alert"
                }`}
              >
                {latestResult.passed ? "ALL CHECKS PASSED" : "NOT YET"}
              </span>
              <span className="font-code-mono text-[13px] text-phosphor-white">
                {`${latestResult.pass_count} / ${latestResult.total_checks} checks passing`}
              </span>
            </div>
            <span className="font-code-mono text-[12px] text-moss-70">
              {`Attempt #${latestResult.attempt_id}`}
            </span>
          </div>

          <div className="space-y-3">
            {latestResult.checks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Attempt history */}
      {attempts.length > 0 ? (
        <div className="card-dark space-y-4">
          <h4 className="eyebrow text-[12px]">
            {`Practice attempt history (${attempts.length})`}
          </h4>

          <div className="space-y-2.5">
            {attempts.map((att) => (
              <div
                key={att.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-carbon-veil border border-circuit-border font-code-mono text-[12.5px]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`chip ${att.passed ? "chip-live" : "chip-outline"} text-[10px]`}
                  >
                    {att.passed ? "PASSED" : "NOT YET"}
                  </span>
                  <span className="text-phosphor-white">
                    {`${att.pass_count} / ${att.total_checks} passing`}
                  </span>
                  <span className="text-moss-70">
                    {`attempt #${att.id}`}
                  </span>
                </div>
                <span className="text-moss-70 text-[11px]">
                  {formatUtc(att.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CheckCard({ check }: { check: PracticeCheckResult }) {
  const isPass = check.status === "pass";
  return (
    <div
      className={`p-4 rounded-lg border bg-carbon-veil space-y-2 ${
        isPass ? "border-lime-pulse/40" : "border-circuit-border"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 font-code-mono text-[12px]">
        <div className="flex items-center gap-2">
          <code className="text-phosphor-white font-medium">{check.id}</code>
          <span className="chip chip-outline text-[10px]">{check.type}</span>
        </div>

        <div className="flex items-center gap-3">
          {check.wall_s !== null ? (
            <span className="text-moss-70">
              {check.wall_s.toFixed(2)}s
            </span>
          ) : null}
          <span
            className={`chip ${isPass ? "chip-live" : "chip-alert"} text-[10px]`}
          >
            {check.status.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-[13.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">{check.note}</p>

      {check.output_tail ? (
        <details className="pt-2 text-[12px] font-code-mono">
          <summary className="cursor-pointer text-moss-70 hover:text-phosphor-white transition-colors">
            See the output
          </summary>
          <pre className="mt-2 p-3 rounded bg-void-black text-moss-80 border border-circuit-border overflow-x-auto text-[11.5px] whitespace-pre-wrap">
            {check.output_tail}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
