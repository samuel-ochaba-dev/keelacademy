import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false },
};

export default async function CheckoutCancelPage() {
  await requireSession("/me");
  return (
    <div>
      

      <h1>Checkout cancelled</h1>
      <p>
        Nothing was charged to your card. You can resume enrollment whenever you are ready from your
        dashboard.
      </p>

      <Link href="/me">
        Return to dashboard
      </Link>
    </div>
  );
}
