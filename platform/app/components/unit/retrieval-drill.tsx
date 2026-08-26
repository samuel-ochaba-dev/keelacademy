"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runRetrievalAttemptAction } from "@/app/units/[unitId]/practice-actions";
import {
  IconArrowRight,
  IconCheckCircle,
  IconClock,
  IconPlay,
  IconRefreshCw,
  IconZap,
  IconXCircle,
} from "@/components/icons";
import type {
  RetrievalAttemptResult,
  RetrievalAttemptSummary,
} from "@/lib/practice";
import { formatUtc } from "@/lib/grading";

type RetrievalDrillProps = {
  unitId: string;
  seeds: string[];
  initialAttempts: RetrievalAttemptSummary[];
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown: boolean;
};

export function RetrievalDrill({
  unitId,
  seeds,
  initialAttempts,
  isEnrolled,
  isSignedIn,
  serviceDown,
}: RetrievalDrillProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [latestResult, setLatestResult] = useState<RetrievalAttemptResult | null>(
    null,
  );
  const [attempts, setAttempts] = useState<RetrievalAttemptSummary[]>(
    initialAttempts,
  );
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const currentSeed = seeds[currentIndex] ?? "";
  const currentAnswer = answers[currentIndex] ?? "";

  function handleAnswerChange(val: string) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: val }));
  }

  function handleClearAnswer() {
    setAnswers((prev) => ({ ...prev, [currentIndex]: "" }));
    setLatestResult(null);
  }

  function handleSelectQuestion(index: number) {
    setCurrentIndex(index);
    setLatestResult(null);
    setErrorBanner(null);
  }

  function handleNextQuestion() {
    if (currentIndex < seeds.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setLatestResult(null);
      setErrorBanner(null);
    }
  }

  function handleSubmit() {
    if (!currentAnswer.trim()) return;
    setErrorBanner(null);
    startTransition(async () => {
      const res = await runRetrievalAttemptAction(
        unitId,
        currentIndex,
        currentSeed,
        currentAnswer.trim(),
      );
      if (res.state === "ok") {
        setLatestResult(res.data);
        const newSummary: RetrievalAttemptSummary = {
          id: res.data.attempt_id,
          student_id: res.data.student_id,
          unit_id: res.data.unit_id,
          seed_index: res.data.seed_index,
          seed_prompt: res.data.seed_prompt,
          passed: res.data.passed,
          feedback: res.data.feedback,
          evidence: res.data.evidence,
          tokens_charged: res.data.tokens_charged,
          created_at: res.data.created_at,
        };
        setAttempts((prev) => [newSummary, ...prev]);
      } else if (res.state === "unreachable") {
        setErrorBanner("Practice grading service is currently unreachable.");
      } else if (res.state === "rejected") {
        if (res.code === "budget_exceeded" || res.status === 429) {
          setErrorBanner(
            "Token budget exceeded. Additional budget required to run retrieval judge.",
          );
        } else if (res.code === "not_enrolled" || res.status === 403) {
          setErrorBanner(
            "Active enrollment required to run retrieval drills.",
          );
        } else {
          setErrorBanner(res.message || `Request failed: ${res.code}`);
        }
      }
    });
  }

  if (serviceDown) {
    return (
      <div className="rounded-xl border border-line bg-raised p-6">
        <div className="flex items-center gap-3 text-ink-3">
          <IconZap size={20} className="text-ink-3" />
          <p className="text-sm">
            Practice grading service is currently unreachable.
          </p>
        </div>
      </div>
    );
  }

  if (!seeds || seeds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8" data-keel-retrieval-drill>
      {/* Question tabs */}
      <div className="overflow-hidden rounded-xl border border-line bg-raised">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-raised-2 px-5 py-3">
          <div className="flex items-center gap-2">
            <IconZap size={16} className="text-accent" />
            <span className="font-mono text-xs font-medium text-ink">
              retrieval-drill
            </span>
          </div>

          <span className="font-mono text-xs text-ink-3">
            Question {currentIndex + 1} of {seeds.length}
          </span>
        </div>

        {/* Question selector tabs */}
        <div className="flex overflow-x-auto border-b border-line bg-inset px-4 pt-2">
          {seeds.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectQuestion(idx)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs transition-colors ${
                currentIndex === idx
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-3 hover:text-ink"
              }`}
            >
              Question {idx + 1}
            </button>
          ))}
        </div>

        {/* Prompt & Answer area */}
        <div className="p-6">
          <div className="rounded-lg border border-line bg-inset p-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
              Recall Prompt
            </span>
            <p className="mt-2 text-sm leading-relaxed font-medium text-ink">
              {currentSeed}
            </p>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between pb-2">
              <label
                htmlFor={`retrieval-answer-${currentIndex}`}
                className="font-mono text-[11px] text-ink-3"
              >
                Your explanation from memory:
              </label>
              {currentAnswer ? (
                <button
                  type="button"
                  onClick={handleClearAnswer}
                  disabled={isPending}
                  className="font-mono text-[11px] text-ink-3 hover:text-accent"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <textarea
              id={`retrieval-answer-${currentIndex}`}
              aria-label={`Retrieval answer for question ${currentIndex + 1}`}
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              disabled={isPending || !isEnrolled}
              rows={6}
              placeholder="Explain the core technical principle in your own words. Focus on the mechanism rather than keyword matching."
              className="w-full resize-y rounded-lg border border-line bg-inset p-4 font-mono text-xs leading-relaxed text-ink outline-none placeholder:text-ink-3/50 focus:border-accent"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Action bar */}
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
                and enroll to run retrieval drills.
              </p>
            ) : !isEnrolled ? (
              <p className="text-xs text-ink-3">
                Active enrollment required to run retrieval drills.{" "}
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
                Free-recall evaluation via Layer-2 judge. Graded against the lesson.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !isEnrolled || !currentAnswer.trim()}
              className="btn btn-primary"
            >
              {isPending ? (
                <>
                  <span className="live-dot" aria-hidden />
                  Evaluating answer...
                </>
              ) : (
                <>
                  <IconPlay size={14} />
                  Grade retrieval answer
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

      {/* Latest verdict display */}
      {latestResult ? (
        <div className="rounded-xl border border-line bg-raised p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {latestResult.passed ? (
                <span className="chip-pass font-medium">
                  <IconCheckCircle size={14} className="inline mr-1" />
                  PASS
                </span>
              ) : (
                <span className="chip-fail font-medium">
                  <IconXCircle size={14} className="inline mr-1" />
                  FAIL
                </span>
              )}
              <span className="font-mono text-xs text-ink-2">
                {latestResult.passed
                  ? "Concept demonstrated"
                  : "Concept not yet demonstrated"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink-3">
                {latestResult.tokens_charged} tokens charged
              </span>
              <span className="font-mono text-xs text-ink-3">
                Attempt #{latestResult.attempt_id}
              </span>
            </div>
          </div>

          <div className="border-t border-line pt-4 space-y-3">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-ink-3">
                Judge Feedback
              </span>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {latestResult.feedback}
              </p>
            </div>

            {latestResult.evidence ? (
              <div className="rounded-lg border border-line bg-inset p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                  Supporting Evidence
                </span>
                <p className="mt-1 font-mono text-xs italic text-ink-2">
                  &ldquo;{latestResult.evidence}&rdquo;
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <button
              type="button"
              onClick={handleClearAnswer}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-3 hover:text-ink"
            >
              <IconRefreshCw size={12} />
              Try again
            </button>

            {currentIndex < seeds.length - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="btn btn-secondary text-xs"
              >
                Next question
                <IconArrowRight size={12} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Retrieval Attempt history */}
      {attempts.length > 0 ? (
        <div className="mt-8 space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <IconClock size={16} className="text-accent" />
            {`Retrieval attempt history (${attempts.length})`}
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
                    Question {att.seed_index + 1}
                  </span>
                  <span className="font-mono text-ink-3">
                    {att.tokens_charged} tokens
                  </span>
                  <span className="font-mono text-ink-3">
                    attempt #{att.id}
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
