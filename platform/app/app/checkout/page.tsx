import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  ensureStudent,
  fetchPrice,
  formatPrice,
} from "@/lib/enroll";
import { listUnits } from "@/lib/content";
import { startCheckoutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout & Enrollment — Keel Academy",
  description: "Complete your enrollment with transparent pricing and automated rebate wiring.",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ unit?: string }> };

export default async function CheckoutPage({ searchParams }: Props) {
  const { unit: unitParam } = await searchParams;
  const user = await getSessionUser();

  const units = listUnits();
  const selectedUnitId = unitParam ?? units[0]?.id ?? "3.2.1";

  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/checkout?unit=${selectedUnitId}`)}`);
  }

  const bridged = await ensureStudent(user);
  const priceResult = await fetchPrice(selectedUnitId);

  const unitPrice =
    priceResult.state === "ok"
      ? formatPrice(priceResult.data.amount_cents, priceResult.data.currency)
      : "$35";

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ENROLLMENT CHECKOUT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            Confirm Your Enrollment
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Review your target module, payment method terms, and completion rebate eligibility.
          </p>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Enrollment Summary Card */}
          <div className="md:col-span-7 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Enrollment Spec
              </span>
              <h2 className="text-lg font-mono font-bold text-zinc-100 mt-1">
                Target Unit: {selectedUnitId}
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-1">
                Full deterministic test harness, calibrated Layer 2 rubric judge, and defend-your-work evaluation.
              </p>
            </div>

            <div className="p-4 rounded-md bg-zinc-950/70 border border-zinc-800/80 space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center text-zinc-300">
                <span>Target Unit Module:</span>
                <span className="font-bold text-zinc-100">Unit {selectedUnitId}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>Account Identity:</span>
                <span className="text-zinc-400 truncate max-w-[200px]">{user.email}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>Grading Profile:</span>
                <span className="text-emerald-400">
                  {bridged.state === "ok" ? `#${bridged.data}` : "Ready to bridge"}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-200">Total Due Today:</span>
                <span className="text-emerald-400 font-mono text-base">{unitPrice}</span>
              </div>
            </div>

            {/* Guaranteed Rebates Reminder */}
            <div className="rounded-md border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-400">
                  COMPLETION REBATE GUARANTEE
                </span>
              </div>
              <p className="text-zinc-300 font-sans leading-relaxed">
                Clearing milestone gates automatically issues cash refunds directly back to your card via Stripe without manual claim filing.
              </p>
            </div>

            {/* Action Form */}
            <form action={startCheckoutAction} className="pt-2">
              <input type="hidden" name="unit_id" value={selectedUnitId} />
              <button
                type="submit"
                className="w-full rounded-md bg-emerald-500 py-3 text-sm font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg active:scale-[0.98]"
              >
                Proceed to Secure Payment ({unitPrice}) &rarr;
              </button>
            </form>
          </div>

          {/* Right: Security & Terms */}
          <div className="md:col-span-5 space-y-6 text-xs text-zinc-400">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5 space-y-3">
              <h3 className="font-mono font-bold uppercase tracking-wider text-zinc-200">
                Payment Security
              </h3>
              <p className="font-sans leading-relaxed">
                Payments are processed through Stripe over encrypted TLS. Keel Academy never stores your credit card numbers or billing secrets.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5 space-y-3">
              <h3 className="font-mono font-bold uppercase tracking-wider text-zinc-200">
                Instant Access
              </h3>
              <p className="font-sans leading-relaxed">
                Your unit workbench and test suite runners unlock immediately upon payment confirmation.
              </p>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/pricing"
                className="font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                &larr; Return to Pricing Options
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
