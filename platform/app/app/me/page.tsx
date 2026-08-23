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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Progress",
  robots: { index: false },
};

const CHECKOUT_ERRORS: Record<string, string> = {
  unreachable: "The enrollment service is unreachable. Please try again in a few moments.",
  app_not_configured: "The app is missing its enrollment secret (KEEL_ENROLL_SECRET).",
  stripe_not_wired: "Payment processing is not configured on the enrollment server.",
  stripe_unreachable: "Payment service did not answer. No charges were made.",
  stripe_error: "Payment processor rejected the request. Nothing was charged.",
  email_linked_to_other_account: "This email is linked to a different account. Sign in with that account to enroll.",
};

type Props = { searchParams: Promise<{ checkout?: string }> };

export default async function MePage({ searchParams }: Props) {
  const { checkout } = await searchParams;
  const user = await requireSession("/me");
  const bridged = await ensureStudent(user);

  return (
    <div>
      {/* Learner Profile Header */}
      <header>
        <p><strong>Learner Profile</strong></p>
        <h1>{user.name ?? user.email}</h1>
        <p>
          {user.email} · {bridged.state === "ok" ? `Grading ID #${bridged.data}` : "No grading profile"}
        </p>

        {checkout ? (
          <div role="alert">
            <p><strong>Error:</strong> {CHECKOUT_ERRORS[checkout] ?? "Checkout could not start. Nothing was charged."}</p>
          </div>
        ) : null}
      </header>

      <hr />

      {bridged.state === "ok" ? (
        <EnrolledSections studentId={bridged.data} />
      ) : (
        <section>
          <h2>Enrollment Service Paused</h2>
          <p>
            The enrollment service is temporarily unavailable. Your signed-in session is active;
            refresh in a moment to reload your grading profile.
          </p>
        </section>
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
    profileResult.state === "ok"
      ? profileResult.data.enrollments.map((e) => e.unit_id)
      : [],
  );
  const prices = new Map<string, EnrollResult<{ amount_cents: number; currency: string }>>();
  await Promise.all(
    units
      .filter((u) => !enrolledUnits.has(u.id))
      .map(async (u) => prices.set(u.id, await fetchPrice(u.id))),
  );
  const budget = profileResult.state === "ok" ? profileResult.data.budget : null;
  const rebates = profileResult.state === "ok" ? profileResult.data.rebates : [];

  return (
    <>
      {/* Token Budget */}
      {budget ? (
        <section>
          <h2>Grading Token Budget</h2>
          <p>
            <strong>Used:</strong> {budget.tokens_used.toLocaleString("en-US")} / {budget.tokens_cap.toLocaleString("en-US")} tokens
          </p>
        </section>
      ) : null}

      <hr />

      {/* Units Section */}
      <section>
        <h2>Curriculum Units</h2>
        {profileResult.state !== "ok" ? (
          <p>Unable to load unit enrollments right now. Please refresh.</p>
        ) : (
          <table border={1}>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Phase</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td><strong>Unit {unit.id}</strong></td>
                  <td>Phase {unit.phase}</td>
                  <td>{enrolledUnits.has(unit.id) ? "Enrolled" : "Not enrolled"}</td>
                  <td>
                    <UnitRowAction
                      unitId={unit.id}
                      enrolled={enrolledUnits.has(unit.id)}
                      price={prices.get(unit.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <hr />

      {/* Rebates Section */}
      {rebates.length > 0 ? <RebateSection rebates={rebates} /> : null}

      {/* Submissions History */}
      <section>
        <h2>Submission History</h2>
        <SubmissionsBody result={submissionsResult} />
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
      <Link href={`/units/${unitId}`}>
        Open Unit {unitId}
      </Link>
    );
  }

  const priceLabel =
    price?.state === "ok" ? formatPrice(price.data.amount_cents, price.data.currency) : null;

  return (
    <form action={startCheckoutAction}>
      <input type="hidden" name="unit_id" value={unitId} />
      <button type="submit">
        {priceLabel ? `Enroll (${priceLabel})` : `Enroll in Unit ${unitId}`}
      </button>
    </form>
  );
}

const GATE_LABELS: Record<string, string> = {
  "phase-5-integration": "Phase 5 Integration Gate",
  capstone: "Final Capstone Defense",
};

function gateLabel(gateId: string): string {
  return GATE_LABELS[gateId] ?? gateId;
}

function rebateStatusLine(rebate: Rebate): string {
  const amount = formatPrice(rebate.amount_cents, rebate.currency);
  switch (rebate.status) {
    case "pending":
      return `Target window open until ${formatUtc(rebate.window_ends_at)}. Credit is earned automatically upon verified gate passage.`;
    case "earned":
      return `Earned ${amount} on ${formatUtc(rebate.earned_at ?? rebate.pledged_at)}. Payout is processed through the refund runbook.`;
    case "paid":
      return `Refund of ${amount} was issued to your payment method on ${formatUtc(rebate.paid_at ?? rebate.earned_at ?? rebate.pledged_at)}.`;
    case "forfeited":
      return `Forfeited on ${formatUtc(rebate.forfeited_at ?? rebate.pledged_at)}.`;
    case "expired":
      return `Target window expired on ${formatUtc(rebate.expired_at ?? rebate.window_ends_at)} without a verified pass.`;
  }
}

function RebateSection({ rebates }: { rebates: Rebate[] }) {
  return (
    <section>
      <h2>Completion Rebate Ledger</h2>
      <p>
        Portions of your enrollment fee refunded upon verified gate passage inside your target window.
      </p>

      <table border={1}>
        <thead>
          <tr>
            <th>Milestone</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {rebates.map((rebate) => (
            <tr key={rebate.gate_id}>
              <td><strong>{gateLabel(rebate.gate_id)}</strong></td>
              <td><em>{rebate.status.toUpperCase()}</em></td>
              <td>{rebateStatusLine(rebate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
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
      <p>Grading history is temporarily unavailable. Refresh in a moment.</p>
    );
  }
  const submissions = result.data.submissions;
  if (submissions.length === 0) {
    return (
      <div>
        <p>No submissions found yet for this account.</p>
        <p>
          <Link href="/submit">
            View submission instructions
          </Link>
        </p>
      </div>
    );
  }

  return (
    <table border={1}>
      <thead>
        <tr>
          <th>Submission ID</th>
          <th>Unit</th>
          <th>Status</th>
          <th>Overall Verdict</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((s) => (
          <tr key={s.id}>
            <td>
              <Link href={`/submissions/${s.id}`}>
                #{s.id}
              </Link>
            </td>
            <td>Unit {s.unit_id}</td>
            <td>{s.status}</td>
            <td><strong>{s.overall ? s.overall.toUpperCase() : "—"}</strong></td>
            <td>{formatUtc(s.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
