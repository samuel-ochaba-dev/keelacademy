import Link from "next/link";
import { listUnits } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";

export async function SiteHeader() {
  const units = listUnits();
  const first = units[0];
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="font-display text-lg font-semibold text-ink no-underline">
          Keel Academy
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link href="/curriculum" className="hidden no-underline sm:inline">
            Curriculum
          </Link>
          <Link href="/pricing" className="hidden no-underline sm:inline">
            Pricing
          </Link>
          <Link href="/faq" className="hidden no-underline sm:inline">
            FAQ
          </Link>
          {user ? (
            <>
              <Link href="/me" className="no-underline">
                My progress
              </Link>
              <Link href="/sign-out" className="no-underline text-ink-soft">
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="no-underline text-ink-soft">
                Sign in
              </Link>
              {first ? (
                <Link href={`/units/${first.id}`} className="btn-primary !py-1.5 !px-3 text-sm">
                  Start Unit {first.id}
                </Link>
              ) : null}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
