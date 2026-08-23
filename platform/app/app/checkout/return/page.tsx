import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { fetchCheckoutStatus } from "@/lib/enroll";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enrollment Status",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ session_id?: string; unit?: string }> };

const UNIT_RE = /^\d+\.\d+\.\d+$/;

export default async function CheckoutReturnPage({ searchParams }: Props) {
  const { session_id: sessionId, unit } = await searchParams;
  const user = await requireSession("/me");
  const unitId = unit && UNIT_RE.test(unit) ? unit : null;

  const result = sessionId ? await fetchCheckoutStatus(sessionId) : null;

  return (
    <div>
      {result?.state === "ok" && result.data.enrolled ? (
        <div>
          <h1>
            {unitId ? `Enrolled in Unit ${unitId}` : "Enrollment Confirmed"}
          </h1>
          <p>
            Payment confirmed{user.name ? ` for ${user.name}` : ""}. Your sandbox environment and token budget have been provisioned.
          </p>
          <p>
            {unitId ? (
              <Link href={`/units/${unitId}`}>
                Open Unit {unitId}
              </Link>
            ) : null}
            {" | "}
            <Link href="/me">
              Go to Dashboard
            </Link>
          </p>
        </div>
      ) : result?.state === "ok" && result.data.status === "pending" ? (
        <div>
          <h1>
            Confirming Payment
          </h1>
          <p>
            The webhook confirmation is processing. This usually completes in a few seconds.
          </p>
          <p>
            <Link href={`/checkout/return?session_id=${encodeURIComponent(sessionId ?? "")}${unitId ? `&unit=${unitId}` : ""}`}>
              Refresh Status
            </Link>
          </p>
        </div>
      ) : result?.state === "rejected" ? (
        <div>
          <h1>
            Checkout Record Not Found
          </h1>
          <p>
            The session reference did not match an active checkout. If you completed payment, the webhook will enroll you automatically.
          </p>
          <p>
            <Link href="/me">
              Go to Dashboard
            </Link>
          </p>
        </div>
      ) : (
        <div>
          <h1>
            Enrollment Service Unreachable
          </h1>
          <p>
            Payment processing is handled externally. Check your dashboard in a few moments.
          </p>
          <p>
            <Link href="/me">
              Go to Dashboard
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
