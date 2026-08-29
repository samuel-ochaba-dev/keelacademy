import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import { listStudentSimulations, getSimulation, type SimulationSession } from "@/lib/simulation";
import { SimulationWorkbench } from "@/components/simulation/simulation-workbench";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discovery-Call Simulation — Keel Academy",
  description: "Rehearse high-stakes prospect discovery calls with scored rubric feedback (§11.5.1).",
  robots: { index: false },
};

export default async function DiscoverySimulationPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in?next=/simulations/discovery");
  }

  const bridged = await ensureStudent(user);
  const studentId = bridged.state === "ok" ? bridged.data : 0;

  let initialSession: SimulationSession | null = null;
  if (studentId > 0) {
    const listRes = await listStudentSimulations(studentId);
    if (listRes.state === "ok" && listRes.data.length > 0) {
      const latestSummary = listRes.data[0];
      const detailRes = await getSimulation(latestSummary.id, studentId);
      if (detailRes.state === "ok") {
        initialSession = detailRes.data;
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PHASE 11 • BUSINESS SIMULATION ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            Discovery-Call Practice Workbench
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Rehearse consultative discovery with AI prospect personas. Score your reps against the curriculum&apos;s §11.5.1 checklist before booking live client calls.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <SimulationWorkbench
          initialSession={initialSession}
          studentId={studentId}
        />
      </main>
    </div>
  );
}
