import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProviders } from "@/components/auth/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Keel Academy · Practical AI Engineering",
    template: "%s · Keel Academy",
  },
  description:
    "An engineering academy for software developers who want to build real, verified AI systems. You build one continuous claims-triage system across 13 phases, with automated sandbox testing and rubric grading.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <a href="#main">
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
