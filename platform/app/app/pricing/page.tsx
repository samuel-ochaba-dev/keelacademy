import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing — Keel Academy",
  description: "Pricing and enrollment options.",
};

export default function PricingPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div>
      <h1>Pricing</h1>
      <p>Enrollment pricing and details.</p>
      {first ? (
        <p>
          <Link href={`/units/${first.id}`}>Start Unit {first.id}</Link>
        </p>
      ) : null}
    </div>
  );
}
