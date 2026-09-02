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
  title: "Your dashboard",
  robots: { index: false },
};

const CHECKOUT_ERRORS: Record<string, string> = {
  unreachable: "We could not reach the enrollment server. Try again in a moment.",
  app_not_configured: "This site is missing its enrollment secret (KEEL_ENROLL_SECRET).",
  stripe_not_wired: "Payments are not configured on the enrollment server yet.",
  stripe_unreachable: "The payment provider did not answer. Nothing was charged.",
  stripe_error: "The payment provider rejected the request. Nothing was charged.",
  email_linked_to_other_account:
    "This email belongs to a different account. Sign in with that account to enroll.",
};

type Props = { searchParams: Promise<{ checkout?: string }> };

export default async function MePage({ searchParams }: Props) {
  const { checkout } = await searchParams;
  const user = await requireSession("/me");
  const bridged = await ensureStudent(user);

  return (
    <div>
      <header className="shell border-b border-[color:var(--line-on-dark)] pb-10 pt-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">Your dashboard</p>
            <h1 className="heading-xl mt-4">{user.name ?? user.email}</h1>
            <p className="mt-3 text-[15px] text-[color:var(--text-muted-on-dark)]">
              {user.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip chip-outline">
              {bridged.state === "ok"
                ? `Grading record #${bridged.data}`
                : "Profile not loaded"}
            </span>
            <Link href="/map" className="btn btn-ghost btn-sm">
              View the full map
            </Link>
          </div>
        </div>

        {checkout ? (
          <div
            role="alert"
            className="mt-8 rounded-lg border border-circuit-border bg-carbon-veil p-5"
          >
            <p className="flex flex-wrap items-center gap-3 text-[15px] leading-relaxed text-phosphor-white">
              <span className="chip chip-alert">CHECKOUT FAILED</span>
              {CHECKOUT_ERRORS[checkout] ?? "Checkout could not start. Nothing was charged."}
            </p>
          </div>
        ) : null}
      </header>

      <div className="shell space-y-8 py-12">
        {bridged.state === "ok" ? (
          <EnrolledSections studentId={bridged.data} />
        ) : (
          <div className="card-dark max-w-[62ch]">
            <h2 className="heading-lg">We could not load your progress</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
              You are signed in, but the server that holds enrollments and verdicts did
              not answer. Nothing is lost. Refresh in a moment.
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
    <>
      {budget ? (
        <section aria-labelledby="budget-title" className="card-dark">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="budget-title" className="heading-md">
              Grading budget
            </h2>
            <span className="font-code-mono text-[13px] text-moss-70">
              {`${usedTokens.toLocaleString("en-US")} of ${capTokens.toLocaleString("en-US")} used (${pctUsed}%)`}
            </span>
          </div>

          <div
            aria-hidden="true"
            className="mt-5 h-2 w-full overflow-hidden rounded-full border border-circuit-border bg-void-black"
          >
            <div className="h-full bg-lime-pulse" style={{ width: `${pctUsed}%` }} />
          </div>

          <p className="mt-4 max-w-[70ch] text-[14px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            The budget is spent when rubric review reads your commit. The automated checks
            do not draw on it, so you can run those as often as you like.
          </p>
        </section>
      ) : null}

      <RecheckSection result={recheckResult} />

      <section aria-labelledby="units-title" className="card-dark">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="units-title" className="heading-md">
            Units written so far
          </h2>
          <Link href="/curriculum" className="btn btn-quiet btn-sm">
            See all thirteen phases
          </Link>
        </div>

        {profileResult.state !== "ok" ? (
          <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            We could not load your enrollments. Refresh in a moment.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Unit</th>
                  <th scope="col">Phase</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => {
                  const isEnrolled = enrolledUnits.has(unit.id);
                  return (
                    <tr key={unit.id}>
                      <td className="font-code-mono text-phosphor-white">{unit.id}</td>
                      <td className="text-[color:var(--text-muted-on-dark)]">
                        Phase {unit.phase}
                      </td>
                      <td>
                        <span className={isEnrolled ? "chip chip-live" : "chip chip-outline"}>
                          {isEnrolled ? "ENROLLED" : "OPEN"}
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

      {gateRules.length > 0 ? <GatesSection rules={gateRules} lookup={gatesLookup} /> : null}

      {rebates.length > 0 ? <RebateSection rebates={rebates} /> : null}

      <section aria-labelledby="submissions-title" className="card-dark">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="submissions-title" className="heading-md">
            Your submissions
          </h2>
          <Link href="/submit" className="btn btn-quiet btn-sm">
            How to submit
          </Link>
        </div>

        <div className="mt-6">
          <SubmissionsBody result={submissionsResult} />
        </div>
      </section>
    </>
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
      <Link href={`/units/${unitId}`} className="btn btn-primary btn-sm">
        Open unit
      </Link>
    );
  }

  const priceLabel =
    price?.state === "ok" ? formatPrice(price.data.amount_cents, price.data.currency) : null;

  return (
    <form action={startCheckoutAction}>
      <input type="hidden" name="unit_id" value={unitId} />
      <button type="submit" className="btn btn-accent btn-sm">
        {priceLabel ? `Enroll for ${priceLabel}` : `Enroll in unit ${unitId}`}
      </button>
    </form>
  );
}

function gatesUnlocksSentence(rule: GateRule, cleared: boolean): string {
  if (rule.unlocks.length === 0) {
    return cleared ? "The capstone is cleared." : "This is the last gate in the program.";
  }
  const list = rule.unlocks.join(", ");
  return cleared ? `Units ${list} unlocked.` : `Passing unlocks units ${list}.`;
}

function GatesSection({ rules, lookup }: { rules: GateRule[]; lookup: GatesLookup }) {
  const passed = new Map<string, PassedGate>(
    lookup.state === "ok" ? lookup.data.gates_passed.map((g) => [g.gate_id, g]) : [],
  );

  return (
    <section aria-labelledby="gates-title" className="card-dark">
      <h2 id="gates-title" className="heading-md">
        Milestone gates
      </h2>
      <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
        Two gates decide what opens next. Each one needs a passing verdict on a single
        unit, and each one returns 15% of what you have paid.
      </p>

      {lookup.state !== "ok" ? (
        <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
          We could not load your gate status. Refresh in a moment.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Gate</th>
                <th scope="col">Status</th>
                <th scope="col">What it unlocks</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const clearedAt = passed.get(rule.gate_id);
                const cleared = clearedAt !== undefined;
                return (
                  <tr key={rule.gate_id}>
                    <td className="text-phosphor-white">{rule.title}</td>
                    <td>
                      <span className={cleared ? "chip chip-live" : "chip chip-outline"}>
                        {cleared ? "CLEARED" : "LOCKED"}
                      </span>
                    </td>
                    <td className="max-w-[52ch] text-[color:var(--text-muted-on-dark)]">
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
  "phase-5-integration": "Phase 5 integration gate (15% back)",
  capstone: "Capstone gate (15% back)",
};

function gateLabel(gateId: string): string {
  return GATE_LABELS[gateId] ?? gateId;
}

function rebateStatusLine(rebate: Rebate): string {
  const amount = formatPrice(rebate.amount_cents, rebate.currency);
  switch (rebate.status) {
    case "pending":
      return `Window open until ${formatUtc(rebate.window_ends_at)}. Pass the gate before then and ${amount} comes back to your card.`;
    case "earned":
      return `Earned ${amount} on ${formatUtc(rebate.earned_at ?? rebate.pledged_at)}. We refund it to your card by hand, so it lands a few days later.`;
    case "paid":
      return `Refunded ${amount} to your payment method on ${formatUtc(rebate.paid_at ?? rebate.earned_at ?? rebate.pledged_at)}.`;
    case "forfeited":
      return `Forfeited on ${formatUtc(rebate.forfeited_at ?? rebate.pledged_at)}.`;
    case "expired":
      return `Window closed on ${formatUtc(rebate.expired_at ?? rebate.window_ends_at)} without a passing verdict, so this one is gone.`;
  }
}

function RebateSection({ rebates }: { rebates: Rebate[] }) {
  return (
    <section aria-labelledby="rebates-title" className="card-dark">
      <h2 id="rebates-title" className="heading-md">
        Completion rebates
      </h2>
      <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
        Clear both gates inside their windows and 30% of what you paid comes back, 15% at a
        time. Each row carries its own deadline.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Gate</th>
              <th scope="col">Status</th>
              <th scope="col">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rebates.map((rebate) => (
              <tr key={rebate.gate_id}>
                <td className="text-phosphor-white">{gateLabel(rebate.gate_id)}</td>
                <td>
                  <span
                    className={
                      rebate.status === "earned" || rebate.status === "paid"
                        ? "chip chip-live"
                        : "chip chip-outline"
                    }
                  >
                    {rebate.status.toUpperCase()}
                  </span>
                </td>
                <td className="max-w-[52ch] text-[color:var(--text-muted-on-dark)]">
                  {rebateStatusLine(rebate)}
                </td>
              </tr>
            ))}
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
      aria-labelledby="rechecks-title"
      data-keel-section="spaced-rechecks"
      className="card-dark"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="rechecks-title" className="heading-md">
          Questions to re-answer
        </h2>
        <span className={dueSeeds.length > 0 ? "chip chip-live" : "chip chip-outline"}>
          {dueSeeds.length} DUE NOW
        </span>
      </div>

      <div className="mt-5">
        {!schedule ? (
          <p className="text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            We could not load your re-check schedule. Refresh in a moment.
          </p>
        ) : dueSeeds.length === 0 ? (
          <p className="max-w-[70ch] text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            Nothing due. A question you answered correctly comes back three days later, then
            seven days after that, so it sticks.
            {nextDueAt ? ` Next one: ${formatUtc(nextDueAt)}.` : ""}
          </p>
        ) : (
          <ul className="space-y-3">
            {dueSeeds.map((s) => (
              <li
                key={`${s.unit_id}-${s.seed_index}`}
                className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-circuit-border bg-carbon-veil p-4"
              >
                <div className="max-w-[62ch]">
                  <span className="font-code-mono text-[12px] text-moss-70">
                    Unit {s.unit_id} · question {s.seed_index + 1}
                  </span>
                  <p className="mt-2 text-[15px] leading-relaxed text-phosphor-white">
                    {s.seed_prompt}
                  </p>
                </div>
                <Link
                  href={`/units/${s.unit_id}#practice`}
                  className="btn btn-ghost btn-sm"
                >
                  Open drill
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function verdictLabel(sub: OwnSubmission): string {
  if (sub.overall === "pass") return "Passed";
  if (sub.overall === "fail") return "Not yet";
  return "Still grading";
}

function SubmissionsBody({
  result,
}: {
  result: EnrollResult<{ submissions: OwnSubmission[] }>;
}) {
  if (result.state === "unreachable" || result.state === "rejected") {
    return (
      <p className="text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
        We could not load your grading history. Refresh in a moment.
      </p>
    );
  }
  const submissions = result.data.submissions;
  if (submissions.length === 0) {
    return (
      <div>
        <p className="text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
          No submissions yet. You submit by pushing a commit and pasting its hash.
        </p>
        <Link href="/submit" className="btn btn-ghost btn-sm mt-5">
          Read the submission steps
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Submission</th>
            <th scope="col">Unit</th>
            <th scope="col">Stage</th>
            <th scope="col">Verdict</th>
            <th scope="col">Received (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id}>
              <td>
                <Link
                  href={`/submissions/${s.id}`}
                  className="text-fern-link underline underline-offset-4 hover:text-phosphor-white"
                >
                  #{s.id}
                </Link>
              </td>
              <td className="font-code-mono text-phosphor-white">{s.unit_id}</td>
              <td>
                <span className="chip chip-outline">{s.status.toUpperCase()}</span>
              </td>
              <td className="text-phosphor-white">{verdictLabel(s)}</td>
              <td className="text-[color:var(--text-muted-on-dark)]">
                {formatUtc(s.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
