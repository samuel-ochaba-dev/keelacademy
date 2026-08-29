import type { Metadata } from "next";
import Link from "next/link";
import { authMode } from "@/lib/auth";
import { offlineSignUpAction } from "@/app/auth/actions";
import { OfflineAuthNote } from "@/components/auth/offline-note";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up — Keel Academy",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  exists: "An account already exists with that email. Please sign in instead.",
  "invalid-email": "Please enter a valid email address.",
  invalid: "The name or email provided exceeds character limits.",
  mode: "This sign-up form is configured for offline development mode.",
};

type Props = {
  searchParams: Promise<{ error?: string; email?: string; next?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const { error, email, next } = await searchParams;
  const mode = authMode();

  if (mode === "clerk") {
    const { SignUp } = await import("@clerk/nextjs");
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
        <SignUp />
      </div>
    );
  }

  const errorBody = error ? ERRORS[error] : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
            <span>START YOUR BENCH</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-zinc-50">Create Keel Account</h1>
          <p className="text-xs text-zinc-400 font-sans">
            Mint your identity to start submitting against automated verification suites.
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

        <form action={offlineSignUpAction} className="space-y-4">
          <input type="hidden" name="next" value={next ?? "/me"} />
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-mono font-medium text-zinc-300">
              Full name <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Ada Lovelace"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

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
            Create Account &rarr;
          </button>
        </form>

        <div className="text-center text-xs font-mono text-zinc-400">
          Already have an account?{" "}
          <Link
            href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
            className="text-emerald-400 hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>

        <div className="pt-2 border-t border-zinc-800/80">
          <OfflineAuthNote mode={mode} />
        </div>
      </div>
    </div>
  );
}

