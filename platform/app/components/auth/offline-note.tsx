import type { AuthMode } from "@/lib/auth";

export function OfflineAuthNote({ mode }: { mode: AuthMode }) {
  if (mode !== "offline") return null;
  return (
    <p className="mt-5 rounded-lg border border-dashed border-line-strong px-4 py-3 text-xs leading-relaxed text-ink-3">
      Offline development sign-in. This stands in for the school&apos;s managed accounts (Clerk) so
      the whole flow runs with no external service and no credentials. No password is stored;
      anything you type here exists only on this machine.
    </p>
  );
}
