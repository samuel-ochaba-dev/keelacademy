import Link from "next/link";
import { authMode } from "@/lib/auth";

export function SiteFooter() {
  const isOffline = authMode() === "offline";

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded border border-zinc-700 bg-zinc-900">
                <span className="font-mono text-xs font-bold text-emerald-400">K_</span>
              </div>
              <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
                KEEL ACADEMY
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-sm">
              Keel Academy is a self-operating school for autonomous AI engineering.
              Zero teaching staff. Automated multi-layer verification. Real production deliverables.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[11px] font-mono text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Deterministic Grading Engine</span>
              </div>
              {isOffline && (
                <div className="inline-flex items-center gap-1.5 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] font-mono text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>Local Offline Mode</span>
                </div>
              )}
            </div>
          </div>

          {/* Curriculum Category */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Curriculum
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/curriculum"
                  className="transition-colors hover:text-zinc-100"
                >
                  Phase 0-3 Foundation
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="transition-colors hover:text-zinc-100"
                >
                  Meridian Pipeline
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum#verification"
                  className="transition-colors hover:text-zinc-100"
                >
                  Verification Engine
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum#defense"
                  className="transition-colors hover:text-zinc-100"
                >
                  Defend Your Work
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Category */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/me"
                  className="transition-colors hover:text-zinc-100"
                >
                  Submission Protocol
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-zinc-100"
                >
                  Sandbox CI & Rubrics
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="transition-colors hover:text-zinc-100"
                >
                  Completion Rebates
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-zinc-100"
                >
                  Spaced Retrieval System
                </Link>
              </li>
            </ul>
          </div>

          {/* Principles Category */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 font-mono">
              Principles
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="text-zinc-300">Radical Honesty</li>
              <li className="text-zinc-300">Zero Mentors / Zero Fluff</li>
              <li className="text-zinc-300">Proof Before Credentials</li>
              <li className="pt-1">
                <Link
                  href="/faq"
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Read the Charter &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/80 pt-8 sm:flex-row text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Keel Academy. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="rounded bg-zinc-900 px-2 py-0.5 text-zinc-400 border border-zinc-800">
              v2.0-clean-slate
            </span>
            <span>Zero Teaching Staff</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

