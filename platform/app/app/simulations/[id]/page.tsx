import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import { getSimulation } from "@/lib/simulation";
import { SimulationWorkbench } from "@/components/simulation/simulation-workbench";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simulation Session — Keel Academy",
  description: "View and continue your simulation dialogue and scored critique (§11.5.1).",
  robots: { index: false },
};

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in");
  }

  const bridged = await ensureStudent(user);
  const studentId = bridged.state === "ok" ? bridged.data : 0;

  const { id: idStr } = await params;
  const simulationId = parseInt(idStr, 10);
  if (isNaN(simulationId) || simulationId <= 0) {
    notFound();
  }

  const res = await getSimulation(simulationId, studentId);
  if (res.state !== "ok") {
    notFound();
  }

  const session = res.data;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SIMULATION SESSION #{session.id} • {session.persona_id}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            Discovery-Call Simulation
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Review your conversation transcript, persona feedback, and rubric evaluation.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <SimulationWorkbench
          initialSession={session}
          studentId={studentId}
        />
      </main>
    </div>
  );
}
