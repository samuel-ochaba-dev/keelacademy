import Link from "next/link";
import { listUnits } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";

export async function SiteHeader() {
  const units = listUnits();
  const first = units[0];
  const user = await getSessionUser();

  return (
    <header>
      <div>
        {/* Brand */}
        <div>
          <Link
            href="/"
          >
            <div>
              <span>Keel Academy</span>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav aria-label="Main navigation">
          <HeaderLink href="/curriculum">Curriculum</HeaderLink>
          {user ? <HeaderLink href="/map">Meridian Map</HeaderLink> : null}
          <HeaderLink href="/pricing">Pricing & Rebates</HeaderLink>
          <HeaderLink href="/submit">Submission Engine</HeaderLink>
          <HeaderLink href="/faq">FAQ</HeaderLink>
        </nav>

        {/* Auth + primary action */}
        <div>
          {user ? (
            <>
              <Link
                href="/me"
              >
                <span>{user.name ?? user.email}</span>
              </Link>
              <Link
                href="/sign-out"
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
              >
                Sign in
              </Link>
              {first ? (
                <Link href={`/units/${first.id}`}>
                  <span>Start Unit {first.id}</span>
                </Link>
              ) : null}
            </>
          )}
        </div>

        {/* Mobile menu (details-based, no client JS) */}
        <MobileMenu firstUnitId={first?.id ?? null} signedIn={Boolean(user)} />
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
    >
      {children}
    </Link>
  );
}

function MobileMenu({ firstUnitId, signedIn }: { firstUnitId: string | null; signedIn: boolean }) {
  return (
    <details data-header-menu>
      <summary
        aria-label="Open menu"
      >
        Menu
      </summary>
      <div>
        <nav aria-label="Mobile navigation">
          <MobileLink href="/curriculum">Curriculum</MobileLink>
          <MobileLink href="/pricing">Pricing</MobileLink>
          <MobileLink href="/submit">Submission Guide</MobileLink>
          <MobileLink href="/faq">FAQ</MobileLink>
          
          {signedIn ? (
            <>
              <MobileLink href="/map">Meridian Map</MobileLink>
              <MobileLink href="/me">Dashboard</MobileLink>
              <MobileLink href="/sign-out">Sign out</MobileLink>
            </>
          ) : (
            <MobileLink href="/sign-in">Sign in</MobileLink>
          )}
          {firstUnitId ? (
            <Link href={`/units/${firstUnitId}`}>
              Start Unit {firstUnitId}
            </Link>
          ) : null}
        </nav>
      </div>
    </details>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
    >
      {children}
    </Link>
  );
}
