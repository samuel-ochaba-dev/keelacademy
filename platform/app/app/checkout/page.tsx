import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { fetchPrice, formatPrice } from "@/lib/enroll";
import { isUnitAuthored } from "@/lib/content";
import { CommitmentForm } from "@/components/commitment-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ unit?: string }> };

export default async function CheckoutPage({ searchParams }: Props) {
  const user = await requireSession("/checkout");
  const { unit } = await searchParams;
  const unitId = unit || "0.1";

  if (!isUnitAuthored(unitId)) {
    return (
      <div className="shell section">
        <div className="card-dark max-w-[62ch]">
          <p className="eyebrow">Nothing to buy here</p>
          <h1 className="heading-lg mt-3">Unit {unitId} does not exist yet</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            You can only enroll in a unit that exists. Nothing was charged.
          </p>
          <Link href="/curriculum" className="btn btn-ghost btn-sm mt-7">
            See what is written
          </Link>
        </div>
      </div>
    );
  }

  const priceRes = await fetchPrice(unitId);

  if (priceRes.state !== "ok") {
    return (
      <div className="shell section">
        <div className="card-dark max-w-[62ch]">
          <p className="eyebrow">Checkout unavailable</p>
          <h1 className="heading-lg mt-3">We could not load the price</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            We could not load the price, so we will not guess at a number. Nothing
            was charged. Refresh and try again.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/checkout?unit=${unitId}`} className="btn btn-primary btn-sm">
              Try again
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-sm">
              Back to pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const amountCents = priceRes.data.amount_cents;
  const currency = priceRes.data.currency;
  const priceLabel = formatPrice(amountCents, currency);

  return (
    <div className="shell section">
      <header className="max-w-[62ch]">
        <p className="eyebrow">Checkout</p>
        <h1 className="heading-xl mt-4">Enroll in unit {unitId}</h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
          One unit, paid once. You keep access. Clearing a milestone gate sends
          15% back to the card you used.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="details-title" className="card-dark">
          <h2 id="details-title" className="heading-md">
            What you are buying
          </h2>
          <dl className="mt-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[color:var(--line-on-dark)] pb-4">
              <dt className="text-[14px] text-[color:var(--text-muted-on-dark)]">Account</dt>
              <dd className="text-[15px] text-phosphor-white">{user.email}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[color:var(--line-on-dark)] pb-4">
              <dt className="text-[14px] text-[color:var(--text-muted-on-dark)]">Unit</dt>
              <dd className="font-code-mono text-[15px] text-phosphor-white">{unitId}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[color:var(--line-on-dark)] pb-4">
              <dt className="text-[14px] text-[color:var(--text-muted-on-dark)]">Price</dt>
              <dd className="stat-number">{priceLabel}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <dt className="text-[14px] text-[color:var(--text-muted-on-dark)]">
                Back at each gate
              </dt>
              <dd className="text-[15px] text-phosphor-white">
                {formatPrice(Math.round(amountCents * 0.15), currency)}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="commit-title" className="card-dark">
          <h2 id="commit-title" className="heading-md">
            Three things to agree to
          </h2>
          <CommitmentForm unitId={unitId} priceLabel={priceLabel} />
        </section>
      </div>

      <p className="mt-8">
        <Link
          href="/pricing"
          className="text-[15px] text-fern-link underline underline-offset-4 hover:text-phosphor-white"
        >
          Back to pricing
        </Link>
      </p>
    </div>
  );
}
