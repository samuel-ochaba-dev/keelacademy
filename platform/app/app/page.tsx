import Link from "next/link";
import { listUnits, loadUnit } from "@/lib/content";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const units = listUnits();
  const first = units[0];
  const firstUnit = first ? loadUnit(first.id) : null;

  return (
    <div>
      <h1>Keel Academy</h1>
      <p>Applied AI engineering curriculum and automated grading platform.</p>

      <section>
        <h2>Available Units</h2>
        <ul>
          {units.map((u) => (
            <li key={u.id}>
              <Link href={`/units/${u.id}`}>
                Unit {u.id}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {firstUnit?.lesson ? (
        <section>
          <h2>Featured Unit: {firstUnit.lesson.title}</h2>
          <p>
            <Link href={`/units/${firstUnit.yaml.id}`}>Open Unit {firstUnit.yaml.id}</Link>
          </p>
        </section>
      ) : null}

      <section>
        <h2>Navigation</h2>
        <ul>
          <li><Link href="/curriculum">Curriculum</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/submit">Submit</Link></li>
          <li><Link href="/faq">FAQ</Link></li>
          <li><Link href="/me">Dashboard</Link></li>
        </ul>
      </section>
    </div>
  );
}
