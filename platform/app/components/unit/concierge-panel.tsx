"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type {
  ConciergeMode,
  ConciergeTurn,
  PracticeRouteData,
} from "@/lib/practice";

type ConciergePanelProps = {
  unitId: string;
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown?: boolean;
  routeData: PracticeRouteData | null;
  initialTurns: ConciergeTurn[];
};

export function ConciergePanel({
  unitId,
  isEnrolled,
  isSignedIn,
  serviceDown = false,
  routeData,
  initialTurns,
}: ConciergePanelProps) {
  const [turns, setTurns] = useState<ConciergeTurn[]>(initialTurns);
  const [question, setQuestion] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBudgetExhausted, setIsBudgetExhausted] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Derive initial mode and reason from server-provided route state
  const initialMode: ConciergeMode =
    routeData?.status === "completed" ? "guard" : "teach";
  const initialReason =
    routeData?.status === "completed"
      ? "Practice route completed (build context): Socratic unblocking active; deliverable generation refused."
      : `Practice route in progress (${routeData?.recommended_step ?? "practice"} context): free explanation and micro-exercises active.`;

  const [currentMode, setCurrentMode] = useState<ConciergeMode>(
    turns.length > 0 ? turns[turns.length - 1].mode : initialMode,
  );
  const [modeReason, setModeReason] = useState<string>(initialReason);
  const [latestAnswer, setLatestAnswer] = useState<string | null>(
    turns.length > 0 ? turns[turns.length - 1].answer : null,
  );
  const [latestTokens, setLatestTokens] = useState<number | null>(
    turns.length > 0 ? turns[turns.length - 1].tokens_charged : null,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isPending) return;

    const submittedQuestion = question.trim();
    setErrorMsg(null);
    setIsBudgetExhausted(false);

    startTransition(async () => {
      try {
        const res = await fetch("/api/concierge/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unit_id: unitId,
            question: submittedQuestion,
          }),
        });

        if (res.status === 429) {
          setIsBudgetExhausted(true);
          setErrorMsg(
            "Token budget exhausted (HTTP 429). The concierge cannot process further questions until your token budget is replenished.",
          );
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const code = errData.error || `HTTP ${res.status}`;
          setErrorMsg(
            errData.message ||
              `Concierge request failed (${code}). Check connection.`,
          );
          return;
        }

        const data = await res.json();
        const newTurn: ConciergeTurn = {
          id: data.turn_id,
          student_id: data.student_id,
          unit_id: data.unit_id,
          mode: data.mode,
          question: submittedQuestion,
          answer: data.answer,
          tokens_charged: data.tokens_charged,
          created_at: data.created_at,
        };

        setTurns((prev) => [...prev, newTurn]);
        setCurrentMode(data.mode);
        setModeReason(data.mode_reason);
        setLatestAnswer(data.answer);
        setLatestTokens(data.tokens_charged);
        setQuestion("");
      } catch (err) {
        setErrorMsg(
          `Concierge service unreachable: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    });
  };

  return (
    <section
      id="concierge"
      data-keel-section="concierge"
    >
      <div>
        {/* Header */}
        <div>
          <div>
            <div>
              <span>
                SECTION 06
              </span>
              <span>/</span>
              <span>
                ALWAYS-ON TA BENCH
              </span>
            </div>
            <h2>
              AI Concierge
            </h2>
            <p>
              Curriculum-scoped assistant with structural mode switching. In
              teach mode, it explains concepts and generates micro-exercises. In
              guard mode, it provides Socratic unblocking without writing the
              deliverable.
            </p>
          </div>

          {/* Mode Badge */}
          <div>
            {currentMode === "teach" ? (
              <div>
                <span>TEACH MODE</span>
              </div>
            ) : (
              <div>
                <span>GUARD MODE</span>
              </div>
            )}
            <span>
              {modeReason}
            </span>
          </div>
        </div>

        {/* Guard mode contract notice */}
        <div>
          <div>
            <span>
              Guard mode contract: In build context the concierge unblocks. It
              does not write the deliverable.
            </span>
          </div>
          <span>
            Derivation: server-side via adaptive route state
          </span>
        </div>

        {/* Service State Gate */}
        {serviceDown ? (
          <div>
            Concierge service offline or unreachable. Check grading server
            connection.
          </div>
        ) : !isSignedIn ? (
          <div>
            <p>
              Sign in with your student account to access the AI concierge.
            </p>
            <Link
              href={`/sign-in?next=/units/${unitId}#concierge`}
            >
              Sign In to Ask Concierge
            </Link>
          </div>
        ) : !isEnrolled ? (
          <div>
            <p>
              Active enrollment required for Unit {unitId} to use the AI
              concierge.
            </p>
            <Link
              href={`/pricing`}
            >
              View Enrollment Tiers
            </Link>
          </div>
        ) : (
          <div>
            {/* Question Input Box */}
            <form
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  htmlFor="concierge-question"
                >
                  <span>Ask a Question</span>
                </label>
                <span>
                  {currentMode === "teach"
                    ? "Teach context active"
                    : "Guard context active"}
                </span>
              </div>

              <textarea
                id="concierge-question"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  currentMode === "teach"
                    ? "Ask why a concept works, request a micro-exercise, or ask for clarification on lesson mechanics..."
                    : "Ask for unblocking help on stack traces, environment configuration, or requirement interpretation..."
                }
                disabled={isPending || isBudgetExhausted}
              />

              {errorMsg ? (
                <div>
                  <span>{errorMsg}</span>
                </div>
              ) : null}

              <div>
                <span>
                  Delimited student input with prompt injection defense.
                </span>
                <button
                  type="submit"
                  disabled={!question.trim() || isPending || isBudgetExhausted}
                >
                  {isPending ? (
                    <>
                      
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <span>Ask Concierge</span>
                  )}
                </button>
              </div>
            </form>

            {/* Latest Reply */}
            {latestAnswer ? (
              <div>
                <div>
                  <div>
                    <span>
                      CONCIERGE REPLY
                    </span>
                    <span
                    >
                      {currentMode.toUpperCase()}
                    </span>
                  </div>
                  {latestTokens !== null ? (
                    <span>
                      Charged: {latestTokens} tokens
                    </span>
                  ) : null}
                </div>
                <div>
                  {latestAnswer}
                </div>
              </div>
            ) : null}

            {/* Turn History */}
            {turns.length > 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                >
                  <div>
                    <span>
                      Conversation History ({turns.length}{" "}
                      {turns.length === 1 ? "turn" : "turns"})
                    </span>
                  </div>
                </button>

                {showHistory ? (
                  <div>
                    {turns.map((turn, index) => (
                      <div key={turn.id ?? index}>
                        <div>
                          <span>
                            Q: {turn.question}
                          </span>
                          <div>
                            <span
                            >
                              {turn.mode.toUpperCase()}
                            </span>
                            <span>
                              {turn.tokens_charged} tok
                            </span>
                          </div>
                        </div>
                        <div>
                          {turn.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
