import type { AuthMode } from "@/lib/auth";

export function OfflineAuthNote({ mode }: { mode: AuthMode }) {
  if (mode !== "offline") return null;
  return (
    <p>
      <small>
        Offline development sign-in. This stands in for the school&apos;s managed accounts (Clerk) so the
        whole flow runs with no external service and no credentials. No password is stored; anything you
        type here exists only on this machine.
      </small>
    </p>
  );
}
