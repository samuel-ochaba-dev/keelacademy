import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { startCheckoutAction } from "@/app/auth/actions";
import {
  ensureStudent,
  fetchOwnSubmissions,
  fetchPrice,
  fetchProfile,
  formatPrice,
  type EnrollResult,
  type OwnSubmission,
  type Rebate,
} from "@/lib/enroll";
import { listUnits } from "@/lib/content";
import { formatUtc } from "@/lib/grading";
import {
  fetchStudentGates,
  loadGateRules,
  type GateRule,
  type GatesLookup,
  type PassedGate,
} from "@/lib/gates";
import {
  fetchRecheckSchedule,
  type PracticeResult,
  type RecheckSchedule,
} from "@/lib/practice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Progress & Learner Cockpit",
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

type Props = { searchParams: Promise<{ checkout?: string }> };

export default async function MePage({ searchParams }: Props) {
  const { checkout } = await searchParams;
  const user = await requireSession("/me");
  const bridged = await ensureStudent(user);

  return (
    <div>
      {/* Flight deck header */}
      <header>
        <div>
          <div>
            <div>
              
              <div>
                <span>
                  LEARNER FLIGHT COCKPIT
                </span>
                <h1>
                  {user.name ?? user.email}
                </h1>
                <p>{user.email}</p>
              </div>
            </div>

            <div>
              <span>
                
                <span>{bridged.state === "ok" ? `grading record #${bridged.data}` : "GUEST SESSION"}</span>
              </span>
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
        </div>
      </header>

      <div>
        {bridged.state === "ok" ? (
          <EnrolledSections studentId={bridged.data} />
        ) : (
          <div>
            <h2>Enrollment Service Suspended</h2>
            <p>
              The enrollment service is temporarily unavailable. Your signed-in session is active;
              refresh in a moment to reload your grading profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

async function EnrolledSections({ studentId }: { studentId: number }) {
  const [profileResult, submissionsResult, gatesLookup, recheckResult] = await Promise.all([
    fetchProfile(studentId),
    fetchOwnSubmissions(studentId),
    fetchStudentGates(studentId),
    fetchRecheckSchedule(studentId),
  ]);
  const gateRules = loadGateRules();
  const units = listUnits();
  const enrolledUnits = new Set(
    profileResult.state === "ok" ? profileResult.data.enrollments.map((e) => e.unit_id) : [],
  );
  const prices = new Map<string, EnrollResult<{ amount_cents: number; currency: string }>>();
  await Promise.all(
    units
      .filter((u) => !enrolledUnits.has(u.id))
      .map(async (u) => prices.set(u.id, await fetchPrice(u.id))),
  );
  const budget = profileResult.state === "ok" ? profileResult.data.budget : null;
  const rebates = profileResult.state === "ok" ? profileResult.data.rebates : [];

  const usedTokens = budget?.tokens_used ?? 0;
  const capTokens = budget?.tokens_cap ?? 1;
  const pctUsed = Math.min(100, Math.round((usedTokens / capTokens) * 100));

  return (
    <div>
      {/* Token budget meter */}
      {budget ? (
        <section>
          <div>
            <div>
              
              <h2>
                GRADING TOKEN CONSUMPTION BUDGET
              </h2>
            </div>
            <span>{`${usedTokens.toLocaleString("en-US")} / ${capTokens.toLocaleString("en-US")} tokens (${pctUsed}%)`}</span>
          </div>

          <div>
            <progress value={usedTokens} max={capTokens} />
          </div>
          <p>{`Provisioned budget: ${capTokens.toLocaleString("en-US")} tokens`}</p>
          <p>
            Tokens are consumed exclusively when the Layer 2 calibrated rubric judge evaluates your git commits.
          </p>
        </section>
      ) : null}

      {/* Spaced re-checks (S3.3) */}
      <RecheckSection result={recheckResult} />

      {/* Curriculum units */}
      <section>
        <div>
          <div>
            <span>
              CURRICULUM UNITS & BENCH ACCESS
            </span>
          </div>
          <Link href="/map">
            <span>View Meridian map</span>
          </Link>
        </div>

        {profileResult.state !== "ok" ? (
          <p>
            Unable to load unit enrollments right now. Please refresh.
          </p>
        ) : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Unit Spec</th>
                  <th>Phase</th>
                  <th>Status</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => {
                  const isEnrolled = enrolledUnits.has(unit.id);
                  return (
                    <tr key={unit.id}>
                      <td>Unit {unit.id}</td>
                      <td>PHASE 0{unit.phase}</td>
                      <td>
                        <span>
                          {isEnrolled ? "enrolled" : "available"}
                        </span>
                      </td>
                      <td>
                        <UnitRowAction
                          unitId={unit.id}
                          enrolled={isEnrolled}
                          price={prices.get(unit.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Gates */}
      {gateRules.length > 0 ? <GatesSection rules={gateRules} lookup={gatesLookup} /> : null}

      {/* Rebates */}
      {rebates.length > 0 ? <RebateSection rebates={rebates} /> : null}

      {/* Submission history */}
      <section>
        <div>
          <div>
            <h2>
              IMMUTABLE SUBMISSION AUDIT LEDGER
            </h2>
          </div>
          <Link href="/submit">
            <span>Submission protocol</span>
          </Link>
        </div>

        <div>
          <SubmissionsBody result={submissionsResult} />
        </div>
      </section>
    </div>
  );
}

function UnitRowAction({
  unitId,
  enrolled,
  price,
}: {
  unitId: string;
  enrolled: boolean;
  price: EnrollResult<{ amount_cents: number; currency: string }> | undefined;
}) {
  if (enrolled) {
    return (
      <Link href={`/units/${unitId}`}>
        <span>Open workbench</span>
      </Link>
    );
  }

  const priceLabel =
    price?.state === "ok" ? formatPrice(price.data.amount_cents, price.data.currency) : null;

  return (
    <form action={startCheckoutAction}>
      <input type="hidden" name="unit_id" value={unitId} />
      <button type="submit">
        {priceLabel ? `Enroll for ${priceLabel}` : `Enroll unit ${unitId}`}
      </button>
    </form>
  );
}

function gatesUnlocksSentence(rule: GateRule, cleared: boolean): string {
  if (rule.unlocks.length === 0) {
    return cleared
      ? "Terminal capstone cleared."
      : "Final milestone barrier.";
  }
  const list = rule.unlocks.join(", ");
  return cleared ? `Units ${list} unlocked.` : `Passing unlocks units ${list}.`;
}

function GatesSection({ rules, lookup }: { rules: GateRule[]; lookup: GatesLookup }) {
  const passed = new Map<string, PassedGate>(
    lookup.state === "ok" ? lookup.data.gates_passed.map((g) => [g.gate_id, g]) : [],
  );

  return (
    <section>
      <div>
        
        <div>
          <h2>
            CRYPTOGRAPHIC GATE BARRIERS
          </h2>
        </div>
      </div>

      {lookup.state !== "ok" ? (
        <p>
          Gate status is temporarily unavailable. Refresh in a moment.
        </p>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Milestone Gate</th>
                <th>Barrier Status</th>
                <th>Unlock Rule</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const clearedAt = passed.get(rule.gate_id);
                const cleared = clearedAt !== undefined;
                return (
                  <tr key={rule.gate_id}>
                    <td>{rule.title}</td>
                    <td>
                      <span>
                        {cleared ? "CLEARED" : "LOCKED"}
                      </span>
                    </td>
                    <td>
                      {cleared && clearedAt
                        ? `Cleared on ${formatUtc(clearedAt.passed_at)}. ${gatesUnlocksSentence(rule, true)}`
                        : `${rule.summary} ${gatesUnlocksSentence(rule, false)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const GATE_LABELS: Record<string, string> = {
  "phase-5-integration": "Phase 5 integration gate (15% rebate)",
  capstone: "Final capstone defense (15% rebate)",
};

function gateLabel(gateId: string): string {
  return GATE_LABELS[gateId] ?? gateId;
}

function rebateStatusLine(rebate: Rebate): string {
  const amount = formatPrice(rebate.amount_cents, rebate.currency);
  switch (rebate.status) {
    case "pending":
      return `Target window open until ${formatUtc(rebate.window_ends_at)}. Credited automatically on verified gate pass.`;
    case "earned":
      return `Earned ${amount} on ${formatUtc(rebate.earned_at ?? rebate.pledged_at)}. Payout initiated to card via Stripe.`;
    case "paid":
      return `Refund of ${amount} issued to payment method on ${formatUtc(rebate.paid_at ?? rebate.earned_at ?? rebate.pledged_at)}.`;
    case "forfeited":
      return `Forfeited on ${formatUtc(rebate.forfeited_at ?? rebate.pledged_at)}.`;
    case "expired":
      return `Target window expired on ${formatUtc(rebate.expired_at ?? rebate.window_ends_at)} without verified pass.`;
  }
}

function RebateSection({ rebates }: { rebates: Rebate[] }) {
  return (
    <section>
      <div>
        
        <div>
          <h2>
            30% COMPLETION REBATE LEDGER
          </h2>
        </div>
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>Rebate Milestone</th>
              <th>Ledger Status</th>
              <th>Settlement Details</th>
            </tr>
          </thead>
          <tbody>
            {rebates.map((rebate) => {
              return (
                <tr key={rebate.gate_id}>
                  <td>{gateLabel(rebate.gate_id)}</td>
                  <td>
                    <span>
                      {rebate.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {rebateStatusLine(rebate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecheckSection({ result }: { result: PracticeResult<RecheckSchedule> }) {
  const schedule = result.state === "ok" ? result.data : null;
  const dueSeeds = schedule ? schedule.seeds.filter((s) => s.status === "due") : [];
  const upcomingSeeds = schedule ? schedule.seeds.filter((s) => s.status === "upcoming") : [];
  const nextDueAt =
    upcomingSeeds
      .map((s) => s.due_at)
      .filter((d): d is string => !!d)
      .sort()[0] ?? null;

  return (
    <section
      data-keel-section="spaced-rechecks"
    >
      <div>
        <div>
          
          <h2>
            SPACED RE-CHECKS
          </h2>
        </div>
        <span
        >
          {`${dueSeeds.length} DUE`}
        </span>
      </div>

      <div>
        {!schedule ? (
          <p>
            Re-check schedule is temporarily unavailable. Refresh in a moment.
          </p>
        ) : dueSeeds.length === 0 ? (
          <p>
            No re-checks due. Passed drills come back here after 3 days, then 7 days.
            {nextDueAt ? ` Next scheduled: ${formatUtc(nextDueAt)}.` : ""}
          </p>
        ) : (
          <ul>
            {dueSeeds.map((s) => (
              <li
                key={`${s.unit_id}-${s.seed_index}`}
              >
                <div>
                  <span>
                    UNIT {s.unit_id} · QUESTION {s.seed_index + 1}
                  </span>
                  <p>{s.seed_prompt}</p>
                </div>
                <Link
                  href={`/units/${s.unit_id}#practice`}
                >
                  <span>Open drill</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SubmissionsBody({
  result,
}: {
  result: EnrollResult<{ submissions: OwnSubmission[] }>;
}) {
  if (result.state === "unreachable" || result.state === "rejected") {
    return (
      <p>
        Grading history is temporarily unavailable. Refresh in a moment.
      </p>
    );
  }
  const submissions = result.data.submissions;
  if (submissions.length === 0) {
    return (
      <div>
        <p>No submissions yet</p>
        <Link href="/submit">
          <span>View git submission instructions</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Submission SHA</th>
            <th>Target Unit</th>
            <th>Runner Pipeline</th>
            <th>Verdict</th>
            <th>Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            return (
              <tr key={s.id}>
                <td>
                  <Link href={`/submissions/${s.id}`}>
                    #{s.id}
                  </Link>
                </td>
                <td>UNIT {s.unit_id}</td>
                <td>
                  <span
                  >
                    {s.status}
                  </span>
                </td>
                <td>
                  <span
                  >
                    {s.overall ?? "PENDING"}
                  </span>
                </td>
                <td>{formatUtc(s.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
