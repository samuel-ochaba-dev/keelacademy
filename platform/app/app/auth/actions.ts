"use server";

/**
 * Auth + checkout server actions (S2.5). Every action re-checks the session
 * server-side: a Server Action is reachable by direct POST, so the session
 * check lives here, not only in the page that rendered the form.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  authMode,
  clearOfflineSessionCookie,
  getSessionUser,
  offlineSignIn,
  offlineSignUp,
  setOfflineSessionCookie,
} from "@/lib/auth";
import { createCheckoutSession, ensureStudent } from "@/lib/enroll";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only same-app paths may be used as a post-login destination. */
function safeNext(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/me";
}

function loginError(path: string, error: string, email?: string): never {
  const params = new URLSearchParams({ error });
  if (email) params.set("email", email);
  redirect(`${path}?${params.toString()}`);
}

export async function offlineSignInAction(formData: FormData): Promise<void> {
  if (authMode() !== "offline") {
    redirect("/sign-in?error=mode");
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(formData.get("next"));
  if (!EMAIL_RE.test(email)) {
    loginError("/sign-in", "invalid-email", email);
  }
  const user = offlineSignIn(email);
  if (!user) {
    loginError("/sign-in", "unknown", email);
  }
  await setOfflineSessionCookie({
    externalId: user.externalId,
    email: user.email,
    name: user.name,
  });
  redirect(next);
}

export async function offlineSignUpAction(formData: FormData): Promise<void> {
  if (authMode() !== "offline") {
    redirect("/sign-up?error=mode");
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const next = safeNext(formData.get("next"));
  if (!EMAIL_RE.test(email)) {
    loginError("/sign-up", "invalid-email", email);
  }
  if (email.length > 320 || name.length > 100) {
    loginError("/sign-up", "invalid", email);
  }
  const created = offlineSignUp(email, name || null);
  if (created === "exists") {
    loginError("/sign-up", "exists", email);
  }
  await setOfflineSessionCookie({
    externalId: created.externalId,
    email: created.email,
    name: created.name,
  });
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  if (authMode() === "offline") {
    await clearOfflineSessionCookie();
  }
  redirect("/");
}

/**
 * Start a Stripe Checkout session for one unit and send the student to the
 * hosted payment page (real Stripe in production, the offline fake in
 * credential-free environments). The {CHECKOUT_SESSION_ID} placeholder in
 * success_url is substituted by Stripe itself at redirect time.
 */
export async function startCheckoutAction(formData: FormData): Promise<void> {
  const unitId = String(formData.get("unit_id") ?? "");
  const user = await getSessionUser();
  if (!user) {
    redirect(`/sign-in?next=${encodeURIComponent(`/me`)}`);
  }
  const bridged = await ensureStudent(user);
  if (bridged.state !== "ok") {
    redirect(
      `/me?checkout=${bridged.state === "rejected" ? bridged.code : "unreachable"}`,
    );
  }
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "127.0.0.1:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  const session = await createCheckoutSession({
    studentId: bridged.data,
    unitId,
    successUrl: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}&unit=${encodeURIComponent(unitId)}`,
    cancelUrl: `${origin}/checkout/cancel`,
  });
  if (session.state !== "ok") {
    redirect(
      `/me?checkout=${session.state === "rejected" ? session.code : "unreachable"}`,
    );
  }
  redirect(session.data.url);
}
