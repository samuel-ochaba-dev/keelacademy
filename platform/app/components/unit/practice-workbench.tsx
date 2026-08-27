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
    <div data-keel-practice-workbench>
      {/* Workbench panel */}
      <div>
        {/* Header bar */}
        <div>
          <div>
            <span>
              practice-workbench
            </span>
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isPending}
            >
              Reset all files
            </button>
          </div>
        </div>

        {/* File tabs */}
        <div>
          {editableFiles.map((fname) => (
            <button
              key={fname}
              type="button"
              onClick={() => setActiveFile(fname)}
            >
              {fname}
            </button>
          ))}
        </div>

        {/* Code editor area */}
        <div>
          <div>
            <span>
              Editing: {activeFile}
            </span>
            <button
              type="button"
              onClick={() => handleResetFile(activeFile)}
              disabled={isPending}
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
          />
        </div>

        {/* Submit action strip */}
        <div>
          <div>
            {!isSignedIn ? (
              <p>
                <Link
                  href={`/sign-in?next=/units/${unitId}#practice`}
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
                >
                  Enroll via the Progress Map
                </Link>
                .
              </p>
            ) : (
              <p>
                Deterministic Layer-1 checks run in an isolated sandbox. Fast,
                free, retryable.
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !isEnrolled}
            >
              {isPending ? (
                <>
                  <span aria-hidden />
                  Grading in sandbox...
                </>
              ) : (
                <>
                  Run practice checks
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
