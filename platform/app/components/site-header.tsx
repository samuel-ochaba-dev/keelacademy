import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Live Verification Badge */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-zinc-100 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 shadow-inner group-hover:border-zinc-500">
              <span className="font-mono text-sm font-bold tracking-tighter text-emerald-400">
                K_
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
                KEEL<span className="text-zinc-500">.ACADEMY</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-zinc-400 uppercase sm:hidden">
                Self-Operating
              </span>
            </div>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono">Engine Active</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-300"
        >
          <Link
            href="/curriculum"
            className="rounded-md px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          >
            Curriculum
          </Link>
          <Link
            href="/map"
            className="rounded-md px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          >
            Meridian Map
          </Link>
          <Link
            href="/me"
            className="rounded-md px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          >
            Verification & Submissions
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
          >
            Pricing & Rebates
          </Link>
        </nav>

        {/* User Account & Session Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/me"
                className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-mono text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
                title={user.email}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span className="max-w-[140px] truncate sm:max-w-[200px]">
                  {user.name || user.email.split("@")[0]}
                </span>
              </Link>
              <Link
                href="/sign-out"
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
              >
                Sign out
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md border border-zinc-700 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

