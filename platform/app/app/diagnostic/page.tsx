import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import { loadPlacementDiagnostic } from "@/lib/content";
import { fetchDiagnosticAttempts, type DiagnosticAttempt } from "@/lib/practice";
import { DiagnosticWorkbench } from "@/components/diagnostic-workbench";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Phase 1 Foundations Placement Diagnostic — Keel Academy",
  description: "20-minute adaptive foundations check to determine initial placement and unit skips.",
  robots: { index: false },
};

export default async function DiagnosticPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in?next=/diagnostic");
  }

  const bridged = await ensureStudent(user);
  const studentId = bridged.state === "ok" ? bridged.data : 0;

  const diagnostic = loadPlacementDiagnostic("placement-phase-1");
  if (!diagnostic) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-xl mx-auto rounded-lg border border-red-500/30 bg-red-950/20 p-6 text-center space-y-3">
          <h1 className="font-mono text-lg font-bold text-red-300">Diagnostic Specification Unavailable</h1>
          <p className="text-xs text-zinc-400 font-sans">
            Unable to load placement diagnostic specification from content repository.
          </p>
          <Link href="/map" className="inline-block text-xs font-mono text-emerald-400 underline">
            Proceed to Curriculum Map
          </Link>
        </div>
      </div>
    );
  }

  let initialAttempts: DiagnosticAttempt[] = [];
  if (studentId > 0) {
    const attemptsResult = await fetchDiagnosticAttempts(studentId);
    if (attemptsResult.state === "ok") {
      initialAttempts = attemptsResult.data.attempts;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DAY-ZERO ADAPTIVE GATE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            Foundations Placement Diagnostic
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Establish your starting point on the Meridian architecture: skip to Unit 1.3 or start at baseline.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <DiagnosticWorkbench
          diagnostic={diagnostic}
          studentId={studentId}
          initialAttempts={initialAttempts}
        />
      </main>
    </div>
  );
}
