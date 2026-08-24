import type { Metadata } from "next";
import Link from "next/link";
import { authMode, getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";
import { IconKeelLogo } from "@/components/icons";

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
        <button type="submit" className="btn-ghost px-5 py-2.5">
          Sign out of this device
        </button>
      </form>
    </SignOutPanel>
  );
}

function SignOutPanel({ name, children }: { name: string | null; children: React.ReactNode }) {
  return (
    <div className="shell flex max-w-md flex-col py-16 sm:py-24">
      <div className="panel p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-line-strong bg-inset text-accent">
            <IconKeelLogo size={20} />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-ink">End active session</h1>
        </div>

        <div className="mt-5">
          {name ? (
            <p className="text-sm leading-relaxed text-ink-2">
              Signed in as <span className="font-medium text-ink">{name}</span>. Signing out clears
              the authentication session on this device. Your enrollments and submission history
              remain intact.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-ink-2">
              You are not currently signed in on this device.
            </p>
          )}

          <div className="mt-6">{children}</div>

          <p className="mt-5 border-t border-line pt-5">
            <Link href="/me" className="link-arrow text-sm">
              Cancel and return to dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
