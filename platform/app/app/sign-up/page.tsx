import type { Metadata } from "next";
import Link from "next/link";
import { authMode } from "@/lib/auth";
import { offlineSignUpAction } from "@/app/auth/actions";
import { OfflineAuthNote } from "@/components/auth/offline-note";
import { IconKeelLogo, IconArrowRight, IconAlertTriangle } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an Account",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  exists: "An account already exists with that email. Sign in instead.",
  "invalid-email": "Please enter a valid email address.",
  invalid: "The name or email provided is too long.",
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
      <div className="shell flex max-w-md justify-center py-20">
        <SignUp />
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
          <h1 className="text-xl font-semibold tracking-tight text-ink">Create learner account</h1>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Use the same email address as your git commits so submissions link automatically.
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

        <form action={offlineSignUpAction} className="mt-6 space-y-5">
          <input type="hidden" name="next" value={next ?? "/me"} />

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-ink">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Ada Lovelace"
              className="w-full rounded-lg border border-line-strong bg-inset px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3/70 focus:border-accent/60 focus:outline-none"
            />
          </div>

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
            Create account
            <IconArrowRight size={15} />
          </button>
        </form>

        <p className="mt-6 border-t border-line pt-5 text-sm text-ink-3">
          Already have an account?{" "}
          <Link
            href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
            className="font-medium text-accent hover:text-accent-strong"
          >
            Sign in
          </Link>
        </p>
      </div>

      <OfflineAuthNote mode={mode} />
    </div>
  );
}
