import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false },
};

export default async function CheckoutCancelPage() {
  await requireSession("/me");

  return (
    <div className="shell section">
      <div className="card-dark max-w-[62ch]">
        <span className="chip chip-outline">CANCELLED</span>
        <h1 className="heading-lg mt-4">Checkout cancelled</h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
          You left before paying, so nothing was charged. The unit stays open
          whenever you are ready.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/pricing" className="btn btn-primary btn-sm">
            Back to pricing
          </Link>
          <Link href="/me" className="btn btn-ghost btn-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
