"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  IconCheckCircle,
  IconXCircle,
  IconShieldCheck,
  IconCode,
  IconAlertTriangle,
  IconPlay,
} from "@/components/icons";

const CODE_A = `# The tutorial way (fragile prompt-promise)
import json

prompt = "Extract the claim fields as JSON."
response = call_llm(prompt + claim_note)

# Hope it parses, hope fields match, hope nothing drops
data = json.loads(response)`;

const CODE_B = `# The engineered way (Unit 3.2.1)
from pydantic import BaseModel, Field
from datetime import date

class ClaimExtraction(BaseModel):
    claimant: str
    policy_number: str
    incident_date: date
    claim_type: ClaimType

for record in corpus:            # all 20, even hostile ones
    try:
        out = extract(record)    # schema-constrained
        log_ok(record.id)
    except ExtractionError as err:
        log_failure(record.id)   # logged, never dropped`;

const KEYWORDS = new Set([
  "import",
  "from",
  "class",
  "def",
  "for",
  "in",
  "try",
  "except",
  "as",
  "return",
  "if",
  "else",
  "None",
  "True",
  "False",
]);

/** Minimal Python tokenizer: comments, strings, keywords. Fixed snippets only. */
function highlightLine(line: string): ReactNode {
  const hashIndex = line.indexOf("#");
  const code = hashIndex >= 0 ? line.slice(0, hashIndex) : line;
  const comment = hashIndex >= 0 ? line.slice(hashIndex) : "";

  const parts: ReactNode[] = [];
  const stringSplit = code.split(/("[^"\n]*"|'[^'\n]*')/g);
  stringSplit.forEach((chunk, i) => {
    if (!chunk) return;
    if (/^["']/.test(chunk)) {
      parts.push(
        <span key={`s${i}`} className="tok-string">
          {chunk}
        </span>,
      );
      return;
    }
    chunk.split(/(\b[A-Za-z_][A-Za-z0-9_]*\b)/g).forEach((word, j) => {
      if (!word) return;
      parts.push(
        KEYWORDS.has(word) ? (
          <span key={`k${i}-${j}`} className="tok-key">
            {word}
          </span>
        ) : (
          word
        ),
      );
    });
  });

  if (comment) {
    parts.push(
      <span key="c" className="tok-comment">
        {comment}
      </span>,
    );
  }
  return parts;
}

const COMPARISON = [
  {
    label: "On messy / hostile input",
    a: "Fails silently, drops data, or crashes with an unhandled JSON error.",
    b: "Logs every failure with the record ID and exact error, with zero dropped claims.",
  },
  {
    label: "Feedback & proof",
    a: "None. You hope the prompt keeps working when real users show up.",
    b: "Line-by-line grading with exact quoted evidence from your code.",
  },
  {
    label: "What you walk away with",
    a: "A fragile demo you can't confidently explain in an interview.",
    b: "Production code you understand and can defend in front of a client.",
  },
];

export function HeroInspection() {
  const [tab, setTab] = useState<"a" | "b">("b");
  const [isRunning, setIsRunning] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const a = tab === "a";

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setShowResult(false);
    timer.current = setTimeout(() => {
      setIsRunning(false);
      setShowResult(true);
    }, 550);
  };

  const code = a ? CODE_A : CODE_B;

  return (
    <div className="rounded-lg border border-line bg-raised shadow-xl">
      {/* Flight control header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2 rounded-full bg-line-strong" />
            <span className="size-2 rounded-full bg-line-strong" />
            <span className="size-2 rounded-full bg-line-strong" />
          </span>
          <span className="font-mono text-xs font-medium text-ink-2">
            UNIT 3.2.1 / EXTRACTION_BENCH.PY
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-ink-4">ENVIRONMENT:</span>
          <span className="rounded border border-line bg-raised px-1.5 py-0.5 text-accent">
            CONTAINER_PY312_SANDBOX
          </span>
        </div>
      </div>

      {/* Mode selection strip */}
      <div
        className="grid grid-cols-2 border-b border-line bg-raised-2/50"
        role="tablist"
        aria-label="Extraction approach"
      >
        <button
          type="button"
          role="tab"
          aria-selected={a}
          onClick={() => setTab("a")}
          className={`flex items-center justify-center gap-2 border-b-2 py-3 text-xs font-mono tracking-tight transition-colors ${
            a
              ? "border-fail bg-fail-soft/50 text-fail font-semibold"
              : "border-transparent text-ink-3 hover:text-ink-2"
          }`}
        >
          <IconXCircle size={14} />
          <span>APPROACH A: NAIVE STRING PROMPTING</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!a}
          onClick={() => setTab("b")}
          className={`flex items-center justify-center gap-2 border-b-2 py-3 text-xs font-mono tracking-tight transition-colors ${
            !a
              ? "border-pass bg-pass-soft/50 text-pass font-semibold"
              : "border-transparent text-ink-3 hover:text-ink-2"
          }`}
        >
          <IconCheckCircle size={14} />
          <span>APPROACH B: PYDANTIC SCHEMA ENGINE</span>
        </button>
      </div>

      {/* Code viewer */}
      <div className="border-b border-line bg-inset">
        <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-ink-2">
          <code>
            {code.split("\n").map((line, i) => (
              <span key={i} className="grid grid-cols-[3.5ch_1fr] gap-4">
                <span className="text-right font-mono text-ink-4 select-none">{i + 1}</span>
                <span>{highlightLine(line) || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      {/* Execution telemetry bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-raised px-4 py-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className={a ? "btn-ghost text-xs" : "btn-primary text-xs"}
        >
          <IconPlay size={12} />
          <span>{isRunning ? "Running Sandbox Pipeline..." : "Execute 20-Claim Adversarial Harness"}</span>
        </button>
        <div className="flex items-center gap-4 font-mono text-[11px] text-ink-3">
          <span>CORPUS: 20 RECORDS</span>
          <span className="h-3 w-px bg-line" />
          <span>TIMEOUT: 1200ms</span>
        </div>
      </div>

      {/* Diagnostic verification report */}
      {showResult && (
        <div
          className={`flex items-start gap-4 border-b px-5 py-4 ${
            a ? "border-fail/30 bg-fail-soft" : "border-pass/30 bg-pass-soft"
          }`}
        >
          {a ? (
            <IconAlertTriangle size={18} className="mt-0.5 shrink-0 text-fail" />
          ) : (
            <IconShieldCheck size={18} className="mt-0.5 shrink-0 text-pass" />
          )}
          <div className="space-y-1">
            <p className={`font-mono text-xs font-semibold ${a ? "text-fail" : "text-pass"}`}>
              {a
                ? "FAIL: 3 UNHANDLED EXCEPTIONS / SILENT DATA LOSS DETECTED"
                : "PASS: 20/20 VALIDATED / STRUCTURED LOGS RECORDED / 0 DROPPED"}
            </p>
            <p className="text-xs leading-relaxed text-ink-2">
              {a
                ? "The LLM responded with polite apologies and markdown fences on 3 hostile notes. json.loads crashed; records dropped without retry logs."
                : "All 20 claim payloads validated strictly against ClaimExtraction. Adversarial schemas were intercepted and logged with explicit error codes."}
            </p>
          </div>
        </div>
      )}

      {/* Structured comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-inset font-mono text-[10px] text-ink-4 uppercase">
              <th className="py-2.5 px-4 font-medium">Evaluation Criterion</th>
              <th className="py-2.5 px-4 font-medium text-fail/80">Naive Approach</th>
              <th className="py-2.5 px-4 font-medium text-pass/80">Engineered Standard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {COMPARISON.map((row) => (
              <tr key={row.label} className="transition-colors hover:bg-raised-2/40">
                <td className="py-2.5 px-4 font-mono font-medium text-ink-3">{row.label}</td>
                <td className="py-2.5 px-4 text-ink-3">{row.a}</td>
                <td className="py-2.5 px-4 text-ink font-medium">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
