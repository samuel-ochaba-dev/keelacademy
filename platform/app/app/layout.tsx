/**
 * Root layout.
 *
 * UI/UX STATUS: UNDECIDED — including all copy. No visual design direction
 * (theme, type, color, layout, motion, iconography) and no copy voice has
 * been chosen for this app. Every surface renders as plain, unstyled
 * semantic HTML on purpose. Do not infer a direction from the current
 * markup or imitate the current strings — they are placeholders from a
 * torn-down design; a future session decides both fresh. See
 * platform/app/AGENTS.md for the binding rules.
 */
import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProviders } from "@/components/auth/providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Keel Academy",
    template: "%s · Keel Academy",
  },
  description: "Keel Academy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main">Skip to content</a>
        <AuthProviders>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </AuthProviders>
      </body>
    </html>
  );
}
