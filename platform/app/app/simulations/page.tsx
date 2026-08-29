import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import { fetchStudentDefenses, listStudentSimulations } from "@/lib/simulation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simulations & Skeptical Reviewer Defenses — Keel Academy",
  description:
    "Rehearse high-stakes prospect discovery calls and defend your architecture against standing technical and business reviewer personas.",
};

const TRACKS = [
  {
    id: "discovery-call",
    slug: "discovery",
    title: "Discovery Call Practice Workbench",
    persona: "Sarah Jenkins",
    role: "VP of Operations, Meridian Mutual",
    phaseTag: "PHASE 11 • PROSPECT SIMULATION",
    description:
      "Rehearse consultative discovery with AI prospect personas. Uncover the real policy verification bottleneck without premature pitching (§11.5.1).",
    href: "/simulations/discovery",
    type: "discovery",
  },
  {
    id: "technical-stakeholder",
    slug: "technical-stakeholder",
    title: "Technical Stakeholder Defense",
    persona: "Marcus Vance",
    role: "Staff AI Architect & Lead Systems Auditor",
    phaseTag: "SECTION 14.3 • TECHNICAL GATE",
    description:
      "Defend your evaluation rigor, golden evaluation datasets, token economics, cascading model routers, and prompt injection defenses against skeptical systems audit.",
    href: "/simulations/technical-stakeholder",
    type: "defense",
  },
  {
    id: "business-owner",
    slug: "business-owner",
    title: "Business Owner Defense",
    persona: "Elena Rostova",
    role: "Managing Director & P&L Owner",
    phaseTag: "SECTION 14.4 • COMMERCIAL GATE",
    description:
      "Defend dollar ROI, adjuster hours saved, human-in-the-loop fallback for $50k claims, and implementation feasibility in plain, zero-jargon business language.",
    href: "/simulations/business-owner",
    type: "defense",
  },
];

export default async function SimulationsDirectoryPage() {
  const user = await getSessionUser();
  const bridged = user ? await ensureStudent(user) : null;
  const studentId = bridged && bridged.state === "ok" ? bridged.data : 0;

  const [defensesRes, allSimsRes] = await Promise.all([
    studentId > 0 ? fetchStudentDefenses(studentId) : null,
    studentId > 0 ? listStudentSimulations(studentId) : null,
  ]);

  const defenses = defensesRes && defensesRes.state === "ok" ? defensesRes.data : null;
  const allSims = allSimsRes && allSimsRes.state === "ok" ? allSimsRes.data : [];

  const discoverySims = allSims.filter((s) => s.persona_id === "discovery-call");
  const hasPassedDiscovery = discoverySims.some((s) => s.passed === true);
  const hasActiveDiscovery = discoverySims.some((s) => s.status === "in_progress");

  const getStatusBadge = (trackId: string) => {
    if (trackId === "discovery-call") {
      if (hasPassedDiscovery) {
        return { label: "CLEARED", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
      }
      if (hasActiveDiscovery || discoverySims.length > 0) {
        return { label: "IN PROGRESS", style: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
      }
      return { label: "NOT STARTED", style: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    }

    if (trackId === "technical-stakeholder") {
      const s = defenses?.technical_stakeholder;
      if (s?.passed) {
        return { label: "CLEARED", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
      }
      if (s?.latest_simulation_id) {
        return { label: "IN PROGRESS", style: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
      }
      return { label: "NOT STARTED", style: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    }

    if (trackId === "business-owner") {
      const s = defenses?.business_owner;
      if (s?.passed) {
        return { label: "CLEARED", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
      }
      if (s?.latest_simulation_id) {
        return { label: "IN PROGRESS", style: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
      }
      return { label: "NOT STARTED", style: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    }

    return { label: "NOT STARTED", style: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SIMULATION ENGINE & DEFENSE CONSOLES
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            Simulations & Skeptical Reviewer Hub
          </h1>
          <p className="text-xs text-zinc-400 font-sans max-w-3xl leading-relaxed">
            Rehearse consultative client discovery and defend your production AI systems against standing technical and business reviewer personas. Passing both defense personas clears the Section 14 graduation credential bar.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Defense Clearance Banner */}
        {defenses && (
          <div className={`rounded-xl border p-6 ${
            defenses.defense_cleared
              ? "border-emerald-500/40 bg-emerald-950/20"
              : "border-zinc-800 bg-zinc-900/40"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${defenses.defense_cleared ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Capstone Credential Defense Status
                  </span>
                </div>
                <h2 className="text-lg font-bold font-mono text-zinc-100">
                  {defenses.defense_cleared
                    ? "Section 14 Defenses Cleared • Credential Unlocked"
                    : "Standing Skeptical Reviewer Defenses Required"}
                </h2>
                <p className="text-xs text-zinc-400 font-sans max-w-2xl">
                  {defenses.defense_cleared
                    ? "You have successfully passed both technical and business defense auditions. Verified defense verdicts are permanently attached to your graduation credential."
                    : "Students rehearse against Marcus Vance and Elena Rostova from Phase 7 onward. Both defenses must be cleared before the final capstone credential issues."}
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-zinc-400 text-[10px]">TECHNICAL AUDIT:</span>
                  <span className={defenses.technical_stakeholder.passed ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                    {defenses.technical_stakeholder.passed ? "CLEARED" : "PENDING"}
                  </span>
                </div>
                <div className="h-8 w-px bg-zinc-800 mx-1" />
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-zinc-400 text-[10px]">BUSINESS AUDIT:</span>
                  <span className={defenses.business_owner.passed ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                    {defenses.business_owner.passed ? "CLEARED" : "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 Simulation Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRACKS.map((track) => {
            const status = getStatusBadge(track.id);
            return (
              <div
                key={track.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6 hover:border-zinc-700 transition"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold tracking-wider">
                      {track.phaseTag}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${status.style}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-mono text-zinc-100">
                      {track.title}
                    </h3>
                    <div className="text-xs font-mono text-zinc-300 font-semibold">
                      {track.persona}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500">
                      {track.role}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80">
                  <Link
                    href={track.href}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 font-mono text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <span>Enter Console</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

