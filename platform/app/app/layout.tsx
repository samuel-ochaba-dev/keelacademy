import type { Metadata, Viewport } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProviders } from "@/components/auth/providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: {
    default: "Keel Academy — The Self-Operating School for AI Engineers",
    template: "%s · Keel Academy",
  },
  description:
    "Zero teaching staff. Automated multi-layer verification. Real production deliverables.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-zinc-100 focus:border focus:border-zinc-700 focus:rounded-md focus:shadow-lg text-sm font-medium"
        >
          Skip to content
        </a>
        <AuthProviders>
          <SiteHeader />
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
          <SiteFooter />
        </AuthProviders>
      </body>
    </html>
  );
}

