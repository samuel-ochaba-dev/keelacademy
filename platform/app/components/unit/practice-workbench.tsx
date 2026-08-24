"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runPracticeAttemptAction } from "@/app/units/[unitId]/practice-actions";
import {
  IconCheckCircle,
  IconClock,
  IconCode,
  IconPlay,
  IconRefreshCw,
  IconTerminal,
  IconXCircle,
} from "@/components/icons";
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
        setErrorBanner("Practice grading service is currently unreachable.");
      } else if (res.state === "rejected") {
        setErrorBanner(
          res.message ||
            (res.code === "not_enrolled"
              ? "Active enrollment required to run practice checks."
              : `Request failed: ${res.code}`),
        );
      }
    });
  }

  if (serviceDown || !manifest) {
    return (
      <div className="rounded-xl border border-line bg-raised p-6">
        <div className="flex items-center gap-3 text-ink-3">
          <IconTerminal size={20} className="text-ink-3" />
          <p className="text-sm">
            Practice grading service is currently unreachable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-keel-practice-workbench>
      {/* Workbench panel */}
      <div className="overflow-hidden rounded-xl border border-line bg-raised">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-raised-2 px-5 py-3">
          <div className="flex items-center gap-2">
            <IconTerminal size={16} className="text-accent" />
            <span className="font-mono text-xs font-medium text-ink">
              practice-workbench
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs text-ink-3 hover:text-ink"
            >
              <IconRefreshCw size={12} />
              Reset all files
            </button>
          </div>
        </div>

        {/* File tabs */}
        <div className="flex border-b border-line bg-inset px-4 pt-2">
          {editableFiles.map((fname) => (
            <button
              key={fname}
              type="button"
              onClick={() => setActiveFile(fname)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs transition-colors ${
                activeFile === fname
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-3 hover:text-ink"
              }`}
            >
              <IconCode size={14} />
              {fname}
            </button>
          ))}
        </div>

        {/* Code editor area */}
        <div className="p-4">
          <div className="flex items-center justify-between pb-2">
            <span className="font-mono text-[11px] text-ink-3">
              Editing: {activeFile}
            </span>
            <button
              type="button"
              onClick={() => handleResetFile(activeFile)}
              disabled={isPending}
              className="font-mono text-[11px] text-ink-3 hover:text-accent"
            >
              Reset this file
            </button>
          </div>

          <textarea
            aria-label={`Code editor for ${activeFile}`}
            value={fileContents[activeFile] ?? ""}
            onChange={(e) => handleFileChange(activeFile, e.target.value)}
            disabled={isPending || !isEnrolled}
            rows={18}
            className="w-full resize-y rounded-lg border border-line bg-inset p-4 font-mono text-xs leading-relaxed text-ink outline-none focus:border-accent"
            spellCheck={false}
          />
        </div>

        {/* Submit action strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-raised-2 px-5 py-4">
          <div>
            {!isSignedIn ? (
              <p className="text-xs text-ink-3">
                <Link
                  href={`/sign-in?next=/units/${unitId}#practice`}
                  className="text-accent underline hover:text-accent-strong"
                >
                  Sign in
                </Link>{" "}
                and enroll to run checks in the sandbox.
              </p>
            ) : !isEnrolled ? (
              <p className="text-xs text-ink-3">
                Active enrollment required to run checks.{" "}
                <Link
                  href={`/map`}
                  className="text-accent underline hover:text-accent-strong"
                >
                  Enroll via the Progress Map
                </Link>
                .
              </p>
            ) : (
              <p className="text-xs text-ink-3">
                Deterministic Layer-1 checks run in an isolated sandbox. Fast,
                free, retryable.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !isEnrolled}
              className="btn btn-primary"
            >
              {isPending ? (
                <>
                  <span className="live-dot" aria-hidden />
                  Grading in sandbox...
                </>
              ) : (
                <>
                  <IconPlay size={14} />
                  Run practice checks
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {errorBanner ? (
        <div className="rounded-xl border border-fail/30 bg-fail/10 p-4 text-sm text-fail">
          {errorBanner}
        </div>
      ) : null}

      {/* Latest attempt results */}
      {latestResult ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={
                  latestResult.passed ? "chip-pass font-medium" : "chip-fail font-medium"
                }
              >
                {latestResult.passed ? "All checks passed" : "Checks failed"}
              </span>
              <span className="font-mono text-xs text-ink-3">
                {`${latestResult.pass_count} / ${latestResult.total_checks} checks passing`}
              </span>
            </div>
            <span className="font-mono text-xs text-ink-3">
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
        <div className="mt-8 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <IconClock size={16} className="text-accent" />
            {`Practice attempt history (${attempts.length})`}
          </h4>

          <div className="panel divide-y divide-line overflow-hidden">
            {attempts.map((att) => (
              <div
                key={att.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={att.passed ? "chip-pass" : "chip-fail"}>
                    {att.passed ? "PASS" : "FAIL"}
                  </span>
                  <span className="font-mono text-ink">
                    {`${att.pass_count} / ${att.total_checks} passing`}
                  </span>
                  <span className="font-mono text-ink-3">
                    {`attempt #${att.id}`}
                  </span>
                </div>
                <span className="font-mono text-ink-3">
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
      className={`rounded-xl border p-4 transition-colors ${
        isPass
          ? "border-pass/30 bg-pass/5"
          : "border-fail/30 bg-fail/5"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isPass ? (
            <IconCheckCircle size={18} className="text-pass" />
          ) : (
            <IconXCircle size={18} className="text-fail" />
          )}
          <code className="text-xs font-semibold text-ink">{check.id}</code>
          <span className="chip text-[10px]">{check.type}</span>
        </div>

        <div className="flex items-center gap-3">
          {check.wall_s !== null ? (
            <span className="font-mono text-[11px] text-ink-3">
              {check.wall_s.toFixed(2)}s
            </span>
          ) : null}
          <span className={isPass ? "chip-pass" : "chip-fail"}>
            {check.status.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="mt-2 font-mono text-xs text-ink-2">{check.note}</p>

      {check.output_tail ? (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer font-mono text-[11px] text-ink-3 hover:text-accent">
            View sandbox output
          </summary>
          <pre className="code-block mt-2 max-h-64 overflow-y-auto text-xs text-ink-2 whitespace-pre-wrap">
            {check.output_tail}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
