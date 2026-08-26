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
  IconArrowRight,
  IconAward,
  IconZap,
  IconAlertTriangle,
  IconCpu,
  IconLock,
  IconUnlock,
} from "@/components/icons";

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
    <div className="space-y-0">
      {/* Flight deck header */}
      <header className="border-b border-line bg-canvas pt-10 pb-8">
        <div className="shell max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="grid size-10 place-items-center rounded border border-line-strong bg-raised text-accent">
                <IconCpu size={18} />
              </span>
              <div>
                <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold block">
                  LEARNER FLIGHT COCKPIT
                </span>
                <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {user.name ?? user.email}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 rounded border border-line bg-raised px-2.5 py-1 text-ink-3">
                <span className="size-1.5 rounded-full bg-pass" />
                <span>{bridged.state === "ok" ? `STUDENT ID #${bridged.data}` : "GUEST SESSION"}</span>
              </span>
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
        </div>
      </header>

      <div className="shell max-w-5xl py-8">
        {bridged.state === "ok" ? (
          <EnrolledSections studentId={bridged.data} />
        ) : (
          <div className="rounded border border-line bg-raised p-6 space-y-2">
            <h2 className="text-sm font-semibold text-ink">Enrollment Service Suspended</h2>
            <p className="text-xs leading-relaxed text-ink-3">
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
  const [profileResult, submissionsResult, gatesLookup] = await Promise.all([
    fetchProfile(studentId),
    fetchOwnSubmissions(studentId),
    fetchStudentGates(studentId),
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
    <div className="space-y-8">
      {/* Token budget meter */}
      {budget ? (
        <section className="rounded-lg border border-line bg-raised p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded border border-line bg-inset text-accent">
                <IconZap size={14} />
              </span>
              <h2 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
                GRADING TOKEN CONSUMPTION BUDGET
              </h2>
            </div>
            <span className="font-mono text-xs text-ink-3 tabular-nums">
              {usedTokens.toLocaleString("en-US")} / {capTokens.toLocaleString("en-US")} TOKENS ({pctUsed}%)
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded bg-inset border border-line">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${pctUsed}%` }}
            />
          </div>
          <p className="font-mono text-[11px] text-ink-4">
            Tokens are consumed exclusively when the Layer 2 calibrated rubric judge evaluates your git commits.
          </p>
        </section>
      ) : null}

      {/* Curriculum units */}
      <section className="rounded-lg border border-line bg-raised overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
              CURRICULUM UNITS & BENCH ACCESS
            </span>
          </div>
          <Link href="/map" className="link-arrow text-xs">
            <span>View Meridian map</span>
            <IconArrowRight size={11} />
          </Link>
        </div>

        {profileResult.state !== "ok" ? (
          <p className="px-5 py-4 text-xs text-ink-3">
            Unable to load unit enrollments right now. Please refresh.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-inset/40 font-mono text-[10px] text-ink-4 uppercase">
                  <th className="py-2.5 px-4 font-semibold">Unit Spec</th>
                  <th className="py-2.5 px-4 font-semibold">Phase</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {units.map((unit) => {
                  const isEnrolled = enrolledUnits.has(unit.id);
                  return (
                    <tr key={unit.id} className="hover:bg-raised-2/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-ink">Unit {unit.id}</td>
                      <td className="py-2.5 px-4 font-mono text-ink-3">PHASE 0{unit.phase}</td>
                      <td className="py-2.5 px-4">
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                          isEnrolled ? "border border-pass/30 bg-pass-soft text-pass" : "border border-line bg-inset text-ink-4"
                        }`}>
                          {isEnrolled ? "ENROLLED" : "AVAILABLE"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
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
      <section className="rounded-lg border border-line bg-raised overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-5 py-3">
          <div>
            <h2 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
              IMMUTABLE SUBMISSION AUDIT LEDGER
            </h2>
          </div>
          <Link href="/submit" className="link-arrow text-xs">
            <span>Submission protocol</span>
            <IconArrowRight size={11} />
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
      <Link href={`/units/${unitId}`} className="link-arrow text-xs inline-flex">
        <span>Open workbench</span>
        <IconArrowRight size={11} />
      </Link>
    );
  }

  const priceLabel =
    price?.state === "ok" ? formatPrice(price.data.amount_cents, price.data.currency) : null;

  return (
    <form action={startCheckoutAction}>
      <input type="hidden" name="unit_id" value={unitId} />
      <button type="submit" className="btn-ghost px-2.5 py-1 text-xs">
        {priceLabel ? `Enroll (${priceLabel})` : `Enroll unit ${unitId}`}
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
    <section className="rounded-lg border border-line bg-raised overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line bg-inset px-5 py-3">
        <span className="grid size-7 place-items-center rounded border border-line bg-raised text-accent">
          <IconUnlock size={14} />
        </span>
        <div>
          <h2 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
            CRYPTOGRAPHIC GATE BARRIERS
          </h2>
        </div>
      </div>

      {lookup.state !== "ok" ? (
        <p className="px-5 py-4 text-xs text-ink-3">
          Gate status is temporarily unavailable. Refresh in a moment.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-inset/40 font-mono text-[10px] text-ink-4 uppercase">
                <th className="py-2.5 px-4 font-semibold">Milestone Gate</th>
                <th className="py-2.5 px-4 font-semibold">Barrier Status</th>
                <th className="py-2.5 px-4 font-semibold">Unlock Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rules.map((rule) => {
                const clearedAt = passed.get(rule.gate_id);
                const cleared = clearedAt !== undefined;
                return (
                  <tr key={rule.gate_id} className="hover:bg-raised-2/40 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-ink">{rule.title}</td>
                    <td className="py-2.5 px-4">
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase font-semibold inline-flex items-center gap-1 ${
                        cleared ? "border border-pass/30 bg-pass-soft text-pass" : "border border-line bg-inset text-ink-4"
                      }`}>
                        <IconLock size={10} className={cleared ? "hidden" : "inline"} />
                        {cleared ? "CLEARED" : "LOCKED"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-ink-2 font-mono">
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
    <section className="rounded-lg border border-line bg-raised overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line bg-inset px-5 py-3">
        <span className="grid size-7 place-items-center rounded border border-line bg-raised text-accent">
          <IconAward size={14} />
        </span>
        <div>
          <h2 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
            30% COMPLETION REBATE LEDGER
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line bg-inset/40 font-mono text-[10px] text-ink-4 uppercase">
              <th className="py-2.5 px-4 font-semibold">Rebate Milestone</th>
              <th className="py-2.5 px-4 font-semibold">Ledger Status</th>
              <th className="py-2.5 px-4 font-semibold">Settlement Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rebates.map((rebate) => {
              return (
                <tr key={rebate.gate_id} className="hover:bg-raised-2/40 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-ink font-mono">{gateLabel(rebate.gate_id)}</td>
                  <td className="py-2.5 px-4">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                      rebate.status === "paid" || rebate.status === "earned"
                        ? "border border-pass/30 bg-pass-soft text-pass"
                        : "border border-line bg-inset text-ink-3"
                    }`}>
                      {rebate.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-ink-2 font-mono">
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

function SubmissionsBody({
  result,
}: {
  result: EnrollResult<{ submissions: OwnSubmission[] }>;
}) {
  if (result.state === "unreachable" || result.state === "rejected") {
    return (
      <p className="px-5 py-4 text-xs text-ink-3">
        Grading history is temporarily unavailable. Refresh in a moment.
      </p>
    );
  }
  const submissions = result.data.submissions;
  if (submissions.length === 0) {
    return (
      <div className="px-5 py-6 space-y-2">
        <p className="text-xs text-ink-3">No active submissions found in the runner queue.</p>
        <Link href="/submit" className="link-arrow text-xs inline-flex">
          <span>View git submission instructions</span>
          <IconArrowRight size={11} />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-line bg-inset/40 font-mono text-[10px] text-ink-4 uppercase">
            <th className="py-2.5 px-4 font-semibold">Submission SHA</th>
            <th className="py-2.5 px-4 font-semibold">Target Unit</th>
            <th className="py-2.5 px-4 font-semibold">Runner Pipeline</th>
            <th className="py-2.5 px-4 font-semibold">Verdict</th>
            <th className="py-2.5 px-4 font-semibold text-right">Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line font-mono">
          {submissions.map((s) => {
            return (
              <tr key={s.id} className="hover:bg-raised-2/40 transition-colors">
                <td className="py-2.5 px-4">
                  <Link href={`/submissions/${s.id}`} className="text-accent hover:text-accent-strong">
                    #{s.id}
                  </Link>
                </td>
                <td className="py-2.5 px-4 text-ink font-medium">UNIT {s.unit_id}</td>
                <td className="py-2.5 px-4">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold ${
                      s.status === "graded"
                        ? "border border-line bg-inset text-ink-3"
                        : s.status === "error"
                          ? "border border-fail/30 bg-fail-soft text-fail"
                          : "border border-accent/30 bg-accent-soft text-accent"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold ${
                      s.overall === "pass"
                        ? "border border-pass/30 bg-pass-soft text-pass"
                        : s.overall === "fail"
                          ? "border border-fail/30 bg-fail-soft text-fail"
                          : "border border-warn/30 bg-warn-soft text-warn"
                    }`}
                  >
                    {s.overall ?? "PENDING"}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right text-ink-4 tabular-nums text-[11px]">{formatUtc(s.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
