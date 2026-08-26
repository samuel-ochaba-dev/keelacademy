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
import {
  IconArrowRight,
  IconAward,
  IconCheck,
  IconCpu,
  IconLock,
  IconUnlock,
  IconZap,
  IconFileText,
  IconAlertTriangle,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meridian Progress Map",
  description:
    "The growing Meridian Mutual claims pipeline. Track your progress across 13 phases, gates, and automated grading verdicts.",
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
      <div className="shell max-w-5xl py-12">
        <div className="panel p-8 text-center">
          <IconAlertTriangle size={32} className="mx-auto text-warn" />
          <h1 className="mt-4 text-xl font-semibold text-ink">Enrollment service paused</h1>
          <p className="mt-2 text-sm text-ink-2">
            Your signed-in session is active, but the grading profile service is temporarily
            unreachable. Please refresh in a moment to reload the Meridian map.
          </p>
          <Link href="/me" className="btn-ghost mt-6 inline-flex">
            Return to dashboard
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
    <div className="space-y-0">
      {/* Cockpit header */}
      <header className="border-b border-line bg-canvas pt-10 pb-8">
        <div className="shell max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded border border-line-strong bg-raised text-accent">
                  <IconCpu size={14} />
                </span>
                <p className="font-mono text-[10px] tracking-wider text-accent uppercase font-semibold">
                  ACTIVE PIPELINE ARCHITECTURE · MERIDIAN MUTUAL
                </p>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                The Meridian Interactive System Map
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-2">
                Every phase and module in the 13-phase claims triage architecture. Each card shows where your code plugs into the running Meridian engine, joined with live sandbox telemetry, gate barriers, and completion rebates.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 font-mono text-xs">
              <span className="rounded border border-accent/30 bg-accent-soft px-2.5 py-1 text-accent font-semibold">
                STUDENT #{studentId}
              </span>
              <Link href="/me" className="link-arrow text-xs">
                <span>Open Cockpit</span>
                <IconArrowRight size={11} />
              </Link>
            </div>
          </div>

          {checkout ? (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded border border-fail/40 bg-fail-soft p-4"
            >
              <IconAlertTriangle size={15} className="mt-0.5 shrink-0 text-fail" />
              <p className="text-xs leading-relaxed text-ink-2">
                <span className="font-semibold text-fail font-mono">CHECKOUT ERROR:</span>{" "}
                {CHECKOUT_ERRORS[checkout] ?? "Checkout could not start. Nothing was charged."}
              </p>
            </div>
          ) : null}

          {/* Metrics Strip */}
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            <MetricCard
              label="Phase tracks"
              value={`${mapState.stats.unlockedPhases} / ${mapState.stats.totalPhases}`}
              detail={`${mapState.stats.unlockedPhases} tracks unlocked`}
              icon={<IconCpu size={14} />}
            />
            <MetricCard
              label="Live units"
              value={`${mapState.stats.passedUnits} / ${mapState.stats.authoredUnits}`}
              detail={
                mapState.stats.passedUnits > 0
                  ? `${mapState.stats.passedUnits} verified passing`
                  : "Unit 3.2.1 live"
              }
              icon={<IconFileText size={14} />}
            />
            <MetricCard
              label="Gates cleared"
              value={`${mapState.stats.clearedGates} / ${mapState.stats.totalGates}`}
              detail={
                mapState.stats.clearedGates === 0
                  ? "Phase 5 & Capstone"
                  : `${mapState.stats.clearedGates} gate cleared`
              }
              icon={<IconUnlock size={14} />}
            />
            <MetricCard
              label="Rebates earned"
              value={formatPrice(mapState.stats.earnedRebatesCents, "usd")}
              detail={
                mapState.stats.earnedRebatesCents > 0
                  ? "Credited to payment method"
                  : "15% per gate pass"
              }
              icon={<IconAward size={14} />}
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
              icon={<IconZap size={14} />}
            />
          </div>

          {/* Phase Jump Rail */}
          <nav
            aria-label="Jump to phase"
            className="mt-6 flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {mapState.phases.map((p) => {
              const isCleared = p.gateCleared !== null;
              const isLocked = !p.isTrackUnlocked;
              return (
                <a
                  key={p.phase.id}
                  href={`#${p.phase.id}`}
                  className={`shrink-0 rounded border px-2.5 py-0.5 font-mono text-xs transition-colors ${
                    isCleared
                      ? "border-pass/40 bg-pass-soft text-pass"
                      : isLocked
                        ? "border-line bg-inset text-ink-4 hover:border-line-strong hover:text-ink-2"
                        : "border-line-strong bg-raised text-ink-2 hover:border-accent hover:text-accent"
                  }`}
                >
                  P{p.phase.phase}
                </a>
              );
            })}
            <a
              href="#capstone-bar"
              className="shrink-0 rounded border border-amber/40 bg-amber-soft px-2.5 py-0.5 font-mono text-xs text-amber transition-colors hover:bg-amber/20"
            >
              SECTION 14 SPEC
            </a>
          </nav>
        </div>
      </header>

      <div className="shell max-w-6xl py-10 space-y-10">
      {/* Meridian Pipeline Architecture Overview */}
      <section>
        <div className="rounded-lg border border-line bg-raised p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <h2 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
                MERIDIAN CLAIMS TRIAGE ARCHITECTURE PIPELINE
              </h2>
              <p className="text-xs text-ink-3">
                How all thirteen phases connect into one production-grade automated pipeline.
              </p>
            </div>
            <span className="rounded border border-accent/40 bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent font-semibold">
              ANCHOR CORPUS: MERIDIAN MUTUAL
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 font-mono">
            <PipelineTrack
              title="1. Intake & Foundation"
              phases="PHASES 00 TO 01"
              role="Docker runtime, pytest harnesses, async HTTP intake endpoint."
              status="unlocked"
            />
            <PipelineTrack
              title="2. Extraction & Grounding"
              phases="PHASES 02 TO 04"
              role="Model physics, strict Pydantic extraction (Unit 3.2.1), and RAG policy search."
              status="active"
            />
            <PipelineTrack
              title="3. Multi-Tool Agents"
              phases="PHASES 05 TO 06"
              role="ReAct triage routing agent, stop conditions, and LoRA domain adaptation."
              status={mapState.stats.clearedGates > 0 ? "unlocked" : "gated"}
              gateBadge="15% Rebate Gate"
            />
            <PipelineTrack
              title="4. Eval, Ops & Capstone"
              phases="PHASES 07 TO 12"
              role="Calibrated judge CI, dynamic cost router, audit spine, and production deployment."
              status={mapState.stats.clearedGates > 0 ? "unlocked" : "locked"}
              gateBadge="15% Rebate Gate"
            />
          </div>
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
      <section id="capstone-bar" className="rounded-lg border border-line bg-raised p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <span className="grid size-9 place-items-center rounded border border-amber/40 bg-amber-soft text-amber">
            <IconAward size={18} />
          </span>
          <div>
            <h2 className="font-mono text-sm font-semibold text-ink uppercase tracking-wider">
              SECTION 14 GRADUATION SPECIFICATION
            </h2>
            <p className="text-xs text-ink-3">
              Delivery-Ready credential verified by five automated and simulation checks.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="flex flex-col justify-between rounded border border-accent/30 bg-accent-soft p-4 space-y-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-accent uppercase">
              IMMUTABLE CREDENTIAL LEDGER
            </span>
            <p className="text-[11px] leading-relaxed text-ink-2">
              Clearing all five checks binds your public cryptographic profile with permanent git commit hashes and judge verdicts.
            </p>
            <Link href="/submit" className="link-arrow text-xs inline-flex pt-1">
              <span>Review submission protocol</span>
              <IconArrowRight size={11} />
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
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded border border-line bg-raised p-3.5 space-y-1">
      <div className="flex items-center justify-between text-ink-4">
        <span className="font-mono text-[9px] uppercase tracking-wider">{label}</span>
        <span className="text-accent">{icon}</span>
      </div>
      <p className="font-mono text-lg font-semibold text-ink tabular-nums">{value}</p>
      <p className="truncate font-mono text-[10px] text-ink-3">{detail}</p>
    </div>
  );
}

function PipelineTrack({
  title,
  phases,
  role,
  status,
  gateBadge,
}: {
  title: string;
  phases: string;
  role: string;
  status: "unlocked" | "active" | "gated" | "locked";
  gateBadge?: string;
}) {
  return (
    <div
      className={`rounded border p-3.5 transition-colors space-y-1.5 ${
        status === "active"
          ? "border-accent/50 bg-accent-soft/30"
          : status === "unlocked"
            ? "border-line-strong bg-raised"
            : "border-line bg-inset opacity-80"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono text-xs font-semibold text-ink">{title}</span>
        {gateBadge ? <span className="rounded border border-amber/40 bg-amber-soft px-1.5 py-0.2 font-mono text-[9px] text-amber">{gateBadge}</span> : null}
      </div>
      <p className="font-mono text-[10px] text-accent font-semibold">{phases}</p>
      <p className="text-[11px] leading-relaxed text-ink-3 font-sans">{role}</p>
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
    <section id={p.id} className="scroll-mt-20">
      <div className="rounded-lg border border-line bg-raised overflow-hidden">
        {/* Phase Header */}
        <div className="border-b border-line bg-inset p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-6 place-items-center rounded border border-line-strong bg-raised font-mono text-xs font-semibold text-accent">
                  P{p.phase}
                </span>
                <h2 className="text-base font-semibold tracking-tight text-ink">{p.title}</h2>
                <span className="font-mono text-xs text-ink-3">~{p.est_hours} HOURS</span>
                {p.badge ? <span className="rounded border border-accent/30 bg-accent-soft px-1.5 py-0.2 font-mono text-[10px] text-accent font-semibold">{p.badge}</span> : null}
              </div>
              <p className="text-xs text-ink-2">
                <span className="font-mono text-ink-4 uppercase">Role:</span> {p.meridian_role}
              </p>
            </div>

            <div>
              {phase.gateCleared ? (
                <span className="rounded border border-pass/30 bg-pass-soft px-2 py-0.5 font-mono text-[10px] text-pass font-semibold inline-flex items-center gap-1">
                  <IconCheck size={11} />
                  GATE CLEARED
                </span>
              ) : isLocked ? (
                <span className="rounded border border-line bg-inset px-2 py-0.5 font-mono text-[10px] text-ink-4 font-semibold inline-flex items-center gap-1">
                  <IconLock size={10} />
                  TRACK LOCKED
                </span>
              ) : (
                <span className="rounded border border-accent/30 bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent font-semibold">
                  TRACK ACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 grid gap-3 text-xs text-ink-3 md:grid-cols-2">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-4">Why it exists:</span>
              <p className="mt-0.5 leading-relaxed text-ink-2 text-[11px]">{p.why}</p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-4">Concrete outcome:</span>
              <p className="mt-0.5 leading-relaxed text-ink-2 text-[11px]">{p.outcome}</p>
            </div>
          </div>

          {phase.lockReason ? (
            <div className="mt-3 flex items-start gap-2 rounded border border-line bg-raised px-3 py-2 text-[11px] text-ink-3 font-mono">
              <IconLock size={12} className="mt-0.5 shrink-0 text-ink-4" />
              <p>{phase.lockReason}</p>
            </div>
          ) : null}
        </div>

        {/* Phase Gate Callout (if gate sits in this phase) */}
        {phase.gateRule ? (
          <div className="border-b border-line bg-raised-2/40 px-5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid size-7 place-items-center rounded border ${
                    phase.gateCleared
                      ? "border-pass/40 bg-pass-soft text-pass"
                      : "border-line bg-inset text-accent"
                  }`}
                >
                  {phase.gateCleared ? <IconCheck size={14} /> : <IconLock size={13} />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-xs font-semibold text-ink">{phase.gateRule.title}</h3>
                    {phase.gateRule.rebate ? (
                      <span className="rounded border border-amber/40 bg-amber-soft px-1.5 py-0.2 font-mono text-[9px] text-amber font-semibold">15% REBATE</span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-ink-3">
                    {phase.gateCleared
                      ? `Cleared on ${formatUtc(phase.gateCleared.passed_at)}.`
                      : phase.gateRule.summary}
                  </p>
                </div>
              </div>

              <div>
                <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                  phase.gateCleared ? "border border-pass/30 bg-pass-soft text-pass" : "border border-line bg-inset text-ink-4"
                }`}>
                  {phase.gateCleared ? "CLEARED" : "LOCKED"}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
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
    <div
      className={`flex flex-col justify-between rounded border p-4 transition-colors space-y-3 ${
        card.status === "passed"
          ? "border-pass/40 bg-pass-soft/20"
          : card.status === "failed"
            ? "border-fail/40 bg-fail-soft/20"
            : card.status === "grading" || card.status === "queued"
              ? "border-accent/40 bg-accent-soft/20"
              : isEnrolled
                ? "border-line-strong bg-raised hover:border-accent/40"
                : isAuthored
                  ? "border-line bg-raised hover:border-line-strong"
                  : "border-line/60 bg-inset/40"
      }`}
    >
      <div className="space-y-1.5">
        {/* Top row: id and status chip */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-accent">
            UNIT {m.id}
          </span>
          <StatusChip status={card.status} />
        </div>

        {/* Title */}
        <h4 className="text-xs font-semibold tracking-tight text-ink">
          {m.title}
        </h4>

        {/* Description */}
        <p className="text-[11px] leading-relaxed text-ink-3">
          {m.description}
        </p>

        {/* Lock or unauthored note */}
        {card.lockReason && !isAuthored ? (
          <p className="text-[10px] leading-relaxed text-ink-4 font-mono">
            <IconLock size={10} className="mr-1 inline align-[-1px]" />
            {card.lockReason}
          </p>
        ) : null}

        {/* Submission verdict snippet */}
        {sub ? (
          <div className="rounded border border-line bg-inset p-2 font-mono text-[10px] space-y-1">
            <div className="flex items-center justify-between text-ink-3">
              <Link href={`/submissions/${sub.id}`} className="text-accent hover:underline">
                SHA #{sub.id}
              </Link>
              <span className={sub.overall === "pass" ? "text-pass font-semibold" : sub.overall === "fail" ? "text-fail font-semibold" : "text-accent"}>
                {sub.overall?.toUpperCase() ?? sub.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[9px] text-ink-4 truncate">
              {formatUtc(sub.created_at)}
            </p>
          </div>
        ) : null}
      </div>

      {/* Card action footer */}
      <div className="pt-2 border-t border-line/60">
        {isAuthored ? (
          isEnrolled ? (
            <Link
              href={`/units/${m.id}`}
              className="btn-primary w-full py-1.5 text-xs text-center justify-center font-mono"
            >
              <span>OPEN BENCH</span>
              <IconArrowRight size={11} />
            </Link>
          ) : (
            <form action={startCheckoutAction} className="w-full">
              <input type="hidden" name="unit_id" value={m.id} />
              <button
                type="submit"
                className="btn-ghost w-full py-1.5 text-xs text-center justify-center font-mono"
              >
                {price?.state === "ok"
                  ? `ENROLL (${formatPrice(price.data.amount_cents, price.data.currency)})`
                  : `ENROLL UNIT ${m.id}`}
              </button>
            </form>
          )
        ) : (
          <div className="flex items-center justify-between font-mono text-[10px] text-ink-4">
            <span>SPEC FINAL</span>
            <span>PLANNED</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  switch (status) {
    case "passed":
      return <span className="rounded border border-pass/30 bg-pass-soft px-1.5 py-0.2 font-mono text-[9px] text-pass font-semibold">PASS</span>;
    case "failed":
      return <span className="rounded border border-fail/30 bg-fail-soft px-1.5 py-0.2 font-mono text-[9px] text-fail font-semibold">RETRY</span>;
    case "grading":
      return <span className="rounded border border-accent/30 bg-accent-soft px-1.5 py-0.2 font-mono text-[9px] text-accent font-semibold">GRADING</span>;
    case "queued":
      return <span className="rounded border border-warn/30 bg-warn-soft px-1.5 py-0.2 font-mono text-[9px] text-warn font-semibold">QUEUED</span>;
    case "enrolled":
      return <span className="rounded border border-pass/30 bg-pass-soft px-1.5 py-0.2 font-mono text-[9px] text-pass font-semibold">ENROLLED</span>;
    case "available":
      return <span className="rounded border border-line bg-inset px-1.5 py-0.2 font-mono text-[9px] text-ink-3">OPEN</span>;
    case "locked":
      return (
        <span className="rounded border border-line bg-inset px-1.5 py-0.2 font-mono text-[9px] text-ink-4 inline-flex items-center gap-1">
          <IconLock size={9} />
          LOCKED
        </span>
      );
    case "not_authored_unlocked":
      return <span className="rounded border border-accent/30 bg-accent-soft px-1.5 py-0.2 font-mono text-[9px] text-accent">UNLOCKED</span>;
    case "not_authored_locked":
      return (
        <span className="rounded border border-line bg-inset px-1.5 py-0.2 font-mono text-[9px] text-ink-4 inline-flex items-center gap-1">
          <IconLock size={9} />
          LOCKED
        </span>
      );
    case "not_authored":
    default:
      return <span className="rounded border border-line bg-inset px-1.5 py-0.2 font-mono text-[9px] text-ink-4">PLANNED</span>;
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
    <div className="rounded border border-line bg-raised p-4 space-y-1">
      <div className="flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded bg-inset font-mono text-[10px] font-semibold text-accent">
          {num}
        </span>
        <h3 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-ink-3">{description}</p>
    </div>
  );
}
