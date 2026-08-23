/**
 * Session adapter for managed auth (S2.5).
 *
 * Two implementations behind one interface:
 *
 * - "clerk": real wiring. When CLERK_SECRET_KEY and
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY are both present, sessions come from
 *   Clerk (the school's chosen managed provider) via auth()/currentUser().
 *   The Clerk packages are imported dynamically so a credential-free build
 *   or request never touches them.
 *
 * - "offline": the deterministic fake, per the house offline-determinism
 *   convention (the same role fake_upstream.py plays for the OpenAI API).
 *   It mirrors the semantics of a managed provider: sign-up creates an
 *   identity, sign-in mints a session, sign-out revokes it, and the session
 *   is an HMAC-signed httpOnly cookie the client cannot forge or read. It
 *   is a development stand-in, not a production auth system: pages in this
 *   mode say so, and no password is ever stored (there is nothing to
 *   protect in a local demo). When founder credentials land, the same
 *   routes render Clerk's hosted pages instead.
 *
 * No secret is ever NEXT_PUBLIC: the offline cookie secret and the Clerk
 * secret key live in server env only.
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type AuthMode = "clerk" | "offline";

export type SessionUser = {
  externalId: string;
  email: string;
  name: string | null;
};

const COOKIE_NAME = "keel_session";
const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;

export function authMode(): AuthMode {
  return process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    ? "clerk"
    : "offline";
}

/** The signed-in identity, or null. Safe on any page. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (authMode() === "clerk") {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return null;
    const user = await currentUser();
    return {
      externalId: userId,
      email: user?.primaryEmailAddress?.emailAddress ?? "",
      name: user?.fullName ?? null,
    };
  }
  const payload = await readSessionCookie();
  return payload
    ? { externalId: payload.sub, email: payload.email, name: payload.name }
    : null;
}

/** Route gate: redirect signed-out visitors to sign-in, preserving the
 *  destination so the flow returns where it started. */
export async function requireSession(next: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }
  return user;
}

// ---------------------------------------------------------------------------
// Offline fake: cookie mint/verify + JSON identity store
// ---------------------------------------------------------------------------

type OfflinePayload = { sub: string; email: string; name: string | null; exp: number };

const INSECURE_DEFAULT_SECRET =
  "keelacademy-offline-auth-insecure-default (set KEEL_OFFLINE_AUTH_SECRET)";

let warnedInsecureSecret = false;

function offlineSecret(): string {
  const secret = process.env.KEEL_OFFLINE_AUTH_SECRET;
  if (secret) return secret;
  if (!warnedInsecureSecret) {
    warnedInsecureSecret = true;
    console.warn(
      "[auth] KEEL_OFFLINE_AUTH_SECRET is not set; the offline fake is signing " +
        "sessions with a public default. Fine for the local demo, never for production.",
    );
  }
  return INSECURE_DEFAULT_SECRET;
}

function signValue(value: string): string {
  return createHmac("sha256", offlineSecret()).update(value).digest("hex");
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

async function readSessionCookie(): Promise<OfflinePayload | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw || !raw.includes(".")) return null;
  const [encoded, mac] = raw.split(".");
  if (!encoded || !mac) return null;
  if (!constantTimeEqual(signValue(encoded), mac)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as OfflinePayload;
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setOfflineSessionCookie(user: SessionUser): Promise<void> {
  const store = await cookies();
  const payload: OfflinePayload = {
    sub: user.externalId,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_S,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  store.set(COOKIE_NAME, `${encoded}.${signValue(encoded)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function clearOfflineSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// --- identity store: one JSON file, whole-file read, atomic replace write --

type StoredUser = { externalId: string; email: string; name: string | null };

function storePath(): string {
  return process.env.KEEL_OFFLINE_AUTH_STORE ?? "/tmp/keel-offline-auth.json";
}

export function offlineExternalId(email: string): string {
  return (
    "offline_" +
    createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16)
  );
}

function loadStore(): { users: StoredUser[] } {
  if (!existsSync(storePath())) return { users: [] };
  try {
    const parsed = JSON.parse(readFileSync(storePath(), "utf8"));
    if (Array.isArray(parsed?.users)) return parsed;
  } catch {
    // unreadable store: treat as empty rather than crash the page
  }
  return { users: [] };
}

function saveStore(store: { users: StoredUser[] }): void {
  const path = storePath();
  const tmp = `${path}.tmp-${process.pid}`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  renameSync(tmp, path);
}

export function offlineSignUp(email: string, name: string | null): StoredUser | "exists" {
  const normalized = email.trim().toLowerCase();
  const store = loadStore();
  if (store.users.some((u) => u.email === normalized)) return "exists";
  const user: StoredUser = {
    externalId: offlineExternalId(normalized),
    email: normalized,
    name: name?.trim() ? name.trim() : null,
  };
  store.users.push(user);
  saveStore(store);
  return user;
}

export function offlineSignIn(email: string): StoredUser | null {
  const normalized = email.trim().toLowerCase();
  const store = loadStore();
  return store.users.find((u) => u.email === normalized) ?? null;
}
