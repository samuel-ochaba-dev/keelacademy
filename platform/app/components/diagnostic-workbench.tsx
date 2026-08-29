"use client";

import { useState } from "react";
import Link from "next/link";
import type { PlacementDiagnostic } from "@/lib/content";
import type {
  DiagnosticAttempt,
  DiagnosticEvaluateResult,
} from "@/lib/practice";

type Props = {
  diagnostic: PlacementDiagnostic;
  studentId: number;
  initialAttempts: DiagnosticAttempt[];
};

export function DiagnosticWorkbench({
  diagnostic,
  studentId,
  initialAttempts,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inFlight, setInFlight] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [latestResult, setLatestResult] =
    useState<DiagnosticEvaluateResult | null>(null);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = diagnostic.questions.length;
  const isComplete = answeredCount === totalQuestions;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete || inFlight) return;
    setInFlight(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/diagnostic/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          diagnostic_id: diagnostic.id,
          answers,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(err.error || `Evaluation failed with status ${res.status}`);
        setInFlight(false);
        return;
      }

      const data = (await res.json()) as DiagnosticEvaluateResult;
      setLatestResult(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setInFlight(false);
    }
  };

  const handleOptOut = async () => {
    if (inFlight) return;
    setInFlight(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/diagnostic/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          diagnostic_id: diagnostic.id,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMsg(err.error || `Opt-out failed with status ${res.status}`);
        setInFlight(false);
        return;
      }

      const data = (await res.json()) as DiagnosticEvaluateResult;
      setLatestResult(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setInFlight(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Overview & Progress Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Adaptive Placement Gate
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
              {diagnostic.title}
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              20-minute adaptive foundations check. Clearing it (≥{diagnostic.passing_threshold_pct}%) places you straight into Unit 1.3, skipping 1.1–1.2 basics.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-md bg-zinc-950 px-3.5 py-1.5 border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500 mr-2">PROGRESS:</span>
              <span className="text-emerald-400 font-bold">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Categories checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-800/80 text-[11px] font-mono">
          {diagnostic.categories.map((cat) => (
            <div key={cat.id} className="rounded bg-zinc-950/60 p-2 border border-zinc-800/60">
              <span className="text-zinc-500 block truncate">{cat.title}</span>
              <span className="text-zinc-300 font-semibold">{Math.round(cat.weight * 100)}% weight</span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-950/30 p-4 text-xs font-mono text-red-200"
        >
          {errorMsg}
        </div>
      )}

      {/* 2. Verdict Result Card (if evaluated or prior attempts exist) */}
      {latestResult ? (
        <DiagnosticResultCard result={latestResult} />
      ) : initialAttempts.length > 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-100">
              Prior Placement Record
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                initialAttempts[0].passed
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              {initialAttempts[0].passed ? "PLACED IN UNIT 1.3" : initialAttempts[0].route === "opt_out" ? "OPTED OUT" : "BASELINE (0.1 / 1.1)"}
            </span>
          </div>

          <div className="text-xs font-mono space-y-2 text-zinc-300">
            <p>
              Score: <span className="font-bold text-zinc-100">{initialAttempts[0].score_pct}%</span> ({initialAttempts[0].points_earned}/{initialAttempts[0].points_possible} points)
            </p>
            <p className="text-zinc-400 font-sans">
              {initialAttempts[0].passed
                ? "You demonstrated mastery of Phase 1 fundamentals. Phase 1.1–1.2 basics are bypassed; start directly at Unit 1.3."
                : "You are routed through the standard curriculum baseline starting at Phase 0/1."}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/map"
              className="rounded-md bg-emerald-500 px-5 py-2 text-xs font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Open Meridian Map &rarr;
            </Link>
          </div>
        </div>
      ) : null}

      {/* 3. Interactive Question Set Form */}
      <form onSubmit={handleEvaluate} className="space-y-6">
        <div className="space-y-6">
          {diagnostic.questions.map((q, qIndex) => {
            const selectedOpt = answers[q.id];
            return (
              <div
                key={q.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Question {qIndex + 1} of {totalQuestions} · {q.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {q.points} pt{q.points > 1 ? "s" : ""} · {q.type.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {q.prompt}
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = selectedOpt === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`flex items-start gap-3 p-3 rounded-md border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-950/20 text-zinc-100"
                            : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 h-3.5 w-3.5 text-emerald-500 border-zinc-700 bg-zinc-900 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                        />
                        <span className="font-sans leading-relaxed select-none">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls & Bypass Option */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleOptOut}
            disabled={inFlight}
            className="w-full sm:w-auto rounded-md border border-zinc-800 bg-zinc-900/80 px-5 py-2.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors disabled:opacity-50"
          >
            Opt out / Start from Baseline (0.1/1.1)
          </button>

          <button
            type="submit"
            disabled={!isComplete || inFlight}
            className={`w-full sm:w-auto rounded-md px-8 py-3 text-xs font-mono font-bold transition-all shadow-lg active:scale-[0.98] ${
              isComplete && !inFlight
                ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
            }`}
          >
            {inFlight
              ? "Evaluating Responses..."
              : isComplete
              ? "Submit Placement Diagnostic →"
              : `Answer All Questions (${answeredCount}/${totalQuestions})`}
          </button>
        </div>
      </form>
    </div>
  );
}

function DiagnosticResultCard({ result }: { result: DiagnosticEvaluateResult }) {
  const isPass = result.passed;
  return (
    <div
      className={`rounded-xl border p-6 space-y-5 ${
        isPass
          ? "border-emerald-500/50 bg-emerald-950/20"
          : "border-zinc-800 bg-zinc-900/60"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            DIAGNOSTIC PLACEMENT VERDICT
          </span>
          <h3 className="text-xl font-bold font-mono text-zinc-100 mt-0.5">
            {isPass ? "Placed Directly into Unit 1.3" : result.route === "opt_out" ? "Standard Baseline Route (Opted Out)" : "Standard Baseline Route (Phase 0.1 / 1.1)"}
          </h3>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {result.score_pct}%
          </div>
          <div className="text-[10px] font-mono text-zinc-500">
            {result.points_earned} / {result.points_possible} points ({result.passing_threshold_pct}% bar)
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
        {isPass
          ? "Congratulations. Your placement score verified mastery over Python syntax, structured validation, and async I/O fundamentals. Units 1.1–1.2 basics are bypassed; your workbench starts directly at Unit 1.3 (APIs & Web Services)."
          : "Your diagnostic placed you on the standard baseline track. You will build the foundation step-by-step starting from orientation and Python data ingestion."}
      </p>

      {/* Question Breakdown List */}
      {result.breakdown && result.breakdown.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
            Question Breakdown & Explanations:
          </h4>
          <div className="space-y-2">
            {result.breakdown.map((b, idx) => (
              <div
                key={b.question_id || idx}
                className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3 text-xs space-y-1.5 font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200">
                    #{idx + 1} · {b.category}
                  </span>
                  <span
                    className={`font-bold text-[10px] px-1.5 py-0.5 rounded uppercase ${
                      b.correct
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {b.correct ? "CORRECT (+1)" : "INCORRECT (0)"}
                  </span>
                </div>
                <p className="text-zinc-400 font-sans text-[11px]">{b.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/map"
          className="inline-block rounded-md bg-emerald-500 px-6 py-2.5 text-xs font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow"
        >
          Proceed to Meridian Curriculum Map &rarr;
        </Link>
      </div>
    </div>
  );
}
