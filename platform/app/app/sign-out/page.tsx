import type { Metadata } from "next";
import Link from "next/link";
import { authMode, getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Out — Keel Academy",
  robots: { index: false },
};

export default async function SignOutPage() {
  const mode = authMode();
  const user = await getSessionUser();

  if (mode === "clerk") {
    const { SignOutButton } = await import("@clerk/nextjs");
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
        <SignOutButton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-sm text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-mono font-medium text-zinc-400">
            <span>SESSION REVOCATION</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-zinc-50">Sign Out</h1>
          {user ? (
            <p className="text-xs text-zinc-400 font-mono">
              Currently signed in as: <span className="text-zinc-200">{user.name ?? user.email}</span>
            </p>
          ) : (
            <p className="text-xs text-zinc-400 font-sans">You are currently not signed in.</p>
          )}
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-800 border border-zinc-700 py-2.5 text-sm font-mono font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors active:scale-[0.99]"
          >
            Confirm Sign Out &rarr;
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-800/80">
          <Link
            href="/me"
            className="text-xs font-mono text-emerald-400 hover:underline"
          >
            &larr; Return to Learner Cockpit
          </Link>
        </div>
      </div>
    </div>
  );
}

