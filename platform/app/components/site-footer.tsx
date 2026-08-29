import Link from "next/link";
import { listUnits } from "@/lib/content";

export function SiteFooter() {
  const units = listUnits();
  const first = units[0];

  return (
    <footer>
      <div>
        <p>Keel Academy</p>
      </div>
      <nav aria-label="Footer navigation">
        <ul>
          <li><Link href="/curriculum">Curriculum</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/submit">Submit</Link></li>
          <li><Link href="/faq">FAQ</Link></li>
          {first ? <li><Link href={`/units/${first.id}`}>Unit {first.id}</Link></li> : null}
        </ul>
      </nav>
      <div>
        <p>© {new Date().getFullYear()} Keel Academy</p>
      </div>
    </footer>
  );
}
