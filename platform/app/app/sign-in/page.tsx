import type { Metadata } from "next";
import Link from "next/link";
import { authMode } from "@/lib/auth";
import { offlineSignInAction } from "@/app/auth/actions";
import { OfflineAuthNote } from "@/components/auth/offline-note";
import { IconKeelLogo, IconArrowRight, IconAlertTriangle } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In",
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
      <div className="shell flex max-w-md justify-center py-20">
        <SignIn />
      </div>
    );
  }

  const errorBody = error ? ERRORS[error] : null;

  return (
    <div className="shell flex max-w-md flex-col py-16 sm:py-24">
      <div className="rounded-lg border border-line bg-raised p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <span className="grid size-9 place-items-center rounded border border-line-strong bg-inset text-accent">
            <IconKeelLogo size={18} />
          </span>
          <div>
            <span className="font-mono text-[9px] text-accent uppercase tracking-wider font-semibold block">
              AUTHENTICATION TERMINAL
            </span>
            <h1 className="text-lg font-semibold tracking-tight text-ink">Sign in to Keel Academy</h1>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink-3">
          Sign in to access your workbench, inspect grading verdicts, and continue building.
        </p>

        {errorBody ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded border border-fail/40 bg-fail-soft p-3.5"
          >
            <IconAlertTriangle size={14} className="mt-0.5 shrink-0 text-fail" />
            <p className="text-xs leading-relaxed text-ink-2 font-mono">{errorBody}</p>
          </div>
        ) : null}

        <form action={offlineSignInAction} className="space-y-4 font-mono">
          <input type="hidden" name="next" value={next ?? "/me"} />

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] uppercase tracking-wider text-ink-3">
              GITHUB COMMIT EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email ?? ""}
              placeholder="developer@example.com"
              className="w-full rounded border border-line bg-inset px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none"
            />
          </div>

          <button type="submit" className="btn-primary w-full py-2.5 text-xs justify-center font-mono uppercase tracking-wider">
            <span>AUTHENTICATE & ENTER</span>
            <IconArrowRight size={13} />
          </button>
        </form>

        <p className="border-t border-line pt-4 font-mono text-[11px] text-ink-3">
          Don&apos;t have an account yet?{" "}
          <Link
            href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
            className="text-accent hover:underline font-semibold"
          >
            CREATE ONE
          </Link>
        </p>
      </div>

      <OfflineAuthNote mode={mode} />
    </div>
  );
}
