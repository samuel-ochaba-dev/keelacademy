import type { Metadata } from "next";
import { authMode, getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign out",
  robots: { index: false },
};

export default async function SignOutPage() {
  const mode = authMode();
  const user = await getSessionUser();

  if (mode === "clerk") {
    const { SignOutButton } = await import("@clerk/nextjs");
    return <SignOutPanel name={user?.name ?? user?.email ?? null}>{<SignOutButton />}</SignOutPanel>;
  }

  return (
    <SignOutPanel name={user?.name ?? user?.email ?? null}>
      <form action={signOutAction}>
        <button type="submit">
          Sign out
        </button>
      </form>
    </SignOutPanel>
  );
}

function SignOutPanel({ name, children }: { name: string | null; children: React.ReactNode }) {
  return (
    <div>
      <h1>End this session</h1>
      {name ? (
        <p>
          Signed in as {name}. Signing out clears the session on this device; your
          enrollments and submissions stay exactly as they are.
        </p>
      ) : (
        <p>
          You are not signed in on this device.
        </p>
      )}
      <div>{children}</div>
    </div>
  );
}
