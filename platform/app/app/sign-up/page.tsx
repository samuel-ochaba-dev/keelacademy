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
      <div>
        <SignUp />
      </div>
    );
  }

  const errorBody = error ? ERRORS[error] : null;

  return (
    <div>
      <h1>Sign Up</h1>
      {errorBody && <p role="alert">{errorBody}</p>}
      <form action={offlineSignUpAction}>
        <input type="hidden" name="next" value={next ?? "/me"} />
        <div>
          <label htmlFor="name">Name</label>
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
          <label htmlFor="email">Email</label>
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
        <div>
          <button type="submit">Sign Up</button>
        </div>
      </form>
      <p>
        Already have an account?{" "}
        <Link href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}>
          Sign in
        </Link>
      </p>
      <OfflineAuthNote mode={mode} />
    </div>
  );
}
