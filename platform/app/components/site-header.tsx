import Link from "next/link";
import { listUnits } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";
import { IconKeelLogo, IconArrowRight, IconMenu, IconX } from "@/components/icons";

export async function SiteHeader() {
  const units = listUnits();
  const first = units[0];
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground/85 backdrop-blur-md">
      <div className="shell-wide flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-ink transition-opacity hover:opacity-85"
          >
            <span className="grid size-9 place-items-center rounded-lg border border-line-strong bg-raised text-accent">
              <IconKeelLogo size={19} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Keel Academy</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <HeaderLink href="/curriculum">Curriculum</HeaderLink>
          <HeaderLink href="/pricing">Pricing</HeaderLink>
          <HeaderLink href="/submit">Submission Guide</HeaderLink>
          <HeaderLink href="/faq">FAQ</HeaderLink>
        </nav>

        {/* Auth + primary action */}
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                href="/me"
                className="flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 text-sm text-ink-2 transition-colors hover:border-accent/50 hover:text-ink"
              >
                <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                <span className="max-w-[180px] truncate">{user.name ?? user.email}</span>
              </Link>
              <Link
                href="/sign-out"
                className="px-2 py-2 text-sm text-ink-3 transition-colors hover:text-ink"
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                Sign in
              </Link>
              {first ? (
                <Link href={`/units/${first.id}`} className="btn-primary">
                  Start Unit {first.id}
                  <IconArrowRight size={15} />
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
      className="rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-raised hover:text-ink"
    >
      {children}
    </Link>
  );
}

function MobileMenu({ firstUnitId, signedIn }: { firstUnitId: string | null; signedIn: boolean }) {
  return (
    <details className="group relative lg:hidden" data-header-menu>
      <summary
        className="grid size-10 cursor-pointer list-none place-items-center rounded-lg border border-line-strong text-ink-2 transition-colors hover:text-ink group-open:text-ink"
        aria-label="Open menu"
      >
        <span className="grid group-open:hidden">
          <IconMenu size={20} />
        </span>
        <span className="hidden group-open:grid">
          <IconX size={20} />
        </span>
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-line bg-raised p-2 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]">
        <nav aria-label="Mobile navigation" className="flex flex-col">
          <MobileLink href="/curriculum">Curriculum</MobileLink>
          <MobileLink href="/pricing">Pricing</MobileLink>
          <MobileLink href="/submit">Submission Guide</MobileLink>
          <MobileLink href="/faq">FAQ</MobileLink>
          <div className="my-2 border-t border-line" />
          {signedIn ? (
            <>
              <MobileLink href="/me">Dashboard</MobileLink>
              <MobileLink href="/sign-out">Sign out</MobileLink>
            </>
          ) : (
            <MobileLink href="/sign-in">Sign in</MobileLink>
          )}
          {firstUnitId ? (
            <Link href={`/units/${firstUnitId}`} className="btn-primary mt-2 w-full">
              Start Unit {firstUnitId}
              <IconArrowRight size={15} />
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
      className="rounded-lg px-3 py-2.5 text-sm text-ink-2 transition-colors hover:bg-raised-2 hover:text-ink"
    >
      {children}
    </Link>
  );
}
