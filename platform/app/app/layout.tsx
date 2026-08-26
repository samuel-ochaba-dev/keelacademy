import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProviders } from "@/components/auth/providers";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

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
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only z-[100] rounded-lg bg-accent px-4 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <AuthProviders>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </AuthProviders>
      </body>
    </html>
  );
}
