import type { Metadata } from "next";
import Link from "next/link";
import { authMode } from "@/lib/auth";
import { offlineSignInAction } from "@/app/auth/actions";
import { OfflineAuthNote } from "@/components/auth/offline-note";

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
      <div>
        <SignIn />
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
              AUTHENTICATION TERMINAL
            </span>
            <h1>Sign in to Keel Academy</h1>
          </div>
        </div>

        <p>
          Sign in to access your workbench, inspect grading verdicts, and continue building.
        </p>

        {errorBody ? (
          <div
            role="alert"
          >
            <p>{errorBody}</p>
          </div>
        ) : null}

        <form action={offlineSignInAction}>
          <input type="hidden" name="next" value={next ?? "/me"} />

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
            <span>AUTHENTICATE & ENTER</span>
          </button>
        </form>

        <p>
          Don&apos;t have an account yet?{" "}
          <Link
            href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
          >
            CREATE ONE
          </Link>
        </p>
      </div>

      <OfflineAuthNote mode={mode} />
    </div>
  );
}
