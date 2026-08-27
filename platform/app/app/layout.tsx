/**
 * Root layout.
 *
 * UI/UX STATUS: UNDECIDED. No visual design direction (theme, type, color,
 * layout, motion, iconography) has been chosen for this app. Every surface
 * renders as plain, unstyled semantic HTML on purpose. Do not infer a
 * direction from the current markup; a future session decides it fresh.
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
    default: "Keel Academy · The AI Engineer's Path",
    template: "%s · Keel Academy",
  },
  description:
    "Stop getting stuck in tutorial loops. Build a production-grade AI system across 13 phases, get instant feedback on every line of code, and graduate with a defended portfolio that proves you can ship.",
  keywords: [
    "AI Engineering",
    "Learn AI by Building",
    "Production AI Portfolio",
    "AI Bootcamp",
    "RAG",
    "AI Agents",
    "LLMOps",
    "Code Defense",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
