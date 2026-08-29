import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Curriculum — Keel Academy",
  description: "Curriculum overview and units.",
};

export default function CurriculumPage() {
  const units = listUnits();

  return (
    <div>
      <h1>Curriculum</h1>
      <p>Available units and curriculum structure.</p>
      <section>
        <h2>Units</h2>
        <ul>
          {units.map((u) => (
            <li key={u.id}>
              <Link href={`/units/${u.id}`}>Unit {u.id}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
