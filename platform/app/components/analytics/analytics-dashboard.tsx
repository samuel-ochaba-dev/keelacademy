"use client";

import * as React from "react";
import {
  OperationsSummaryResponse,
  MacroFunnelResponse,
  DropoffBreakdownResponse,
  UnitFrictionRecord,
  UnitDetailResponse,
} from "@/lib/analytics";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AnalyticsDashboardProps {
  initialSummary: OperationsSummaryResponse | null;
  initialFunnel: MacroFunnelResponse | null;
  initialDropoff: DropoffBreakdownResponse | null;
}

export function AnalyticsDashboard({
  initialSummary,
  initialFunnel,
  initialDropoff,
}: AnalyticsDashboardProps) {
  const [selectedPhase, setSelectedPhase] = React.useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"friction" | "dropoff" | "attempts" | "retrieval" | "concierge">("friction");
  const [sortAsc, setSortAsc] = React.useState(false);

  // Unit Drill-down Modal State
  const [drilldownUnitId, setDrilldownUnitId] = React.useState<string | null>(null);
  const [drilldownLoading, setDrilldownLoading] = React.useState(false);
  const [drilldownData, setDrilldownData] = React.useState<UnitDetailResponse | null>(null);

  // Filter & Sort Units
  const units = React.useMemo(() => {
    if (!initialDropoff?.units) return [];
    let list = [...initialDropoff.units];

    if (selectedPhase !== "all") {
      list = list.filter((u) => u.phase === selectedPhase);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.unit_id.toLowerCase().includes(q) ||
          u.title.toLowerCase().includes(q) ||
          `phase ${u.phase}`.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === "friction") {
        valA = a.friction_score;
        valB = b.friction_score;
      } else if (sortBy === "dropoff") {
        valA = a.drop_off_rate_pct;
        valB = b.drop_off_rate_pct;
      } else if (sortBy === "attempts") {
        valA = a.avg_attempts_to_pass;
        valB = b.avg_attempts_to_pass;
      } else if (sortBy === "retrieval") {
        valA = a.retrieval_first_try_fail_rate_pct;
        valB = b.retrieval_first_try_fail_rate_pct;
      } else if (sortBy === "concierge") {
        valA = a.concierge_turn_volume;
        valB = b.concierge_turn_volume;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [initialDropoff, selectedPhase, searchQuery, sortBy, sortAsc]);

  const handleOpenDrilldown = async (unitId: string) => {
    setDrilldownUnitId(unitId);
    setDrilldownLoading(true);
    setDrilldownData(null);
    try {
      const res = await fetch(`/api/admin/analytics/units/${encodeURIComponent(unitId)}`);
      if (res.ok) {
        const data = await res.json();
        setDrilldownData(data);
      }
    } catch {
      // Error handling
    } finally {
      setDrilldownLoading(false);
    }
  };

  const handleCloseDrilldown = () => {
    setDrilldownUnitId(null);
    setDrilldownData(null);
  };

  const phases = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Curriculum & Drop-Off Analytics
            </h1>
            <Badge variant="info">Stage 4 Exit</Badge>
          </div>
          <p className="mt-1.5 text-sm text-zinc-400">
            Actionable signal on unit friction, student drop-off bottlenecks, retrieval check failure modes, and concierge inquiries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Live Database Aggregation
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="bg-zinc-900/80 border-zinc-800/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
                Total Students
              </span>
              <Badge variant="default" className="text-[10px]">Cohort Macro</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-zinc-100">
                {initialSummary?.total_enrolled_students ?? 0}
              </span>
              <span className="text-xs text-zinc-500 font-mono">registered</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {initialSummary?.active_30d_students ?? 0} active in last 30 days ({initialSummary?.active_30d_rate_pct ?? 0}%)
            </p>
          </CardContent>
        </Card>

        {/* Weekly Pod Compliance */}
        <Card className="bg-zinc-900/80 border-zinc-800/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
                Pod Post Compliance
              </span>
              <Badge variant="success" className="text-[10px]">Accountability</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-emerald-400">
                {initialSummary?.weekly_pod_post_compliance_rate_pct ?? 0}%
              </span>
              <span className="text-xs text-zinc-500 font-mono">active peers</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Weekly shipped/broke/next check-in compliance
            </p>
          </CardContent>
        </Card>

        {/* Top Bottleneck Unit */}
        <Card className="bg-zinc-900/80 border-zinc-800/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
                Top Bottleneck
              </span>
              <Badge variant="danger" className="text-[10px]">Author Signal</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-400 truncate">
                {initialSummary?.top_bottleneck_unit?.unit_id ? `Unit ${initialSummary.top_bottleneck_unit.unit_id}` : "None"}
              </span>
              {initialSummary?.top_bottleneck_unit && (
                <span className="text-xs text-zinc-400 font-mono">
                  ({initialSummary.top_bottleneck_unit.friction_score} pts)
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-zinc-400 truncate">
              {initialSummary?.top_bottleneck_unit?.title ?? "Friction index normal across units"}
            </p>
          </CardContent>
        </Card>

        {/* Graduation & Capstone */}
        <Card className="bg-zinc-900/80 border-zinc-800/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
                Capstone Clear Rate
              </span>
              <Badge variant="info" className="text-[10px]">Graduation</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-sky-400">
                {initialSummary?.capstone_completion_rate_pct ?? 0}%
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                ({initialSummary?.total_capstone_graduates ?? 0} grads)
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Avg {initialSummary?.avg_days_to_capstone ?? 0} days to capstone defense
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Curriculum Macro Funnel Waterfall */}
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-zinc-100">Curriculum Macro Funnel</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Progression across major curriculum gateways from initial enrollment through final capstone defense.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {initialFunnel?.stages?.length ?? 0} Milestones
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {initialFunnel?.stages?.map((stage, idx) => {
              const prevStage = idx > 0 ? initialFunnel.stages[idx - 1] : null;
              const stepConversion = prevStage && prevStage.count > 0 ? Math.round((stage.count / prevStage.count) * 100) : (idx === 0 ? 100 : 0);

              return (
                <div
                  key={stage.id}
                  className="flex flex-col justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all hover:border-zinc-700"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span className="font-mono text-[10px] text-zinc-500">0{idx + 1}</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-medium">
                        {stage.conversion_pct}% of total
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-200 leading-tight">
                      {stage.name}
                    </h4>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-2xl font-mono font-bold text-zinc-100">
                        {stage.count}
                      </span>
                      {idx > 0 && (
                        <span className="text-[11px] font-mono text-zinc-400">
                          {stepConversion}% step
                        </span>
                      )}
                    </div>

                    {/* Funnel Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(4, stage.conversion_pct)}%` }}
                      />
                    </div>

                    {idx > 0 && stage.drop_off_pct > 0 && (
                      <p className="mt-1.5 text-[10px] text-rose-400/80 font-mono">
                        -{stage.drop_off_pct}% drop-off
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unit Friction & Drop-Off Ranking Table */}
      <Card className="border-zinc-800 bg-zinc-900/90">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-zinc-100">Per-Unit Drop-off & Friction Breakdown</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Actionable friction scoring identifying where students struggle with retrieval checks, retry loops, and AI concierge inquiries.
              </CardDescription>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Search unit by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none w-56 font-mono"
              />

              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none font-mono"
              >
                <option value="all">All Phases (0..12)</option>
                {phases.map((p) => (
                  <option key={p} value={p}>
                    Phase {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Starts / Clears</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-200 transition-colors"
                    onClick={() => {
                      if (sortBy === "dropoff") setSortAsc(!sortAsc);
                      else {
                        setSortBy("dropoff");
                        setSortAsc(false);
                      }
                    }}
                  >
                    Drop-off Rate {sortBy === "dropoff" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th className="py-3 px-4">Median Time</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-200 transition-colors"
                    onClick={() => {
                      if (sortBy === "attempts") setSortAsc(!sortAsc);
                      else {
                        setSortBy("attempts");
                        setSortAsc(false);
                      }
                    }}
                  >
                    Avg Attempts {sortBy === "attempts" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-200 transition-colors"
                    onClick={() => {
                      if (sortBy === "retrieval") setSortAsc(!sortAsc);
                      else {
                        setSortBy("retrieval");
                        setSortAsc(false);
                      }
                    }}
                  >
                    Retrieval Fail % {sortBy === "retrieval" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-200 transition-colors"
                    onClick={() => {
                      if (sortBy === "concierge") setSortAsc(!sortAsc);
                      else {
                        setSortBy("concierge");
                        setSortAsc(false);
                      }
                    }}
                  >
                    Concierge Qs {sortBy === "concierge" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-zinc-200 transition-colors"
                    onClick={() => {
                      if (sortBy === "friction") setSortAsc(!sortAsc);
                      else {
                        setSortBy("friction");
                        setSortAsc(false);
                      }
                    }}
                  >
                    Friction Score {sortBy === "friction" ? (sortAsc ? "▲" : "▼") : ""}
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/30">
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-zinc-500 font-sans">
                      No units matching search or phase filter.
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => {
                    const isBottleneck = unit.friction_score >= 40.0;
                    const isHighDropoff = unit.drop_off_rate_pct >= 50.0;

                    return (
                      <tr
                        key={unit.unit_id}
                        className="hover:bg-zinc-800/40 transition-colors group"
                      >
                        {/* Unit Name & Phase */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-100">Unit {unit.unit_id}</span>
                            <span className="text-zinc-500 font-sans text-xs truncate max-w-[200px]">
                              {unit.title}
                            </span>
                          </div>
                        </td>

                        {/* Starts / Clears */}
                        <td className="py-3 px-4 text-zinc-300">
                          <span className="text-zinc-100 font-semibold">{unit.starts_count}</span>
                          <span className="text-zinc-500"> / </span>
                          <span className="text-emerald-400">{unit.completions_count}</span>
                        </td>

                        {/* Drop-off Rate */}
                        <td className="py-3 px-4">
                          <span
                            className={
                              isHighDropoff
                                ? "text-rose-400 font-semibold"
                                : unit.drop_off_rate_pct > 20
                                ? "text-amber-400"
                                : "text-zinc-300"
                            }
                          >
                            {unit.drop_off_rate_pct}%
                          </span>
                        </td>

                        {/* Median Time */}
                        <td className="py-3 px-4 text-zinc-300">
                          {unit.median_time_to_clear_hrs > 0 ? `${unit.median_time_to_clear_hrs}h` : "—"}
                        </td>

                        {/* Avg Attempts */}
                        <td className="py-3 px-4">
                          <span
                            className={
                              unit.avg_attempts_to_pass > 2.5
                                ? "text-amber-400 font-semibold"
                                : "text-zinc-300"
                            }
                          >
                            {unit.avg_attempts_to_pass}x
                          </span>
                        </td>

                        {/* Retrieval Fail Rate */}
                        <td className="py-3 px-4">
                          <span
                            className={
                              unit.retrieval_first_try_fail_rate_pct >= 40
                                ? "text-rose-400 font-semibold"
                                : unit.retrieval_first_try_fail_rate_pct > 15
                                ? "text-amber-400"
                                : "text-zinc-300"
                            }
                          >
                            {unit.retrieval_first_try_fail_rate_pct}%
                          </span>
                        </td>

                        {/* Concierge Questions */}
                        <td className="py-3 px-4 text-zinc-300">
                          {unit.concierge_turn_volume}
                        </td>

                        {/* Friction Score Badge */}
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              unit.friction_score >= 50
                                ? "danger"
                                : unit.friction_score >= 25
                                ? "warning"
                                : "success"
                            }
                          >
                            {unit.friction_score} pts
                          </Badge>
                        </td>

                        {/* Action Drilldown */}
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenDrilldown(unit.unit_id)}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Deep Dive
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Unit Drill-down Modal */}
      {drilldownUnitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-bold font-mono text-zinc-100">
                    Unit {drilldownUnitId} Deep Dive
                  </h3>
                  <Badge variant="info">Friction Signal</Badge>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {drilldownData?.unit.title ?? "Loading friction report..."}
                </p>
              </div>

              <button
                onClick={handleCloseDrilldown}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {drilldownLoading ? (
              <div className="py-12 text-center text-zinc-400 font-mono text-sm">
                Aggregating test failure modes, concierge questions, and retrieval telemetry...
              </div>
            ) : drilldownData ? (
              <div className="space-y-6">
                {/* Stat Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80 font-mono text-xs">
                  <div>
                    <span className="text-zinc-500 block">Friction Score</span>
                    <span className="text-base font-bold text-rose-400">
                      {drilldownData.unit.friction_score} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Drop-off Rate</span>
                    <span className="text-base font-bold text-zinc-200">
                      {drilldownData.unit.drop_off_rate_pct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Retrieval Fail %</span>
                    <span className="text-base font-bold text-zinc-200">
                      {drilldownData.unit.retrieval_first_try_fail_rate_pct}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Avg Attempts</span>
                    <span className="text-base font-bold text-zinc-200">
                      {drilldownData.unit.avg_attempts_to_pass}x
                    </span>
                  </div>
                </div>

                {/* Common Failure Modes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono text-xs">
                    Common Verification Failure Modes
                  </h4>
                  {drilldownData.failure_modes.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950/40 rounded border border-zinc-800/40 font-mono">
                      Zero recurring criteria failures recorded for this unit.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {drilldownData.failure_modes.map((fm, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-rose-900/40 bg-rose-950/10 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono font-bold text-rose-300">
                              {fm.criterion_id}
                            </span>
                            <Badge variant="danger" className="text-[10px]">
                              {fm.occurrences} failures
                            </Badge>
                          </div>
                          {fm.sample_reasons.length > 0 && (
                            <div className="mt-1 space-y-1 text-zinc-400 font-mono text-[11px]">
                              {fm.sample_reasons.map((r, idx) => (
                                <p key={idx}>• {r}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Common Concierge Questions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono text-xs">
                    Recent AI Concierge Questions & Friction Points
                  </h4>
                  {drilldownData.concierge_questions.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950/40 rounded border border-zinc-800/40 font-mono">
                      No student concierge questions recorded for this unit.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {drilldownData.concierge_questions.map((cq) => (
                        <div
                          key={cq.id}
                          className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                            <span>Student #{cq.student_id}</span>
                            <Badge variant={cq.mode === "teach" ? "info" : "warning"} className="text-[10px]">
                              {cq.mode}
                            </Badge>
                          </div>
                          <p className="text-zinc-300 font-mono text-[11px]">{cq.question}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Retrieval Seed Failures */}
                {drilldownData.retrieval_seed_failures.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono text-xs">
                      Failed Retrieval Drill Seeds
                    </h4>
                    <div className="space-y-2">
                      {drilldownData.retrieval_seed_failures.map((rf, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-xs space-y-1.5"
                        >
                          <div className="font-mono text-zinc-400 text-[11px] font-semibold">
                            Seed #{rf.seed_index}: {rf.seed_prompt}
                          </div>
                          <div className="text-zinc-500 text-[11px] font-mono">
                            Student answer: &ldquo;{rf.student_answer}&rdquo;
                          </div>
                          {rf.feedback && (
                            <div className="text-amber-400/90 text-[11px] font-mono">
                              Judge feedback: {rf.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <Button variant="secondary" size="md" onClick={handleCloseDrilldown}>
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
