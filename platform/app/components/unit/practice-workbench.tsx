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
      <div>
        <div>
          <p>
            Practice grading service is currently unreachable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-keel-practice-workbench className="space-y-6">
      {/* Workbench panel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-zinc-400 font-semibold ml-2">
              practice-workbench
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isPending}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 transition-colors disabled:opacity-50"
            >
              Reset all files
            </button>
          </div>
        </div>

        {/* File tabs */}
        <div className="flex items-center gap-1 px-3 pt-2 border-b border-zinc-800/80 bg-zinc-900/40 overflow-x-auto">
          {editableFiles.map((fname) => {
            const isActive = activeFile === fname;
            return (
              <button
                key={fname}
                type="button"
                onClick={() => setActiveFile(fname)}
                className={`px-3 py-1.5 rounded-t text-xs font-mono transition-colors border-t border-x ${
                  isActive
                    ? "bg-zinc-950 text-sky-400 border-zinc-800 font-semibold"
                    : "bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                {fname}
              </button>
            );
          })}
        </div>

        {/* Code editor area */}
        <div className="p-4 space-y-3 bg-zinc-950">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>
              Editing: <span className="text-zinc-200">{activeFile}</span>
            </span>
            <button
              type="button"
              onClick={() => handleResetFile(activeFile)}
              disabled={isPending}
              className="text-zinc-500 hover:text-zinc-300 underline"
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
            spellCheck={false}
            className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 p-4 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500/80 leading-relaxed resize-y"
          />
        </div>

        {/* Submit action strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-800 bg-zinc-900/60">
          <div className="text-xs font-sans text-zinc-400">
            {!isSignedIn ? (
              <p>
                <Link
                  href={`/sign-in?next=/units/${unitId}#practice`}
                  className="text-sky-400 hover:underline font-mono"
                >
                  Sign in
                </Link>{" "}
                and enroll to run checks in the sandbox.
              </p>
            ) : !isEnrolled ? (
              <p>
                Active enrollment required to run checks.{" "}
                <Link
                  href={`/map`}
                  className="text-sky-400 hover:underline font-mono"
                >
                  Enroll via the Progress Map
                </Link>
                .
              </p>
            ) : (
              <p className="font-mono text-zinc-400">
                Deterministic Layer-1 checks run in an isolated sandbox. Fast, free, retryable.
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !isEnrolled}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-mono text-xs font-semibold tracking-wide transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" aria-hidden />
                  Grading in sandbox...
                </>
              ) : (
                <>
                  Run practice checks →
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {errorBanner ? (
        <div>
          {errorBanner}
        </div>
      ) : null}

      {/* Latest attempt results */}
      {latestResult ? (
        <div>
          <div>
            <div>
              <span
              >
                {latestResult.passed ? "All checks passed" : "Checks failed"}
              </span>
              <span>
                {`${latestResult.pass_count} / ${latestResult.total_checks} checks passing`}
              </span>
            </div>
            <span>
              {`Attempt #${latestResult.attempt_id}`}
            </span>
          </div>

          <div>
            {latestResult.checks.map((check) => (
              <CheckCard key={check.id} check={check} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Attempt history */}
      {attempts.length > 0 ? (
        <div>
          <h4>
            {`Practice attempt history (${attempts.length})`}
          </h4>

          <div>
            {attempts.map((att) => (
              <div
                key={att.id}
              >
                <div>
                  <span>
                    {att.passed ? "PASS" : "FAIL"}
                  </span>
                  <span>
                    {`${att.pass_count} / ${att.total_checks} passing`}
                  </span>
                  <span>
                    {`attempt #${att.id}`}
                  </span>
                </div>
                <span>
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
  return (
    <div
    >
      <div>
        <div>
          <code>{check.id}</code>
          <span>{check.type}</span>
        </div>

        <div>
          {check.wall_s !== null ? (
            <span>
              {check.wall_s.toFixed(2)}s
            </span>
          ) : null}
          <span>
            {check.status.toUpperCase()}
          </span>
        </div>
      </div>

      <p>{check.note}</p>

      {check.output_tail ? (
        <details>
          <summary>
            View sandbox output
          </summary>
          <pre>
            {check.output_tail}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
