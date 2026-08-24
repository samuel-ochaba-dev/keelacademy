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
  IconArrowRight,
  IconAward,
  IconZap,
  IconAlertTriangle,
  IconCpu,
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
    <div className="shell max-w-5xl py-10 sm:py-12">
      {/* Profile header */}
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl border border-line-strong bg-raised text-accent">
              <IconCpu size={22} />
            </span>
            <div>
              <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
                Learner profile
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">
                {user.name ?? user.email}
              </h1>
            </div>
          </div>

          <span className={bridged.state === "ok" ? "chip-accent" : "chip"}>
            {bridged.state === "ok" ? `grading id #${bridged.data}` : "guest session"}
          </span>
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
      </header>

      {bridged.state === "ok" ? (
        <EnrolledSections studentId={bridged.data} />
      ) : (
        <div className="panel mt-8 p-6">
          <h2 className="text-base font-semibold text-ink">Enrollment service paused</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            The enrollment service is temporarily unavailable. Your signed-in session is active;
            refresh in a moment to reload your grading profile.
          </p>
        </div>
      )}
    </div>
  );
}

async function EnrolledSections({ studentId }: { studentId: number }) {
  const [profileResult, submissionsResult] = await Promise.all([
    fetchProfile(studentId),
    fetchOwnSubmissions(studentId),
  ]);
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
    <div className="mt-10 space-y-8">
      {/* Token budget */}
      {budget ? (
        <section className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg border border-line bg-inset text-accent">
                <IconZap size={17} />
              </span>
              <h2 className="text-base font-semibold text-ink">Grading token budget</h2>
            </div>
            <span className="font-mono text-xs text-ink-3">
              {usedTokens.toLocaleString("en-US")} / {capTokens.toLocaleString("en-US")} tokens (
              {pctUsed}%)
            </span>
          </div>

          <progress
            value={usedTokens}
            max={capTokens}
            className="mt-4 h-1.5 w-full appearance-none rounded-full bg-line [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-accent"
          >
            {pctUsed}%
          </progress>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
            Tokens are consumed only when the Layer 2 calibrated rubric judge evaluates your git
            submissions.
          </p>
        </section>
      ) : null}

      {/* Curriculum units */}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Curriculum units</h2>
            <p className="text-[13px] text-ink-3">Available and enrolled units on your path.</p>
          </div>
          <Link href="/curriculum" className="link-arrow text-xs">
            View full map
            <IconArrowRight size={12} />
          </Link>
        </div>

        {profileResult.state !== "ok" ? (
          <p className="px-6 py-5 text-sm text-ink-3">
            Unable to load unit enrollments right now. Please refresh.
          </p>
        ) : (
          <div className="overflow-x-auto p-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Phase</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => {
                  const isEnrolled = enrolledUnits.has(unit.id);
                  return (
                    <tr key={unit.id}>
                      <td className="font-medium text-ink">Unit {unit.id}</td>
                      <td className="num">phase {unit.phase}</td>
                      <td>
                        <span className={isEnrolled ? "chip-pass" : "chip"}>
                          {isEnrolled ? "enrolled" : "open"}
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

      {/* Rebates */}
      {rebates.length > 0 ? <RebateSection rebates={rebates} /> : null}

      {/* Submission history */}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Submission history</h2>
            <p className="text-[13px] text-ink-3">
              Immutable audit ledger of your git push evaluation verdicts.
            </p>
          </div>
          <Link href="/submit" className="link-arrow text-xs">
            Submission guide
            <IconArrowRight size={12} />
          </Link>
        </div>

        <div className="p-2">
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
      <Link href={`/units/${unitId}`} className="link-arrow text-xs">
        Open workbench
        <IconArrowRight size={11} />
      </Link>
    );
  }

  const priceLabel =
    price?.state === "ok" ? formatPrice(price.data.amount_cents, price.data.currency) : null;

  return (
    <form action={startCheckoutAction}>
      <input type="hidden" name="unit_id" value={unitId} />
      <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
        {priceLabel ? `Enroll (${priceLabel})` : `Enroll unit ${unitId}`}
      </button>
    </form>
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
      return `Target window open until ${formatUtc(rebate.window_ends_at)}. Credited automatically on a verified gate pass.`;
    case "earned":
      return `Earned ${amount} on ${formatUtc(rebate.earned_at ?? rebate.pledged_at)}. Payout is initiated to your card via Stripe.`;
    case "paid":
      return `Refund of ${amount} issued to your payment method on ${formatUtc(rebate.paid_at ?? rebate.earned_at ?? rebate.pledged_at)}.`;
    case "forfeited":
      return `Forfeited on ${formatUtc(rebate.forfeited_at ?? rebate.pledged_at)}.`;
    case "expired":
      return `Target window expired on ${formatUtc(rebate.expired_at ?? rebate.window_ends_at)} without a verified pass.`;
  }
}

const REBATE_TONES: Record<string, string> = {
  pending: "chip",
  earned: "chip-accent",
  paid: "chip-pass",
  forfeited: "chip-fail",
  expired: "chip-fail",
};

function RebateSection({ rebates }: { rebates: Rebate[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line bg-inset px-6 py-4">
        <span className="grid size-9 place-items-center rounded-lg border border-line bg-raised text-accent">
          <IconAward size={17} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink">Completion rebate ledger</h2>
          <p className="text-[13px] text-ink-3">
            Portions of your enrollment fee refunded on verified gate passage inside your 365-day
            window.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto p-2">
        <table className="data-table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rebates.map((rebate) => {
              return (
                <tr key={rebate.gate_id}>
                  <td className="font-medium text-ink">{gateLabel(rebate.gate_id)}</td>
                  <td>
                    <span className={REBATE_TONES[rebate.status] ?? "chip"}>{rebate.status}</span>
                  </td>
                  <td className="max-w-[46ch] text-[13px] leading-relaxed text-ink-2">
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
      <p className="px-4 py-5 text-sm text-ink-3">
        Grading history is temporarily unavailable. Refresh in a moment.
      </p>
    );
  }
  const submissions = result.data.submissions;
  if (submissions.length === 0) {
    return (
      <div className="px-4 py-6">
        <p className="text-sm text-ink-2">No submissions found yet for this account.</p>
        <Link href="/submit" className="link-arrow mt-3 text-xs">
          View git submission instructions
          <IconArrowRight size={11} />
        </Link>
      </div>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Submission</th>
          <th>Unit</th>
          <th>Pipeline status</th>
          <th>Verdict</th>
          <th>Submitted (UTC)</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((s) => {
          return (
            <tr key={s.id}>
              <td className="num">
                <Link href={`/submissions/${s.id}`} className="text-accent hover:text-accent-strong">
                  #{s.id}
                </Link>
              </td>
              <td>Unit {s.unit_id}</td>
              <td>
                <span
                  className={
                    s.status === "graded"
                      ? "chip"
                      : s.status === "error"
                        ? "chip-fail"
                        : "chip-accent"
                  }
                >
                  {s.status}
                </span>
              </td>
              <td>
                <span
                  className={
                    s.overall === "pass"
                      ? "chip-pass"
                      : s.overall === "fail"
                        ? "chip-fail"
                        : "chip-warn"
                  }
                >
                  {s.overall ?? "pending"}
                </span>
              </td>
              <td className="num text-xs">{formatUtc(s.created_at)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
