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
      <div className="panel p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-line-strong bg-inset text-accent">
            <IconKeelLogo size={20} />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Sign in to Keel Academy</h1>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Access your unit enrollments, submission verdicts, and token budget.
        </p>

        {errorBody ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-lg border border-fail/40 bg-fail/5 px-4 py-3"
          >
            <IconAlertTriangle size={15} className="mt-0.5 shrink-0 text-fail" />
            <p className="text-[13px] leading-relaxed text-ink-2">{errorBody}</p>
          </div>
        ) : null}

        <form action={offlineSignInAction} className="mt-6 space-y-5">
          <input type="hidden" name="next" value={next ?? "/me"} />

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-ink">
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
              className="w-full rounded-lg border border-line-strong bg-inset px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3/70 focus:border-accent/60 focus:outline-none"
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3">
            Sign in
            <IconArrowRight size={15} />
          </button>
        </form>

        <p className="mt-6 border-t border-line pt-5 text-sm text-ink-3">
          Don&apos;t have an account yet?{" "}
          <Link
            href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
            className="font-medium text-accent hover:text-accent-strong"
          >
            Create an account
          </Link>
        </p>
      </div>

      <OfflineAuthNote mode={mode} />
    </div>
  );
}
