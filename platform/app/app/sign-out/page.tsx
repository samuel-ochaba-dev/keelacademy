import type { Metadata } from "next";
import Link from "next/link";
import { authMode, getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Out",
  robots: { index: false },
};

export default async function SignOutPage() {
  const mode = authMode();
  const user = await getSessionUser();

  if (mode === "clerk") {
    const { SignOutButton } = await import("@clerk/nextjs");
    return (
      <SignOutPanel name={user?.name ?? user?.email ?? null}>
        <SignOutButton />
      </SignOutPanel>
    );
  }

  return (
    <SignOutPanel name={user?.name ?? user?.email ?? null}>
      <form action={signOutAction}>
        <button type="submit">
          Sign out of this device
        </button>
      </form>
    </SignOutPanel>
  );
}

function SignOutPanel({ name, children }: { name: string | null; children: React.ReactNode }) {
  return (
    <div>
      <div>
        <div>
          
          <h1>End active session</h1>
        </div>

        <div>
          {name ? (
            <p>
              Signed in as <span>{name}</span>. Signing out clears
              the authentication session on this device. Your enrollments and submission history
              remain intact.
            </p>
          ) : (
            <p>
              You are not currently signed in on this device.
            </p>
          )}

          <div>{children}</div>

          <p>
            <Link href="/me">
              Cancel and return to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
