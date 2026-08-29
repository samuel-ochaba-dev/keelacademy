import type { Metadata } from "next";
import Link from "next/link";
import { authMode, getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Out — Keel Academy",
  robots: { index: false },
};

export default async function SignOutPage() {
  const mode = authMode();
  const user = await getSessionUser();

  if (mode === "clerk") {
    const { SignOutButton } = await import("@clerk/nextjs");
    return (
      <div>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div>
      <h1>Sign Out</h1>
      {user ? (
        <p>Signed in as: {user.name ?? user.email}</p>
      ) : (
        <p>You are not signed in.</p>
      )}
      <form action={signOutAction}>
        <button type="submit">Sign Out</button>
      </form>
      <p>
        <Link href="/me">Return to dashboard</Link>
      </p>
    </div>
  );
}
