import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { IconAlertTriangle, IconArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false },
};

export default async function CheckoutCancelPage() {
  await requireSession("/me");
  return (
    <div className="shell flex max-w-lg flex-col items-start py-24">
      <span className="grid size-12 place-items-center rounded-xl border border-warn/40 bg-warn/10 text-warn">
        <IconAlertTriangle size={24} />
      </span>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Checkout cancelled</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-2">
        Nothing was charged to your card. You can resume enrollment whenever you are ready from your
        dashboard.
      </p>

      <Link href="/me" className="btn-primary mt-7">
        Return to dashboard
        <IconArrowRight size={15} />
      </Link>
    </div>
  );
}
