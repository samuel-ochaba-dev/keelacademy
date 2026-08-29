"use client";

import { useState } from "react";
import Link from "next/link";
import { type SimulationSession, type SimulationTurn } from "@/lib/simulation";

interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  tag: string;
  description: string;
  badge: string;
  scorecardTitle: string;
}

const PERSONA_CONFIGS: Record<string, PersonaConfig> = {
  "discovery-call": {
    id: "discovery-call",
    name: "Sarah Jenkins",
    role: "VP of Operations, Meridian Mutual",
    tag: "Phase 11 • Business Discovery Call",
    description:
      "Conduct a 5–10 turn discovery call to uncover Meridian's true operational bottleneck. Probe metrics and compliance risks, avoid premature technical pitching, and synthesize an accurate summary.",
    badge: "PROSPECT SIMULATION",
    scorecardTitle: "Discovery Checklist (§11.5.1)",
  },
  "technical-stakeholder": {
    id: "technical-stakeholder",
    name: "Marcus Vance",
    role: "Staff AI Architect & Lead Systems Auditor",
    tag: "Section 14 • Technical Defense",
    description:
      "Defend your claims triage architecture, golden evaluation datasets, token budgets, cascading model routers, and prompt injection mitigations against rigorous engineering scrutiny.",
    badge: "TECHNICAL DEFENSE",
    scorecardTitle: "Technical Architecture Defense Criteria (Section 14.3)",
  },
  "business-owner": {
    id: "business-owner",
    name: "Elena Rostova",
    role: "Managing Director & P&L Owner",
    tag: "Section 14 • Business Owner Defense",
    description:
      "Defend the financial ROI, adjuster hours eliminated, human-in-the-loop fallback protocol for $50k claims, and implementation feasibility in plain, zero-jargon business language.",
    badge: "BUSINESS DEFENSE",
    scorecardTitle: "Business Value & Risk Defense Criteria (Section 14.4)",
  },
};

interface SimulationWorkbenchProps {
  initialSession: SimulationSession | null;
  studentId: number;
  personaId?: string;
}

export function SimulationWorkbench({
  initialSession,
  studentId,
  personaId = "discovery-call",
}: SimulationWorkbenchProps) {
  const persona = PERSONA_CONFIGS[personaId] || {
    id: personaId,
    name: personaId,
    role: "Simulation Counterparty",
    tag: "Simulation Track",
    description: "Multi-turn simulation dialogue evaluated against curriculum rubrics.",
    badge: "SIMULATION",
    scorecardTitle: "Defense Scorecard",
  };

  const [session, setSession] = useState<SimulationSession | null>(initialSession);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [concluding, setConcluding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNewCall = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona_id: persona.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to start simulation");
      }
      setSession(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStarting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !inputMessage.trim() || loading || session.status !== "in_progress") {
      return;
    }

    const currentMsg = inputMessage.trim();
    setInputMessage("");
    setLoading(true);
    setError(null);

    // Optimistic student turn
    const optTurns: SimulationTurn[] = [
      ...session.turns,
      { role: "student", content: currentMsg, created_at: new Date().toISOString() },
    ];
    setSession({ ...session, turns: optTurns });

    try {
      const res = await fetch("/api/simulation/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulation_id: session.id,
          message: currentMsg,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send turn");
      }
      setSession({
        ...session,
        turns: data.turns,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConclude = async () => {
    if (!session || concluding || session.status === "graded") return;
    setConcluding(true);
    setError(null);

    try {
      const res = await fetch("/api/simulation/conclude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulation_id: session.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to conclude and score defense");
      }
      setSession(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConcluding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Simulation Brief & Guidance Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {persona.badge} • MERIDIAN MUTUAL
              </span>
            </div>
            <h2 className="text-xl font-bold font-mono text-zinc-100">
              {persona.name}
            </h2>
            <p className="text-xs text-zinc-300 font-mono">
              {persona.role}
            </p>
            <p className="text-xs text-zinc-400 font-sans max-w-2xl pt-1">
              {persona.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(!session || session.status === "graded") && (
              <button
                onClick={startNewCall}
                disabled={starting}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 font-mono text-xs font-semibold text-white shadow-lg transition"
              >
                {starting ? "Starting Session..." : session ? "Start New Rep" : `Begin ${persona.name.split(" ")[0]} Session`}
              </button>
            )}
            {session && session.status === "in_progress" && (
              <button
                onClick={handleConclude}
                disabled={concluding || loading || session.turns.filter((t) => t.role === "student").length === 0}
                className="rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 px-4 py-2.5 font-mono text-xs font-semibold text-white shadow-lg transition"
              >
                {concluding ? "Evaluating Defense..." : "Conclude & Score Verdict"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-xs font-mono text-red-300">
          Error: {error}
        </div>
      )}

      {session ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Call Dialogue Stream */}
          <div className={`space-y-4 ${session.verdict ? "lg:col-span-7" : "lg:col-span-12"}`}>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col h-[580px]">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-medium text-zinc-300">
                    Live Dialogue / Audio Stream
                  </span>
                </div>
                <span className="font-mono text-[11px] text-zinc-500">
                  {session.turns.length} turns exchanged
                </span>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-sans text-xs">
                {session.turns.map((turn, i) => {
                  const isPersona = turn.role === "persona";
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isPersona ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="font-mono text-[10px] text-zinc-500 font-semibold">
                          {isPersona ? `${persona.name} (${persona.role.split(",")[0]})` : "You (Lead AI Architect)"}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                          isPersona
                            ? "bg-zinc-800/90 text-zinc-100 border border-zinc-700/50 rounded-tl-sm"
                            : "bg-emerald-950/60 text-emerald-100 border border-emerald-500/30 rounded-tr-sm"
                        }`}
                      >
                        {turn.content}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex flex-col items-start">
                    <span className="font-mono text-[10px] text-zinc-500 mb-1 px-1">
                      {persona.name} is responding...
                    </span>
                    <div className="bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 py-2.5 inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              {session.status === "in_progress" ? (
                <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-zinc-800/80 flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Respond to ${persona.name.split(" ")[0]} with grounded facts, metrics, and risk mitigations...`}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 font-mono text-xs font-semibold text-white transition"
                  >
                    Send
                  </button>
                </form>
              ) : (
                <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center font-mono text-xs text-zinc-400">
                  This defense session is concluded and graded. Start a new rep to rehearse again.
                </div>
              )}
            </div>
          </div>

          {/* Scored Critique Card */}
          {session.verdict && (
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span className="font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Evaluation Verdict
                    </span>
                    <h3 className="text-lg font-bold font-mono text-zinc-100">
                      {persona.badge} Verdict
                    </h3>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-full font-mono text-xs font-bold border ${
                      session.passed
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {session.score_pct}% • {session.passed ? "DEFENSE CLEARED" : "DEFENSE FAILED"}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Executive Verdict Summary
                  </h4>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/80">
                    {session.verdict.summary}
                  </p>
                </div>

                {/* Rubric Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    {persona.scorecardTitle}
                  </h4>
                  <div className="space-y-3">
                    {session.verdict.criteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-zinc-200">
                            {crit.id.replace(/-/g, " ")}
                          </span>
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              crit.passed ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {crit.score_pct}%
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          {crit.feedback}
                        </p>
                        {crit.evidence && (
                          <div className="border-l-2 border-emerald-500/40 pl-2.5 py-0.5 text-[11px] font-mono text-zinc-400 italic bg-zinc-900/40">
                            &ldquo;{crit.evidence}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 font-mono font-bold">
            🛡️
          </div>
          <h3 className="font-mono text-lg font-bold text-zinc-200">
            No Active Defense Session
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
            Ready to defend your work against {persona.name}? Click below to start an interactive multi-turn defense session evaluated against curriculum rubrics.
          </p>
          <button
            onClick={startNewCall}
            disabled={starting}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-lg transition inline-block"
          >
            {starting ? "Starting Defense..." : `Begin ${persona.name.split(" ")[0]} Defense Rep`}
          </button>
        </div>
      )}
    </div>
  );
}

