import type { Metadata } from "next";
import Link from "next/link";
import { authMode } from "@/lib/auth";
import { offlineSignUpAction } from "@/app/auth/actions";
import { OfflineAuthNote } from "@/components/auth/offline-note";

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
      <div>
        <SignUp />
      </div>
    );
  }

  const errorBody = error ? ERRORS[error] : null;

  return (
    <div>
      <div>
        <div>
          
          <div>
            <span>
              NEW STUDENT PROVISIONING
            </span>
            <h1>Create your account</h1>
          </div>
        </div>

        <p>
          Use the same email you commit with on GitHub so your project submissions link automatically.
        </p>

        {errorBody ? (
          <div
            role="alert"
          >
            <p>{errorBody}</p>
          </div>
        ) : null}

        <form action={offlineSignUpAction}>
          <input type="hidden" name="next" value={next ?? "/me"} />

          <div>
            <label htmlFor="name">
              FULL NAME
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Ada Lovelace"
            />
          </div>

          <div>
            <label htmlFor="email">
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
            />
          </div>

          <button type="submit">
            <span>PROVISION LEARNER ACCOUNT</span>
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <Link
            href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}
          >
            SIGN IN
          </Link>
        </p>
      </div>

      <OfflineAuthNote mode={mode} />
    </div>
  );
}
