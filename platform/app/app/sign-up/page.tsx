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
      <div className="rounded-lg border border-line bg-raised p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <span className="grid size-9 place-items-center rounded border border-line-strong bg-inset text-accent">
            <IconKeelLogo size={18} />
          </span>
          <div>
            <span className="font-mono text-[9px] text-accent uppercase tracking-wider font-semibold block">
              NEW STUDENT PROVISIONING
            </span>
            <h1 className="text-lg font-semibold tracking-tight text-ink">Create your account</h1>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink-3">
          Use the same email you commit with on GitHub so your project submissions link automatically.
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

        <form action={offlineSignUpAction} className="space-y-4 font-mono">
          <input type="hidden" name="next" value={next ?? "/me"} />

          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-[11px] uppercase tracking-wider text-ink-3">
              FULL NAME
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Ada Lovelace"
              className="w-full rounded border border-line bg-inset px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none"
            />
          </div>

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
            <span>PROVISION LEARNER ACCOUNT</span>
            <IconArrowRight size={13} />
          </button>
        </form>

        <p className="border-t border-line pt-4 font-mono text-[11px] text-ink-3">
          Already have an account?{" "}
          <Link
            href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
            className="text-accent hover:underline font-semibold"
          >
            SIGN IN
          </Link>
        </p>
      </div>

      <OfflineAuthNote mode={mode} />
    </div>
  );
}
