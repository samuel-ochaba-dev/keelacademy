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
      <div>
        <div>
          <h1>Enrollment service paused</h1>
          <p>
            Your signed-in session is active, but the grading profile service is temporarily
            unreachable. Please refresh in a moment to reload the Meridian map.
          </p>
          <Link href="/me">
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
    <div>
      {/* Cockpit header */}
      <header>
        <div>
          <div>
            <div>
              <div>
                
                <p>
                  ACTIVE PIPELINE ARCHITECTURE · MERIDIAN MUTUAL
                </p>
              </div>
              <h1>
                The Meridian Interactive System Map
              </h1>
              <p>
                Every phase and module in the 13-phase claims triage architecture. Each card shows where your code plugs into the running Meridian engine, joined with live sandbox telemetry, gate barriers, and completion rebates.
              </p>
            </div>

            <div>
              <span>
                STUDENT #{studentId}
              </span>
              <Link href="/me">
                <span>Open Cockpit</span>
              </Link>
            </div>
          </div>

          {checkout ? (
            <div
              role="alert"
            >
              <p>
                <span>CHECKOUT ERROR:</span>{" "}
                {CHECKOUT_ERRORS[checkout] ?? "Checkout could not start. Nothing was charged."}
              </p>
            </div>
          ) : null}

          {/* Metrics Strip */}
          <div>
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
          >
            {mapState.phases.map((p) => {
              return (
                <a
                  key={p.phase.id}
                  href={`#${p.phase.id}`}
                >
                  P{p.phase.phase}
                </a>
              );
            })}
            <a
              href="#capstone-bar"
            >
              SECTION 14 SPEC
            </a>
          </nav>
        </div>
      </header>

      <div>
      {/* Meridian Pipeline Architecture Overview */}
      <section>
        <div>
          <div>
            <div>
              <h2>
                MERIDIAN CLAIMS TRIAGE ARCHITECTURE PIPELINE
              </h2>
              <p>
                How all thirteen phases connect into one production-grade automated pipeline.
              </p>
            </div>
            <span>
              ANCHOR CORPUS: MERIDIAN MUTUAL
            </span>
          </div>

          <div>
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
              gateBadge="15% Rebate Gate"
            />
            <PipelineTrack
              title="4. Eval, Ops & Capstone"
              phases="PHASES 07 TO 12"
              role="Calibrated judge CI, dynamic cost router, audit spine, and production deployment."
              gateBadge="15% Rebate Gate"
            />
          </div>
        </div>
      </section>

      {/* Main Map: 13 Phases */}
      <main>
        {mapState.phases.map((phase) => (
          <PhaseSection
            key={phase.phase.id}
            phase={phase}
            prices={prices}
          />
        ))}
      </main>

      {/* Section 14 Graduation Bar */}
      <section id="capstone-bar">
        <div>
          
          <div>
            <h2>
              SECTION 14 GRADUATION SPECIFICATION
            </h2>
            <p>
              Delivery-Ready credential verified by five automated and simulation checks.
            </p>
          </div>
        </div>

        <div>
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
          <div>
            <span>
              IMMUTABLE CREDENTIAL LEDGER
            </span>
            <p>
              Clearing all five checks binds your public cryptographic profile with permanent git commit hashes and judge verdicts.
            </p>
            <Link href="/submit">
              <span>Review submission protocol</span>
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
    <div>
      <div>
        <span>{label}</span>
      </div>
      <p>{value}</p>
      <p>{detail}</p>
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
    <div
    >
      <div>
        <span>{title}</span>
        {gateBadge ? <span>{gateBadge}</span> : null}
      </div>
      <p>{phases}</p>
      <p>{role}</p>
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
    <section id={p.id}>
      <div>
        {/* Phase Header */}
        <div>
          <div>
            <div>
              <div>
                <span>
                  P{p.phase}
                </span>
                <h2>{p.title}</h2>
                <span>~{p.est_hours} HOURS</span>
                {p.badge ? <span>{p.badge}</span> : null}
              </div>
              <p>
                <span>Role:</span> {p.meridian_role}
              </p>
            </div>

            <div>
              {phase.gateCleared ? (
                <span>
                  GATE CLEARED
                </span>
              ) : isLocked ? (
                <span>
                  TRACK LOCKED
                </span>
              ) : (
                <span>
                  TRACK ACTIVE
                </span>
              )}
            </div>
          </div>

          <div>
            <div>
              <span>Why it exists:</span>
              <p>{p.why}</p>
            </div>
            <div>
              <span>Concrete outcome:</span>
              <p>{p.outcome}</p>
            </div>
          </div>

          {phase.lockReason ? (
            <div>
              <p>{phase.lockReason}</p>
            </div>
          ) : null}
        </div>

        {/* Phase Gate Callout (if gate sits in this phase) */}
        {phase.gateRule ? (
          <div>
              <div>
                <div>
                  <div>
                    <h3>{phase.gateRule.title}</h3>
                    {phase.gateRule.rebate ? (
                      <span>15% REBATE</span>
                    ) : null}
                  </div>
                  <p>
                    {phase.gateCleared
                      ? `Cleared on ${formatUtc(phase.gateCleared.passed_at)}.`
                      : phase.gateRule.summary}
                  </p>
                </div>
              </div>

              <div>
                <span>
                  {phase.gateCleared ? "CLEARED" : "LOCKED"}
                </span>
              </div>
            </div>
        ) : null}

        {/* Module Cards Grid */}
        <div>
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
    >
      <div>
        {/* Top row: id and status chip */}
        <div>
          <span>
            UNIT {m.id}
          </span>
          <StatusChip status={card.status} />
        </div>

        {/* Title */}
        <h4>
          {m.title}
        </h4>

        {/* Description */}
        <p>
          {m.description}
        </p>

        {/* Lock or unauthored note */}
        {card.lockReason && !isAuthored ? (
          <p>
            {card.lockReason}
          </p>
        ) : null}

        {/* Submission verdict snippet */}
        {sub ? (
          <div>
            <div>
              <Link href={`/submissions/${sub.id}`}>
                SHA #{sub.id}
              </Link>
              <span>
                {sub.overall?.toUpperCase() ?? sub.status.toUpperCase()}
              </span>
            </div>
            <p>
              {formatUtc(sub.created_at)}
            </p>
          </div>
        ) : null}
      </div>

      {/* Card action footer */}
      <div>
        {isAuthored ? (
          isEnrolled ? (
            <Link
              href={`/units/${m.id}`}
            >
              <span>OPEN BENCH</span>
            </Link>
          ) : (
            <form action={startCheckoutAction}>
              <input type="hidden" name="unit_id" value={m.id} />
              <button
                type="submit"
              >
                {price?.state === "ok"
                  ? `ENROLL (${formatPrice(price.data.amount_cents, price.data.currency)})`
                  : `ENROLL UNIT ${m.id}`}
              </button>
            </form>
          )
        ) : (
          <div>
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
      return <span>PASS</span>;
    case "failed":
      return <span>RETRY</span>;
    case "grading":
      return <span>GRADING</span>;
    case "queued":
      return <span>QUEUED</span>;
    case "enrolled":
      return <span>ENROLLED</span>;
    case "available":
      return <span>OPEN</span>;
    case "locked":
      return (
        <span>
          LOCKED
        </span>
      );
    case "not_authored_unlocked":
      return <span>UNLOCKED</span>;
    case "not_authored_locked":
      return (
        <span>
          LOCKED
        </span>
      );
    case "not_authored":
    default:
      return <span>PLANNED</span>;
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
    <div>
      <div>
        <span>
          {num}
        </span>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
    </div>
  );
}
