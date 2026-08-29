import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Cancelled — Keel Academy",
  robots: { index: false },
};

export default async function CheckoutCancelPage() {
  await requireSession("/me");

  return (
    <div>
      <h1>Checkout Cancelled</h1>
      <p>nothing was charged to your account.</p>
      <p>
        <Link href="/me">Return to Dashboard</Link>
      </p>
    </div>
  );
}
