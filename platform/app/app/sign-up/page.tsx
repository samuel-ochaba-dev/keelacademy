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
        <h1>Create Your Account</h1>
        <SignUp />
      </div>
    );
  }

  const errorBody = error ? ERRORS[error] : null;

  return (
    <div>
      <h1>Create Your Learner Account</h1>
      <p>
        Use the same email address you use for git commits so your submissions link automatically.
      </p>

      {errorBody ? (
        <div role="alert">
          <p><strong>Error:</strong> {errorBody}</p>
        </div>
      ) : null}

      <form action={offlineSignUpAction}>
        <input type="hidden" name="next" value={next ?? "/me"} />
        <div>
          <label htmlFor="name">Full Name</label>
          <br />
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
          <label htmlFor="email">Email Address</label>
          <br />
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

        <br />
        <button type="submit">
          Create Account
        </button>
        <p>
          Already have an account?{" "}
          <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}>
            Sign in
          </Link>
        </p>
      </form>

      <OfflineAuthNote mode={mode} />
    </div>
  );
}
