import Link from "next/link";
import { listUnits } from "@/lib/content";

export function SiteFooter() {
  const units = listUnits();
  const first = units[0];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-base font-semibold">Keel Academy</p>
            <p className="mt-2 text-sm text-ink-soft">
              A self-paced school for AI engineering. One real system, thirteen
              phases, every deliverable graded. No videos, no seat-time credit.
            </p>
          </div>

          <nav aria-label="Program">
            <p className="eyebrow">The program</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/curriculum" className="no-underline">
                  Curriculum
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="no-underline">
                  Pricing and the rebate
                </Link>
              </li>
              <li>
                <Link href="/faq" className="no-underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Students">
            <p className="eyebrow">Students</p>
            <ul className="mt-3 space-y-2 text-sm">
              {first ? (
                <li>
                  <Link href={`/units/${first.id}`} className="no-underline">
                    Unit {first.id} (live)
                  </Link>
                </li>
              ) : null}
              <li>
                <Link href="/sign-in" className="no-underline">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/me" className="no-underline">
                  My progress
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-line pt-6 text-sm text-ink-soft">
          Honest status: Unit 3.2.1 is the only unit live today, graded end to
          end. The rest of the curriculum is a published spec, built phase by
          phase in the open. You can read all of it before paying anything.
        </p>
        <p className="mt-2 text-sm text-ink-soft">© 2026 Keel Academy</p>
      </div>
    </footer>
  );
}
