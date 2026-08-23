import Link from "next/link";
import { listUnits } from "@/lib/content";

export function SiteFooter() {
  const units = listUnits();
  const first = units[0];

  return (
    <footer>
      <hr />
      <div>
        <p>
          <strong>[Academy Brand / Name Placeholder]</strong> · [Platform Tagline Placeholder]
        </p>
        <p>
          [Brief Platform Summary Description Placeholder]
        </p>

        <div>
          <h4>[Navigation Column Title]</h4>
          <ul>
            {first ? (
              <li>
                <Link href={`/units/${first.id}`}>
                  Unit {first.id} ([Live Status Placeholder])
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/submit">
                [Submit Link Placeholder]
              </Link>
            </li>
            <li>
              <Link href="/me">
                [Dashboard Link Placeholder]
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>[Methodology Column Title]</h4>
          <ul>
            <li>
              <a href="/#how-it-works">
                [Learning Loop Link Placeholder]
              </a>
            </li>
            <li>
              <a href="/#verification">
                [Verification Link Placeholder]
              </a>
            </li>
            <li>
              <a href="/#curriculum">
                [Curriculum Link Placeholder]
              </a>
            </li>
          </ul>
        </div>

        <p>
          [Footer Summary Note Placeholder]
        </p>
      </div>
    </footer>
  );
}
