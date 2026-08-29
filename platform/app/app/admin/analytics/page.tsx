import { Metadata } from "next";
import { getSessionUser, isAdminUser } from "@/lib/auth";
import { fetchAnalyticsSummary, fetchMacroFunnel, fetchDropoffBreakdown } from "@/lib/analytics";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Per-Unit Drop-Off & Curriculum Analytics | Keel Academy",
  description: "Curriculum drop-off rates, retrieval check failure modes, retry loops, and AI concierge question volume.",
};

export default async function AdminAnalyticsPage() {
  const user = await getSessionUser();
  const isAdmin = isAdminUser(user);

  const [summaryRes, funnelRes, dropoffRes] = await Promise.all([
    fetchAnalyticsSummary(),
    fetchMacroFunnel(),
    fetchDropoffBreakdown(),
  ]);

  const summary = summaryRes.state === "ok" ? summaryRes.data : null;
  const funnel = funnelRes.state === "ok" ? funnelRes.data : null;
  const dropoff = dropoffRes.state === "ok" ? dropoffRes.data : null;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {!isAdmin && (
          <div className="mb-6 rounded-lg border border-amber-800/60 bg-amber-950/20 p-4 text-xs font-mono text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Preview Mode: Viewing author friction telemetries in public preview.</span>
            </div>
            <Badge variant="warning">Staff & Author Telemetry</Badge>
          </div>
        )}

        <AnalyticsDashboard
          initialSummary={summary}
          initialFunnel={funnel}
          initialDropoff={dropoff}
        />
      </div>
    </div>
  );
}
