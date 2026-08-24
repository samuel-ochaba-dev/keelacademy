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
    label: "On hostile input",
    a: "Silently wrong or an unhandled JSON error.",
    b: "Logged error with the record ID and the exact validation failure.",
  },
  {
    label: "Auditable evidence",
    a: "None. Hope and vibes.",
    b: "Quoted log lines and a schema validation trace attached to the verdict.",
  },
  {
    label: "What you learned",
    a: "How to copy a brittle demo.",
    b: "How to engineer deterministic systems on non-deterministic models.",
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
    }, 650);
  };

  const code = a ? CODE_A : CODE_B;

  return (
    <div className="panel overflow-hidden bg-raised">
      {/* Terminal chrome */}
      <div className="flex items-center justify-between gap-4 border-b border-line bg-inset px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-fail/60" />
            <span className="size-2.5 rounded-full bg-warn/60" />
            <span className="size-2.5 rounded-full bg-pass/60" />
          </span>
          <span className="hidden font-mono text-xs text-ink-3 sm:inline">
            keel-runner / sandbox / unit-3.2.1
          </span>
        </div>
        <span className="font-mono text-[11px] text-ink-3">PYTHON 3.12</span>
      </div>

      {/* Approach tabs */}
      <div
        className="flex flex-wrap gap-2 border-b border-line px-5 py-3.5"
        role="tablist"
        aria-label="Extraction approach"
      >
        <button
          type="button"
          role="tab"
          aria-selected={a}
          onClick={() => setTab("a")}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
            a
              ? "border-fail/40 bg-fail/10 text-fail"
              : "border-line text-ink-3 hover:border-line-strong hover:text-ink-2"
          }`}
        >
          <IconXCircle size={15} />
          The tutorial way
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!a}
          onClick={() => setTab("b")}
          className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
            !a
              ? "border-pass/40 bg-pass/10 text-pass"
              : "border-line text-ink-3 hover:border-line-strong hover:text-ink-2"
          }`}
        >
          <IconCheckCircle size={15} />
          The engineered way
        </button>
      </div>

      {/* Code */}
      <div className="border-b border-line">
        <div className="flex items-center justify-between px-5 pt-3.5">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-3">
            <IconCode size={14} />
            {a ? "naive_extractor.py" : "extract_claims.py"}
          </span>
        </div>
        <pre className="code-block rounded-none border-0 px-5 py-4">
          <code>
            {code.split("\n").map((line, i) => (
              <span key={i} className="grid grid-cols-[3ch_1fr] gap-4">
                <span className="text-right text-ink-3/50 select-none">{i + 1}</span>
                <span>{highlightLine(line) || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning}
          className="btn-ghost px-3.5 py-2 text-[13px]"
        >
          <IconPlay size={13} />
          {isRunning ? "Executing in sandbox..." : "Run against 20 messy claim notes"}
        </button>
        <span className="font-mono text-[11px] text-ink-3">
          {a
            ? "8 checks / expected failure on adversarial notes"
            : "8 checks / schema enforcement / full trace"}
        </span>
      </div>

      {/* Result strip */}
      {showResult && (
        <div
          className={`flex items-start gap-4 border-t px-5 py-5 ${
            a ? "border-fail/30 bg-fail/5" : "border-pass/30 bg-pass/5"
          }`}
        >
          {a ? (
            <IconAlertTriangle size={22} className="mt-0.5 shrink-0 text-fail" />
          ) : (
            <IconShieldCheck size={22} className="mt-0.5 shrink-0 text-pass" />
          )}
          <div>
            <p className={`font-mono text-sm font-medium ${a ? "text-fail" : "text-pass"}`}>
              {a
                ? "17 of 20 parsed / silent failures detected"
                : "20 of 20 accounted for / 100% schema validated"}
            </p>
            <p className="mt-1.5 max-w-[72ch] text-sm leading-relaxed text-ink-2">
              {a
                ? "Three responses came back with markdown fences, unstructured prose, and an apology. Nothing was logged. The system dropped customer records silently."
                : "All 20 outputs validated strictly against ClaimExtraction. The two edge-case failures are logged with exact record IDs and validation errors, which satisfies rubric criterion 1."}
            </p>
          </div>
        </div>
      )}

      {/* Comparison */}
      <dl className="divide-y divide-line border-t border-line">
        {COMPARISON.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr_1fr] sm:gap-4"
          >
            <dt className="font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase">
              {row.label}
            </dt>
            <dd className={`text-[13px] leading-relaxed ${a ? "text-fail/90" : "text-ink-3"}`}>
              {a ? row.a : row.b}
            </dd>
            <dd className={`text-[13px] leading-relaxed ${a ? "text-ink-3" : "text-pass/90"}`}>
              {a ? row.b : row.a}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
