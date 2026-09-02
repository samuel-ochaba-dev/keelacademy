import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { fetchCheckoutStatus } from "@/lib/enroll";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enrollment status",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ session_id?: string; unit?: string }> };

// Unit ids are two or three segments (0.1, 3.2.1). This mirrors
// UNIT_ID_PATTERN in lib/content.ts and keeps a stray query string
// out of the link we render.
const UNIT_RE = /^\d+\.\d+(\.\d+)?$/;

export default async function CheckoutReturnPage({ searchParams }: Props) {
  const { session_id: sessionId, unit } = await searchParams;
  await requireSession("/me");
  const unitId = unit && UNIT_RE.test(unit) ? unit : null;

  const result = sessionId ? await fetchCheckoutStatus(sessionId) : null;

  return (
    <div className="shell section">
      {result?.state === "ok" && result.data.enrolled ? (
        <div className="card-dark max-w-[62ch]">
          <span className="chip chip-live">ENROLLED</span>
          <h1 className="heading-lg mt-4">
            {unitId ? `You are enrolled in unit ${unitId}` : "You are enrolled"}
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            The payment cleared and your account has access. Start with the lesson, then work
            through the drills before you build.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {unitId ? (
              <Link href={`/units/${unitId}`} className="btn btn-accent btn-sm">
                Open unit {unitId}
              </Link>
            ) : null}
            <Link href="/me" className="btn btn-ghost btn-sm">
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : result?.state === "ok" && result.data.status === "pending" ? (
        <div className="card-dark max-w-[62ch]">
          <span className="chip chip-outline">CONFIRMING</span>
          <h1 className="heading-lg mt-4">Confirming your payment</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            The payment provider is still telling us the charge went through. This usually
            takes a few seconds.
          </p>
          <Link
            href={`/checkout/return?session_id=${encodeURIComponent(sessionId ?? "")}${unitId ? `&unit=${unitId}` : ""}`}
            className="btn btn-primary btn-sm mt-7"
          >
            Check again
          </Link>
        </div>
      ) : (
        <div className="card-dark max-w-[62ch]">
          <span className="chip chip-outline">PROCESSING</span>
          <h1 className="heading-lg mt-4">We are still waiting on the payment provider</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            Your enrollment appears on your dashboard as soon as the charge is confirmed.
            Nothing is lost if you close this page.
          </p>
          <Link href="/me" className="btn btn-primary btn-sm mt-7">
            Back to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
