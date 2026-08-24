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
    <div className="shell max-w-6xl py-10 sm:py-12">
      {/* Cockpit header */}
      <header className="border-b border-line pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg border border-line-strong bg-raised text-accent">
                <IconCpu size={18} />
              </span>
              <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
                Progress Dashboard · Meridian Mutual Pipeline
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              The Meridian Progress Map
            </h1>
            <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-2">
              Every phase and unit in the 13-phase claims triage architecture. Each card shows where
              your code plugs into the running Meridian system, joined with your real grading
              verdicts, gate unlock state, and completion rebates.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="chip-accent">Student #{studentId}</span>
            <Link href="/me" className="link-arrow text-xs">
              Account cockpit & billing
              <IconArrowRight size={11} />
            </Link>
          </div>
        </div>

        {checkout ? (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-fail/40 bg-fail/5 px-5 py-4"
          >
            <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-fail" />
            <p className="text-sm leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">Checkout error:</span>{" "}
              {CHECKOUT_ERRORS[checkout] ?? "Checkout could not start. Nothing was charged."}
            </p>
          </div>
        ) : null}

        {/* Metrics Strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Phase tracks"
            value={`${mapState.stats.unlockedPhases} / ${mapState.stats.totalPhases}`}
            detail={`${mapState.stats.unlockedPhases} tracks unlocked`}
            icon={<IconCpu size={16} />}
          />
          <MetricCard
            label="Live units"
            value={`${mapState.stats.passedUnits} / ${mapState.stats.authoredUnits}`}
            detail={
              mapState.stats.passedUnits > 0
                ? `${mapState.stats.passedUnits} verified passing`
                : "Unit 3.2.1 live"
            }
            icon={<IconFileText size={16} />}
          />
          <MetricCard
            label="Gates cleared"
            value={`${mapState.stats.clearedGates} / ${mapState.stats.totalGates}`}
            detail={
              mapState.stats.clearedGates === 0
                ? "Phase 5 & Capstone gates"
                : `${mapState.stats.clearedGates} gate cleared`
            }
            icon={<IconUnlock size={16} />}
          />
          <MetricCard
            label="Rebates earned"
            value={formatPrice(mapState.stats.earnedRebatesCents, "usd")}
            detail={
              mapState.stats.earnedRebatesCents > 0
                ? "Credited on gate passage"
                : "15% per verified gate"
            }
            icon={<IconAward size={16} />}
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
                ? `${mapState.stats.tokensUsed.toLocaleString("en-US")} / ${mapState.stats.tokensCap.toLocaleString("en-US")} tokens`
                : "Provisioned on enrollment"
            }
            icon={<IconZap size={16} />}
          />
        </div>

        {/* Phase Jump Rail */}
        <nav
          aria-label="Jump to phase"
          className="mt-6 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {mapState.phases.map((p) => {
            const isCleared = p.gateCleared !== null;
            const isLocked = !p.isTrackUnlocked;
            return (
              <a
                key={p.phase.id}
                href={`#${p.phase.id}`}
                className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                  isCleared
                    ? "border-pass/40 bg-pass-soft text-pass"
                    : isLocked
                      ? "border-line bg-inset text-ink-3 hover:border-line-strong hover:text-ink-2"
                      : "border-line-strong bg-raised text-ink-2 hover:border-accent/50 hover:text-accent"
                }`}
              >
                P{p.phase.phase}
              </a>
            );
          })}
          <a
            href="#capstone-bar"
            className="shrink-0 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 font-mono text-xs text-accent transition-colors hover:bg-accent/20"
          >
            Graduation Bar
          </a>
        </nav>
      </header>

      {/* Meridian Pipeline Architecture Overview */}
      <section className="mt-10">
        <div className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="text-base font-semibold text-ink">
                Meridian Mutual Claims Triage Architecture
              </h2>
              <p className="text-[13px] text-ink-3">
                How all thirteen phases connect into one production-grade automated pipeline.
              </p>
            </div>
            <span className="chip-accent">Single Anchor Client</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <PipelineTrack
              title="1. Intake & Foundation"
              phases="Phases 0 to 1"
              role="Docker runtime, pytest harnesses, async HTTP intake endpoint."
              status="unlocked"
            />
            <PipelineTrack
              title="2. Extraction & Grounding"
              phases="Phases 2 to 4"
              role="Model physics, strict Pydantic extraction (Unit 3.2.1), and RAG policy search."
              status="active"
            />
            <PipelineTrack
              title="3. Multi-Tool Agents"
              phases="Phases 5 to 6"
              role="ReAct triage routing agent, stop conditions, and LoRA domain adaptation."
              status={mapState.stats.clearedGates > 0 ? "unlocked" : "gated"}
              gateBadge="15% Rebate Gate"
            />
            <PipelineTrack
              title="4. Eval, Ops & Capstone"
              phases="Phases 7 to 12"
              role="Calibrated judge CI, dynamic cost router, audit spine, and production deployment."
              status={mapState.stats.clearedGates > 0 ? "unlocked" : "locked"}
              gateBadge="15% Rebate Gate"
            />
          </div>
        </div>
      </section>

      {/* Main Map: 13 Phases */}
      <main className="mt-10 space-y-12">
        {mapState.phases.map((phase) => (
          <PhaseSection
            key={phase.phase.id}
            phase={phase}
            prices={prices}
          />
        ))}
      </main>

      {/* Section 14 Graduation Bar */}
      <section id="capstone-bar" className="mt-16 rounded-xl border border-line bg-raised/40 p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
            <IconAward size={20} />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              The Section 14 Graduation Standard
            </h2>
            <p className="text-sm text-ink-3">
              Delivery-Ready credential verified by five automated and simulation checks.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GradCheck
            num="1"
            title="Golden set accuracy"
            description="Verified precision and recall on held-out adversarial claim test cases."
          />
          <GradCheck
            num="2"
            title="Defend-your-work"
            description="Short unscripted questions generated directly from your submitted code."
          />
          <GradCheck
            num="3"
            title="CTO persona defense"
            description="Simulated technical evaluation requiring telemetry, cost caps, and audit logs."
          />
          <GradCheck
            num="4"
            title="CFO persona defense"
            description="Simulated business owner defense on unit economics and scope exclusions."
          />
          <GradCheck
            num="5"
            title="Real-world outreach"
            description="One verified outreach email sent to a real business with a priced SOW."
          />
          <div className="flex flex-col justify-between rounded-xl border border-accent/25 bg-accent-soft p-5">
            <p className="text-xs font-semibold tracking-wider text-accent uppercase">
              The Verified Credential
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">
              Clearing all five checks updates your public profile with immutable references to your
              git commits and judge verdicts.
            </p>
            <Link href="/submit" className="link-arrow mt-3 text-xs">
              Review submission contract
              <IconArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>
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
    <div className="panel p-4">
      <div className="flex items-center justify-between text-ink-3">
        <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>
        <span className="text-accent">{icon}</span>
      </div>
      <p className="mt-1 font-mono text-xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 truncate text-[11px] text-ink-3">{detail}</p>
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
      className={`rounded-xl border p-4 transition-colors ${
        status === "active"
          ? "border-accent/50 bg-accent-soft/30"
          : status === "unlocked"
            ? "border-line-strong bg-raised"
            : "border-line bg-inset opacity-80"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-ink">{title}</span>
        {gateBadge ? <span className="chip-accent text-[10px]">{gateBadge}</span> : null}
      </div>
      <p className="mt-1 font-mono text-[11px] text-accent">{phases}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-2">{role}</p>
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
      <div className="panel overflow-hidden">
        {/* Phase Header */}
        <div className="border-b border-line bg-inset p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg border border-line-strong bg-raised font-mono text-xs font-semibold text-accent">
                  P{p.phase}
                </span>
                <h2 className="text-xl font-semibold tracking-tight text-ink">{p.title}</h2>
                <span className="font-mono text-xs text-ink-3">~{p.est_hours} hours</span>
                {p.badge ? <span className="chip-accent">{p.badge}</span> : null}
              </div>
              <p className="mt-2 text-sm text-ink-2">
                <span className="font-medium text-ink">Meridian component:</span> {p.meridian_role}
              </p>
            </div>

            <div>
              {phase.gateCleared ? (
                <span className="chip-pass">
                  <IconCheck size={12} className="mr-1 inline" />
                  Gate cleared
                </span>
              ) : isLocked ? (
                <span className="chip">
                  <IconLock size={11} className="mr-1 inline align-[-1px]" />
                  Track locked
                </span>
              ) : (
                <span className="chip-accent">Track available</span>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 text-xs text-ink-3 md:grid-cols-2">
            <div>
              <span className="font-mono uppercase tracking-wider text-ink-3">Why it exists:</span>
              <p className="mt-1 leading-relaxed text-ink-2">{p.why}</p>
            </div>
            <div>
              <span className="font-mono uppercase tracking-wider text-ink-3">Concrete outcome:</span>
              <p className="mt-1 leading-relaxed text-ink-2">{p.outcome}</p>
            </div>
          </div>

          {phase.lockReason ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-line bg-raised px-4 py-3 text-xs text-ink-3">
              <IconLock size={14} className="mt-0.5 shrink-0 text-ink-3" />
              <p>{phase.lockReason}</p>
            </div>
          ) : null}
        </div>

        {/* Phase Gate Callout (if gate sits in this phase) */}
        {phase.gateRule ? (
          <div className="border-b border-line bg-raised/70 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-9 place-items-center rounded-lg border ${
                    phase.gateCleared
                      ? "border-pass/40 bg-pass-soft text-pass"
                      : "border-line bg-inset text-accent"
                  }`}
                >
                  {phase.gateCleared ? <IconCheck size={18} /> : <IconLock size={16} />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{phase.gateRule.title}</h3>
                    {phase.gateRule.rebate ? (
                      <span className="chip-accent text-[10px]">15% Completion Rebate</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-ink-3">
                    {phase.gateCleared
                      ? `Cleared on ${formatUtc(phase.gateCleared.passed_at)}. ${
                          phase.gateRule.unlocks.length > 0
                            ? `Units ${phase.gateRule.unlocks.join(", ")} are now unlocked.`
                            : "Final technical milestone completed."
                        }`
                      : `${phase.gateRule.summary} ${
                          phase.gateRule.unlocks.length > 0
                            ? `Clearing it unlocks units ${phase.gateRule.unlocks.join(", ")}.`
                            : "This is the final capstone gate."
                        }`}
                  </p>
                </div>
              </div>

              <div>
                <span className={phase.gateCleared ? "chip-pass" : "chip"}>
                  {phase.gateCleared ? "cleared" : "locked"}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
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
      className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
        card.status === "passed"
          ? "border-pass/40 bg-pass-soft/20 hover:border-pass/60"
          : card.status === "failed"
            ? "border-fail/40 bg-fail-soft/20 hover:border-fail/60"
            : card.status === "grading" || card.status === "queued"
              ? "border-accent/40 bg-accent-soft/20"
              : isEnrolled
                ? "border-line-strong bg-raised hover:border-accent/40"
                : isAuthored
                  ? "border-line bg-raised hover:border-line-strong"
                  : "border-line/60 bg-inset/60"
      }`}
    >
      <div>
        {/* Top row: id and status chip */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-accent">
            Unit {m.id}
          </span>
          <StatusChip status={card.status} />
        </div>

        {/* Title */}
        <h4 className="mt-2.5 text-[15px] font-semibold tracking-tight text-ink">
          {m.title}
        </h4>

        {/* Description */}
        <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
          {m.description}
        </p>

        {/* Lock or unauthored note */}
        {card.lockReason && !isAuthored ? (
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-3">
            <IconLock size={10} className="mr-1 inline align-[-1px]" />
            {card.lockReason}
          </p>
        ) : null}

        {/* Submission verdict snippet */}
        {sub ? (
          <div className="mt-3 rounded-lg border border-line bg-inset p-2.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-ink-3">
              <Link href={`/submissions/${sub.id}`} className="text-accent hover:underline">
                Submission #{sub.id}
              </Link>
              <span className={sub.overall === "pass" ? "text-pass font-semibold" : sub.overall === "fail" ? "text-fail font-semibold" : "text-accent"}>
                {sub.overall ?? sub.status}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-ink-3 truncate">
              {formatUtc(sub.created_at)}
            </p>
          </div>
        ) : null}
      </div>

      {/* Card action footer */}
      <div className="mt-5 border-t border-line/60 pt-3">
        {isAuthored ? (
          isEnrolled ? (
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/units/${m.id}`}
                className="btn-primary w-full py-2 text-xs text-center"
              >
                Open workbench
                <IconArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <form action={startCheckoutAction} className="w-full">
                <input type="hidden" name="unit_id" value={m.id} />
                <button
                  type="submit"
                  className="btn-ghost w-full py-2 text-xs text-center"
                >
                  {price?.state === "ok"
                    ? `Enroll (${formatPrice(price.data.amount_cents, price.data.currency)})`
                    : `Enroll unit ${m.id}`}
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between text-[11px] text-ink-3">
            <span>Curriculum spec complete</span>
            <span className="font-mono text-[10px]">Content arriving</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  switch (status) {
    case "passed":
      return <span className="chip-pass">pass</span>;
    case "failed":
      return <span className="chip-fail">retry needed</span>;
    case "grading":
      return <span className="chip-accent">grading...</span>;
    case "queued":
      return <span className="chip-warn">queued</span>;
    case "enrolled":
      return <span className="chip-pass">enrolled</span>;
    case "available":
      return <span className="chip">open</span>;
    case "locked":
      return (
        <span className="chip">
          <IconLock size={10} className="mr-1 inline align-[-1px]" />
          locked
        </span>
      );
    case "not_authored_unlocked":
      return <span className="chip-accent">unlocked</span>;
    case "not_authored_locked":
      return (
        <span className="chip">
          <IconLock size={10} className="mr-1 inline align-[-1px]" />
          locked
        </span>
      );
    case "not_authored":
    default:
      return <span className="chip">planned</span>;
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
    <div className="rounded-xl border border-line bg-raised p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded bg-inset font-mono text-xs font-semibold text-accent">
          {num}
        </span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-2">{description}</p>
    </div>
  );
}
