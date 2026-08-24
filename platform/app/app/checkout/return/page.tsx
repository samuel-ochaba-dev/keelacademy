import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { fetchCheckoutStatus } from "@/lib/enroll";
import { IconCheckCircle, IconClock, IconArrowRight, IconCpu } from "@/components/icons";

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
    <div className="shell flex max-w-lg flex-col items-start py-24">
      {result?.state === "ok" && result.data.enrolled ? (
        <>
          <span className="grid size-12 place-items-center rounded-xl border border-pass/40 bg-pass/10 text-pass">
            <IconCheckCircle size={26} />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
            {unitId ? `Enrolled in Unit ${unitId}` : "Enrollment confirmed"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Payment confirmed{user.name ? ` for ${user.name}` : ""}. Your sandbox environment and
            token budget have been provisioned.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {unitId ? (
              <Link href={`/units/${unitId}`} className="btn-primary">
                Open Unit {unitId}
                <IconArrowRight size={15} />
              </Link>
            ) : null}
            <Link href="/me" className="btn-ghost">
              Go to dashboard
            </Link>
          </div>
        </>
      ) : result?.state === "ok" && result.data.status === "pending" ? (
        <>
          <span className="grid size-12 place-items-center rounded-xl border border-warn/40 bg-warn/10 text-warn">
            <IconClock size={26} />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Confirming payment</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            The webhook confirmation is processing. This usually completes in a few seconds.
          </p>

          <Link
            href={`/checkout/return?session_id=${encodeURIComponent(sessionId ?? "")}${unitId ? `&unit=${unitId}` : ""}`}
            className="btn-ghost mt-7"
          >
            Refresh status
          </Link>
        </>
      ) : (
        <>
          <span className="grid size-12 place-items-center rounded-xl border border-line-strong bg-raised text-accent">
            <IconCpu size={26} />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
            Processing confirmation
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Payment processing is handled externally. Check your dashboard in a moment.
          </p>

          <Link href="/me" className="btn-ghost mt-7">
            Return to dashboard
            <IconArrowRight size={14} />
          </Link>
        </>
      )}
    </div>
  );
}
