import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { startCheckoutAction } from "@/app/auth/actions";
import {
  ensureStudent,
  fetchProfile,
  fetchOwnSubmissions,
  fetchPrice,
  formatPrice,
  type EnrollResult,
} from "@/lib/enroll";
import { fetchStudentGates } from "@/lib/gates";
import { formatUtc } from "@/lib/grading";
import {
  buildMeridianMap,
  type ResolvedPhase,
  type ResolvedModuleCard,
} from "@/lib/map";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meridian Progress Map — Keel Academy",
  description:
    "The 13-phase Meridian Mutual claims pipeline. Track your live progress, cryptographic gate locks, and automated grading verdicts.",
  robots: { index: false },
};

const CHECKOUT_ERRORS: Record<string, string> = {
  unreachable: "The enrollment service is unreachable. Please try again in a few moments.",
  app_not_configured: "The app is missing its enrollment secret (KEEL_ENROLL_SECRET).",
  stripe_not_wired: "Payment processing is not configured on the enrollment server.",
  stripe_unreachable: "Payment service did not answer. No charges were made.",
  stripe_error: "Payment processor rejected the request. Nothing was charged.",
  email_linked_to_other_account:
    "This email is linked to a different account. Sign in with that account to enroll.",
};

type Props = { searchParams: Promise<{ checkout?: string; phase?: string }> };

export default async function MapPage({ searchParams }: Props) {
  const { checkout } = await searchParams;
  const user = await requireSession("/map");
  const bridged = await ensureStudent(user);

  if (bridged.state !== "ok") {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-md mx-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h1 className="text-lg font-mono font-bold text-zinc-100">Enrollment service paused</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your signed-in session is active, but the grading profile service is temporarily
            unreachable. Please refresh in a moment to reload the Meridian map.
          </p>
          <Link
            href="/me"
            className="inline-block text-xs font-mono text-emerald-400 hover:underline"
          >
            &larr; Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const studentId = bridged.data;
  const [profileResult, submissionsResult, gatesLookup] = await Promise.all([
    fetchProfile(studentId),
    fetchOwnSubmissions(studentId),
    fetchStudentGates(studentId),
  ]);

  const profile = profileResult.state === "ok" ? profileResult.data : null;
  const submissions = submissionsResult.state === "ok" ? submissionsResult.data.submissions : [];
  const gates = gatesLookup.state === "ok" ? gatesLookup.data : null;

  const mapState = buildMeridianMap(profile, submissions, gates);

  // Fetch prices for authored units that are not yet enrolled
  const enrolledSet = new Set(profile?.enrollments.map((e) => e.unit_id) ?? []);
  const prices = new Map<string, EnrollResult<{ amount_cents: number; currency: string }>>();
  await Promise.all(
    mapState.phases.flatMap((p) =>
      p.modules
        .filter((m) => m.isAuthored && !enrolledSet.has(m.module.id))
        .map(async (m) => prices.set(m.module.id, await fetchPrice(m.module.id))),
    ),
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Cockpit header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE PIPELINE ARCHITECTURE · MERIDIAN MUTUAL
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
                The Meridian Interactive System Map
              </h1>
              <p className="text-xs text-zinc-400 font-sans max-w-3xl leading-relaxed">
                Every phase and module in the 13-phase claims triage architecture. Each card shows where your code plugs into the running Meridian engine, joined with live sandbox telemetry, gate barriers, and completion rebates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-mono text-zinc-300">
                <span className="text-zinc-500 mr-2">STUDENT:</span>
                <span className="text-emerald-400 font-semibold">#{studentId}</span>
              </div>
              <Link
                href="/me"
                className="rounded-md border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <span>Learner Cockpit</span>
                <span className="text-zinc-400">&rarr;</span>
              </Link>
            </div>
          </div>

          {checkout ? (
            <div
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-950/30 px-4 py-3 text-xs font-mono text-red-200"
            >
              <p>
                <span className="font-bold text-red-400">CHECKOUT ERROR:</span>{" "}
                {CHECKOUT_ERRORS[checkout] ?? "Checkout could not start. Nothing was charged."}
              </p>
            </div>
          ) : null}

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <MetricCard
              label="Phase tracks"
              value={`${mapState.stats.unlockedPhases} / ${mapState.stats.totalPhases}`}
              detail={`${mapState.stats.unlockedPhases} tracks unlocked`}
            />
            <MetricCard
              label="Live units"
              value={`${mapState.stats.passedUnits} / ${mapState.stats.authoredUnits}`}
              detail={
                mapState.stats.passedUnits > 0
                  ? `${mapState.stats.passedUnits} verified passing`
                  : "Unit 3.2.1 live"
              }
            />
            <MetricCard
              label="Gates cleared"
              value={`${mapState.stats.clearedGates} / ${mapState.stats.totalGates}`}
              detail={
                mapState.stats.clearedGates === 0
                  ? "Phase 5 & Capstone"
                  : `${mapState.stats.clearedGates} gate cleared`
              }
            />
            <MetricCard
              label="Rebates earned"
              value={formatPrice(mapState.stats.earnedRebatesCents, "usd")}
              detail={
                mapState.stats.earnedRebatesCents > 0
                  ? "Credited to payment method"
                  : "15% per gate pass"
              }
            />
            <MetricCard
              label="Token budget"
              value={
                mapState.stats.tokensCap > 0
                  ? `${Math.round((mapState.stats.tokensUsed / mapState.stats.tokensCap) * 100)}%`
                  : "Active"
              }
              detail={
                mapState.stats.tokensCap > 0
                  ? `${mapState.stats.tokensUsed.toLocaleString("en-US")} / ${mapState.stats.tokensCap.toLocaleString("en-US")}`
                  : "Active budget"
              }
            />
          </div>

          {/* Phase Jump Rail */}
          <nav
            aria-label="Jump to phase"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-zinc-800/60 text-xs font-mono"
          >
            <span className="text-zinc-500 text-[11px] mr-1">JUMP:</span>
            {mapState.phases.map((p) => {
              return (
                <a
                  key={p.phase.id}
                  href={`#${p.phase.id}`}
                  className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-zinc-400 hover:border-zinc-700 hover:text-emerald-400 hover:bg-zinc-800 transition-colors whitespace-nowrap"
                >
                  P0{p.phase.phase}
                </a>
              );
            })}
            <a
              href="#capstone-bar"
              className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 hover:bg-emerald-500/20 transition-colors whitespace-nowrap font-bold"
            >
              GRADUATION SPEC
            </a>
          </nav>
        </div>
      </header>

      <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 space-y-12 max-w-6xl mx-auto w-full">
        {/* Meridian Pipeline Architecture Overview */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
                Meridian Claims Triage Architecture Pipeline
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                How all thirteen phases connect into one production-grade automated pipeline.
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 self-start sm:self-auto">
              ANCHOR CORPUS: MERIDIAN MUTUAL
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PipelineTrack
              title="1. Intake & Foundation"
              phases="PHASES 00 TO 01"
              role="Docker runtime, pytest harnesses, async HTTP intake endpoint."
            />
            <PipelineTrack
              title="2. Extraction & Grounding"
              phases="PHASES 02 TO 04"
              role="Model physics, strict Pydantic extraction (Unit 3.2.1), and RAG policy search."
            />
            <PipelineTrack
              title="3. Multi-Tool Agents"
              phases="PHASES 05 TO 06"
              role="ReAct triage routing agent, stop conditions, and LoRA domain adaptation."
              gateBadge="$300 Rebate Gate"
            />
            <PipelineTrack
              title="4. Eval, Ops & Capstone"
              phases="PHASES 07 TO 12"
              role="Calibrated judge CI, dynamic cost router, audit spine, and production deployment."
              gateBadge="$300 Rebate Gate"
            />
          </div>
        </section>

        {/* Main Map: 13 Phases */}
        <main className="space-y-8">
          {mapState.phases.map((phase) => (
            <PhaseSection
              key={phase.phase.id}
              phase={phase}
              prices={prices}
            />
          ))}
        </main>

        {/* Section 14 Graduation Bar */}
        <section id="capstone-bar" className="rounded-lg border border-emerald-500/30 bg-zinc-900/50 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 mb-1">
                SECTION 14 SPECIFICATION
              </div>
              <h2 className="text-lg font-mono font-bold text-zinc-100">
                Delivery-Ready Graduation Protocol
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Five immutable verification checks proving production engineering and client capability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <GradCheck
              num="01"
              title="Golden set accuracy"
              description="Verified precision and recall on held-out adversarial claim test cases."
            />
            <GradCheck
              num="02"
              title="Defend-your-work"
              description="Short unscripted questions generated directly from your submitted code."
            />
            <GradCheck
              num="03"
              title="CTO persona defense"
              description="Simulated technical evaluation requiring telemetry, cost caps, and audit logs."
            />
            <GradCheck
              num="04"
              title="CFO persona defense"
              description="Simulated business owner defense on unit economics and scope exclusions."
            />
            <GradCheck
              num="05"
              title="Real-world outreach"
              description="One verified outreach email sent to a real business with a priced SOW."
            />
            <div className="rounded-lg border border-dashed border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2 flex flex-col justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                IMMUTABLE CREDENTIAL LEDGER
              </span>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Clearing all five checks binds your public cryptographic profile with permanent git commit hashes and judge verdicts.
              </p>
              <Link
                href="/submit"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline pt-1"
              >
                Review submission protocol &rarr;
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3 space-y-1">
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">{label}</span>
      <p className="text-sm sm:text-base font-bold font-mono text-zinc-100">{value}</p>
      <p className="text-[11px] text-zinc-400 font-sans truncate">{detail}</p>
    </div>
  );
}

function PipelineTrack({
  title,
  phases,
  role,
  gateBadge,
}: {
  title: string;
  phases: string;
  role: string;
  gateBadge?: string;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-mono font-bold text-zinc-200">{title}</span>
          {gateBadge ? (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {gateBadge}
            </span>
          ) : null}
        </div>
        <p className="text-[10px] font-mono text-emerald-400/90">{phases}</p>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">{role}</p>
      </div>
    </div>
  );
}

function PhaseSection({
  phase,
  prices,
}: {
  phase: ResolvedPhase;
  prices: Map<string, EnrollResult<{ amount_cents: number; currency: string }>>;
}) {
  const p = phase.phase;
  const isLocked = !phase.isTrackUnlocked;

  return (
    <section id={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 space-y-6 scroll-mt-20">
      <div>
        {/* Phase Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400">
                  P0{p.phase}
                </span>
                <h2 className="text-lg font-mono font-bold text-zinc-100">{p.title}</h2>
                <span className="text-xs font-mono text-zinc-500">~{p.est_hours} HOURS</span>
                {p.badge ? (
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                    {p.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-xs font-mono text-zinc-400">
                <span className="text-zinc-500">Meridian Role:</span> {p.meridian_role}
              </p>
            </div>

            <div className="self-start sm:self-auto">
              {phase.gateCleared ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  GATE CLEARED
                </span>
              ) : isLocked ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  TRACK LOCKED
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  TRACK ACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded border border-zinc-800/80 bg-zinc-950/40 p-3 space-y-1">
              <span className="font-mono text-[10px] uppercase text-zinc-500 block">Why it exists:</span>
              <p className="text-zinc-300 font-sans leading-relaxed">{p.why}</p>
            </div>
            <div className="rounded border border-zinc-800/80 bg-zinc-950/40 p-3 space-y-1">
              <span className="font-mono text-[10px] uppercase text-zinc-500 block">Concrete outcome:</span>
              <p className="text-zinc-300 font-sans leading-relaxed">{p.outcome}</p>
            </div>
          </div>

          {phase.lockReason ? (
            <div className="rounded border border-amber-500/30 bg-amber-950/20 p-3 text-xs font-mono text-amber-200">
              <p>{phase.lockReason}</p>
            </div>
          ) : null}
        </div>

        {/* Phase Gate Callout (if gate sits in this phase) */}
        {phase.gateRule ? (
          <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-950/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold text-emerald-400">{phase.gateRule.title}</h3>
                {phase.gateRule.rebate ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    $300 REBATE
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-zinc-300 font-sans">
                {phase.gateCleared
                  ? `Cleared on ${formatUtc(phase.gateCleared.passed_at)}.`
                  : phase.gateRule.summary}
              </p>
            </div>

            <div className="self-start sm:self-auto">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                  phase.gateCleared
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}
              >
                {phase.gateCleared ? "CLEARED" : "LOCKED"}
              </span>
            </div>
          </div>
        ) : null}

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {phase.modules.map((card) => (
            <ModuleCard
              key={card.module.id}
              card={card}
              price={prices.get(card.module.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleCard({
  card,
  price,
}: {
  card: ResolvedModuleCard;
  price: EnrollResult<{ amount_cents: number; currency: string }> | undefined;
}) {
  const m = card.module;
  const isAuthored = card.isAuthored;
  const isEnrolled = card.isEnrolled;
  const sub = card.latestSubmission;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 space-y-3 flex flex-col justify-between hover:border-zinc-700 transition-colors">
      <div className="space-y-2">
        {/* Top row: id and status chip */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-400">
            UNIT {m.id}
          </span>
          <StatusChip status={card.status} />
        </div>

        {/* Title */}
        <h4 className="text-sm font-mono font-bold text-zinc-100 line-clamp-1">
          {m.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
          {m.description}
        </p>

        {/* Lock or unauthored note */}
        {card.lockReason && !isAuthored ? (
          <p className="text-[11px] font-mono text-zinc-500 italic">
            {card.lockReason}
          </p>
        ) : null}

        {/* Submission verdict snippet */}
        {sub ? (
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] font-mono flex items-center justify-between">
            <Link href={`/submissions/${sub.id}`} className="text-emerald-400 hover:underline">
              Record #{sub.id}
            </Link>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                sub.overall === "pass"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {sub.overall ?? sub.status}
            </span>
          </div>
        ) : null}
      </div>

      {/* Card action footer */}
      <div className="pt-3 border-t border-zinc-800/80">
        {isAuthored ? (
          isEnrolled ? (
            <Link
              href={`/units/${m.id}`}
              className="w-full text-center block rounded border border-emerald-500/40 bg-emerald-500/10 py-1.5 text-xs font-mono font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              OPEN WORKBENCH &rarr;
            </Link>
          ) : (
            <form action={startCheckoutAction} className="w-full">
              <input type="hidden" name="unit_id" value={m.id} />
              <button
                type="submit"
                className="w-full rounded border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-mono font-semibold text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700 transition-colors"
              >
                {price?.state === "ok"
                  ? `ENROLL (${formatPrice(price.data.amount_cents, price.data.currency)})`
                  : `ENROLL UNIT ${m.id}`}
              </button>
            </form>
          )
        ) : (
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>SPEC FINAL</span>
            <span>PLANNED IN SEQUENCE</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  switch (status) {
    case "passed":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          PASS
        </span>
      );
    case "failed":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
          RETRY
        </span>
      );
    case "grading":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
          GRADING
        </span>
      );
    case "queued":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
          QUEUED
        </span>
      );
    case "enrolled":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          ENROLLED
        </span>
      );
    case "available":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
          AVAILABLE
        </span>
      );
    case "locked":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">
          LOCKED
        </span>
      );
    case "not_authored_unlocked":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
          UNLOCKED
        </span>
      );
    case "not_authored_locked":
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-900 text-zinc-600 border border-zinc-800">
          LOCKED
        </span>
      );
    case "not_authored":
    default:
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">
          PLANNED
        </span>
      );
  }
}

function GradCheck({
  num,
  title,
  description,
}: {
  num: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
          {num}
        </span>
        <h3 className="text-xs font-mono font-bold text-zinc-200">{title}</h3>
      </div>
      <p className="text-xs text-zinc-400 font-sans leading-relaxed">{description}</p>
    </div>
  );
}

