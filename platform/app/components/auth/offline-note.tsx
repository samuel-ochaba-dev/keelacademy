import type { AuthMode } from "@/lib/auth";

export function OfflineAuthNote({ mode }: { mode: AuthMode }) {
  if (mode !== "offline") return null;
  return (
    <div>
      <p>
        <strong>Offline local mode</strong>
      </p>
      <p>
        Offline local development sign-in. This stands in for managed identity provider authentication (Clerk) so the entire development environment runs without external cloud services or stored credentials.
      </p>
    </div>
  );
}
