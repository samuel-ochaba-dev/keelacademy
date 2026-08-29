import type { Metadata } from "next";
import Link from "next/link";
import { authMode } from "@/lib/auth";
import { offlineSignInAction } from "@/app/auth/actions";
import { OfflineAuthNote } from "@/components/auth/offline-note";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In — Keel Academy",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  unknown: "No account found with that email address. Please create an account first.",
  "invalid-email": "Please enter a valid email address.",
  mode: "This sign-in form is configured for offline development mode.",
};

type Props = {
  searchParams: Promise<{ error?: string; email?: string; next?: string }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const { error, email, next } = await searchParams;
  const mode = authMode();

  if (mode === "clerk") {
    const { SignIn } = await import("@clerk/nextjs");
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
        <SignIn />
      </div>
    );
  }

  const errorBody = error ? ERRORS[error] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            <span>STUDENT AUTHENTICATION</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-zinc-50">Sign In to Keel</h1>
          <p className="text-xs text-zinc-400 font-sans">
            Access your learner cockpit, submission ledger, and workbench.
          </p>
        </div>

        {errorBody && (
          <div
            role="alert"
            className="rounded-md border border-red-500/30 bg-red-950/30 p-3 text-xs font-mono text-red-200"
          >
            {errorBody}
          </div>
        )}

        <form action={offlineSignInAction} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/me"} />
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-mono font-medium text-zinc-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email ?? ""}
              placeholder="developer@example.com"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-emerald-500 py-2.5 text-sm font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow active:scale-[0.99]"
          >
            Sign In &rarr;
          </button>
        </form>

        <div className="text-center text-xs font-mono text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Sign up
          </Link>
        </div>

        <div className="pt-2 border-t border-zinc-800/80">
          <OfflineAuthNote mode={mode} />
        </div>
      </div>
    </div>
  );
}

