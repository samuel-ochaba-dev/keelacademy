"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runRetrievalAttemptAction } from "@/app/units/[unitId]/practice-actions";
import type {
  RetrievalAttemptResult,
  RetrievalAttemptSummary,
} from "@/lib/practice";
import { formatUtc } from "@/lib/grading";

type RetrievalDrillProps = {
  unitId: string;
  seeds: string[];
  initialAttempts: RetrievalAttemptSummary[];
  dueSeedIndices?: number[];
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown: boolean;
};

export function RetrievalDrill({
  unitId,
  seeds,
  initialAttempts,
  dueSeedIndices = [],
  isEnrolled,
  isSignedIn,
  serviceDown,
}: RetrievalDrillProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    dueSeedIndices.length > 0 ? Math.min(...dueSeedIndices) : 0,
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [latestResult, setLatestResult] = useState<RetrievalAttemptResult | null>(
    null,
  );
  const [attempts, setAttempts] = useState<RetrievalAttemptSummary[]>(
    initialAttempts,
  );
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [dueSet, setDueSet] = useState<Set<number>>(() => new Set(dueSeedIndices));

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
        if (res.data.passed) {
          // A passing attempt on a due seed is the re-check: clear it locally.
          setDueSet((prev) => {
            if (!prev.has(res.data.seed_index)) return prev;
            const next = new Set(prev);
            next.delete(res.data.seed_index);
            return next;
          });
        }
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
      <div>
        <div>
          <p>
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
    <div data-keel-retrieval-drill>
      {/* Question tabs */}
      <div>
        <div>
          <div>
            <span>
              retrieval-drill
            </span>
          </div>

          <span>
            Question {currentIndex + 1} of {seeds.length}
          </span>
        </div>

        {/* Question selector tabs */}
        <div>
          {seeds.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectQuestion(idx)}
            >
              Question {idx + 1}
              {dueSet.has(idx) ? (
                <span>
                  Re-check due
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Prompt & Answer area */}
        <div>
          {dueSet.has(currentIndex) ? (
            <div>
              <p>
                Re-check due. A passing answer here clears it.
              </p>
            </div>
          ) : null}
          <div>
            <span>
              Recall Prompt
            </span>
            <p>
              {currentSeed}
            </p>
          </div>

          <div>
            <div>
              <label
                htmlFor={`retrieval-answer-${currentIndex}`}
              >
                Your explanation from memory:
              </label>
              {currentAnswer ? (
                <button
                  type="button"
                  onClick={handleClearAnswer}
                  disabled={isPending}
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
              spellCheck={false}
            />
          </div>
        </div>

        {/* Action bar */}
        <div>
          <div>
            {!isSignedIn ? (
              <p>
                <Link
                  href={`/sign-in?next=/units/${unitId}#practice`}
                >
                  Sign in
                </Link>{" "}
                and enroll to run retrieval drills.
              </p>
            ) : !isEnrolled ? (
              <p>
                Active enrollment required to run retrieval drills.{" "}
                <Link
                  href={`/map`}
                >
                  Enroll via the Progress Map
                </Link>
                .
              </p>
            ) : (
              <p>
                Free-recall evaluation via Layer-2 judge. Graded against the lesson.
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !isEnrolled || !currentAnswer.trim()}
            >
              {isPending ? (
                <>
                  <span aria-hidden />
                  Evaluating answer...
                </>
              ) : (
                <>
                  Grade retrieval answer
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

      {/* Latest verdict display */}
      {latestResult ? (
        <div>
          <div>
            <div>
              {latestResult.passed ? (
                <span>
                  PASS
                </span>
              ) : (
                <span>
                  FAIL
                </span>
              )}
              <span>
                {latestResult.passed
                  ? "Concept demonstrated"
                  : "Concept not yet demonstrated"}
              </span>
            </div>

            <div>
              <span>
                {latestResult.tokens_charged} tokens charged
              </span>
              <span>
                Attempt #{latestResult.attempt_id}
              </span>
            </div>
          </div>

          <div>
            <div>
              <span>
                Judge Feedback
              </span>
              <p>
                {latestResult.feedback}
              </p>
            </div>

            {latestResult.evidence ? (
              <div>
                <span>
                  Supporting Evidence
                </span>
                <p>
                  &ldquo;{latestResult.evidence}&rdquo;
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <button
              type="button"
              onClick={handleClearAnswer}
            >
              Try again
            </button>

            {currentIndex < seeds.length - 1 ? (
              <button
                type="button"
                onClick={handleNextQuestion}
              >
                Next question
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Retrieval Attempt history */}
      {attempts.length > 0 ? (
        <div>
          <h4>
            {`Retrieval attempt history (${attempts.length})`}
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
                    Question {att.seed_index + 1}
                  </span>
                  <span>
                    {att.tokens_charged} tokens
                  </span>
                  <span>
                    attempt #{att.id}
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
