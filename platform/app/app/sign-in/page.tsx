import type { Metadata } from "next";
import Link from "next/link";
import { authMode } from "@/lib/auth";
import { offlineSignInAction } from "@/app/auth/actions";
import { OfflineAuthNote } from "@/components/auth/offline-note";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  unknown: "No account uses that email address. Create one first.",
  "invalid-email": "That does not look like an email address.",
  mode: "This form only works in offline development mode.",
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
      <div className="shell section flex justify-center">
        <SignIn />
      </div>
    );
  }

  const errorBody = error ? ERRORS[error] : null;

  return (
    <div className="shell section">
      <div className="mx-auto max-w-[26rem]">
        <p className="eyebrow">Welcome back</p>
        <h1 className="heading-xl mt-4">Sign in</h1>

        {errorBody ? (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-circuit-border bg-carbon-veil p-4 text-[14.5px] leading-relaxed text-phosphor-white"
          >
            {errorBody}
          </p>
        ) : null}

        <form action={offlineSignInAction} className="mt-8">
          <input type="hidden" name="next" value={next ?? "/me"} />
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={email ?? ""}
            placeholder="you@example.com"
            className="field-input"
          />
          <button type="submit" className="btn btn-accent mt-6 w-full">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-[14.5px] text-[color:var(--text-muted-on-dark)]">
          No account yet?{" "}
          <Link
            href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
            className="text-fern-link underline underline-offset-4 hover:text-phosphor-white"
          >
            Create one
          </Link>
        </p>

        <OfflineAuthNote mode={mode} />
      </div>
    </div>
  );
}
