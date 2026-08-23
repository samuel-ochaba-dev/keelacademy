import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProviders } from "@/components/auth/providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Keel Academy · Learn AI engineering by shipping one real system",
    template: "%s · Keel Academy",
  },
  description:
    "A self-paced engineering school with no videos and no seat-time credit. You build one production-grade AI system across 13 phases, and every deliverable is graded by sandboxed tests, a calibrated rubric judge, and a defend-your-work interview.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AuthProviders>
          <SiteHeader />
          <main id="main">
            {children}
          </main>
          <SiteFooter />
        </AuthProviders>
      </body>
    </html>
  );
}
