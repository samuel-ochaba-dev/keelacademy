import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { startCheckoutAction } from "@/app/auth/actions";
import {
  ensureStudent,
  fetchOwnSubmissions,
  fetchPrice,
  fetchProfile,
  formatPrice,
  type EnrollResult,
  type OwnSubmission,
  type Rebate,
} from "@/lib/enroll";
import { listUnits } from "@/lib/content";
import { formatUtc } from "@/lib/grading";
import {
  fetchStudentGates,
  loadGateRules,
  type GateRule,
  type GatesLookup,
  type PassedGate,
} from "@/lib/gates";
import {
  fetchLatestDigest,
  fetchRecheckSchedule,
  type LatestDigestResponse,
  type PracticeResult,
  type RecheckSchedule,
} from "@/lib/practice";
import {
  fetchStudentGalleryProjects,
  type GalleryResult,
  type StudentGalleryProject,
} from "@/lib/gallery";
import {
  fetchStudentDefenses,
  type ClientResult as SimClientResult,
  type StudentDefenses,
} from "@/lib/simulation";


export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learner Cockpit — Keel Academy",
  description: "Your student dashboard, token telemetry, active enrollments, and live rebate progress.",
  robots: { index: false },
};

const CHECKOUT_ERRORS: Record<string, string> = {
  unreachable: "The enrollment service is unreachable. Please try again in a few moments.",
  app_not_configured: "The app is missing its enrollment secret (KEEL_ENROLL_SECRET).",
  stripe_not_wired: "Payment processing is not configured on the enrollment server.",
  stripe_unreachable: "Payment service did not answer. No charges were made.",
  stripe_error: "Payment processor rejected the request. Nothing was charged.",
  email_linked_to_other_account:
    "This email is linked to a different account. Sign in with that account to enroll.",
};

type Props = { searchParams: Promise<{ checkout?: string }> };

export default async function MePage({ searchParams }: Props) {
  const { checkout } = await searchParams;
  const user = await requireSession("/me");
  const bridged = await ensureStudent(user);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Flight deck header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LEARNER COCKPIT & PROGRESS
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
                {user.name ?? user.email}
              </h1>
              <p className="text-xs font-mono text-zinc-400">
                Identity: {user.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-mono text-zinc-300">
                <span className="text-zinc-500 mr-2">RECORD:</span>
                <span className="text-emerald-400 font-semibold">
                  {bridged.state === "ok" ? `#${bridged.data}` : "GUEST"}
                </span>
              </div>
              <Link
                href="/map"
                className="rounded-md border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <span>Meridian Map</span>
                <span className="text-zinc-400">&rarr;</span>
              </Link>
            </div>
          </div>

          {checkout ? (
            <div
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-950/30 px-4 py-3 text-xs font-mono text-red-200"
            >
              <p>
                <span className="font-bold text-red-400">CHECKOUT ERROR:</span>{" "}
                {CHECKOUT_ERRORS[checkout] ?? "Checkout could not start. Nothing was charged."}
              </p>
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          {bridged.state === "ok" ? (
            <EnrolledSections studentId={bridged.data} userEmail={user.email} />
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-6 text-sm text-amber-200 space-y-2">
              <h2 className="font-mono font-bold text-amber-300">Enrollment Service Suspended</h2>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                The enrollment service is temporarily unavailable. Your signed-in session is active;
                refresh in a moment to reload your grading profile.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

async function EnrolledSections({
  studentId,
  userEmail,
}: {
  studentId: number;
  userEmail: string;
}) {
  const [profileResult, submissionsResult, gatesLookup, recheckResult, digestResult, galleryResult, defensesResult] = await Promise.all([
    fetchProfile(studentId),
    fetchOwnSubmissions(studentId),
    fetchStudentGates(studentId),
    fetchRecheckSchedule(studentId),
    fetchLatestDigest(studentId),
    fetchStudentGalleryProjects(studentId),
    fetchStudentDefenses(studentId),
  ]);


  const gateRules = loadGateRules();
  const units = listUnits();
  const enrolledUnits = new Set(
    profileResult.state === "ok" ? profileResult.data.enrollments.map((e) => e.unit_id) : [],
  );

  const prices = new Map<string, EnrollResult<{ amount_cents: number; currency: string }>>();
  await Promise.all(
    units
      .filter((u) => !enrolledUnits.has(u.id))
      .map(async (u) => prices.set(u.id, await fetchPrice(u.id))),
  );

  const profile = profileResult.state === "ok" ? profileResult.data : null;
  const budget = profile?.budget ?? null;
  const rebates = profile?.rebates ?? [];
  const submissions = submissionsResult.state === "ok" ? submissionsResult.data.submissions : [];

  const usedTokens = budget?.tokens_used ?? 0;
  const capTokens = budget?.tokens_cap ?? 1000000;
  const pctUsed = Math.min(100, Math.round((usedTokens / capTokens) * 100));

  // Compute live earned rebates
  let earnedRebatesCents = 0;
  for (const r of rebates) {
    if (r.status === "earned" || r.status === "paid") {
      earnedRebatesCents += r.amount_cents;
    }
  }
  const maxRebateCents = 60000; // $600 max rebate

  return (
    <div className="space-y-10">
      {/* 1. Student Summary & Rebate Meter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Student Profile
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ACTIVE ENROLLMENT
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="text-zinc-500 text-[11px]">STUDENT ID</div>
              <div className="text-zinc-200 font-semibold text-sm">#{studentId}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[11px]">AUTHENTICATED EMAIL</div>
              <div className="text-zinc-200 truncate">{userEmail}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[11px]">ENROLLED UNITS</div>
              <div className="text-zinc-200">
                {profile ? `${profile.enrollments.length} Active Modules` : "1 Free Sandbox Unit"}
              </div>
            </div>
          </div>
        </div>

        {/* Live Rebate Progress Card */}
        <div className="md:col-span-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 pb-3 gap-2">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Live Completion Rebate Tracker
              </span>
              <p className="text-xs text-zinc-400 font-sans">
                Up to $600 refunded automatically upon verified gate completions.
              </p>
            </div>
            <div className="text-right">
              <span className="text-base font-bold font-mono text-emerald-400">
                {formatPrice(earnedRebatesCents, "usd")}
              </span>
              <span className="text-xs font-mono text-zinc-500"> / {formatPrice(maxRebateCents, "usd")} Max</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(4, Math.round((earnedRebatesCents / maxRebateCents) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0% (Enrollment)</span>
              <span>15% (Phase 5 Gate — $300)</span>
              <span>30% (Capstone Delivery — $300)</span>
            </div>
          </div>

          {/* Rebates milestone chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <RebateMilestoneChip
              title="Phase 5 Integration Gate"
              amount="$300"
              rebate={rebates.find((r) => r.gate_id === "phase-5-integration")}
              ruleSummary="Passing unit 5.1 unlocks multi-tool agent triage."
            />
            <RebateMilestoneChip
              title="Capstone Delivery Gate"
              amount="$300"
              rebate={rebates.find((r) => r.gate_id === "capstone")}
              ruleSummary="Passing unit 12.1 verifies production insurance deployment."
            />
          </div>
        </div>
      </div>

      {/* Weekly Personalized Retention Digest Preview */}
      <DigestSection result={digestResult} />

      {/* 2. Token Budget Telemetry */}
      {budget ? (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Layer 2 Rubric Evaluation Budget
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              <span className="text-zinc-100 font-semibold">{usedTokens.toLocaleString("en-US")}</span> /{" "}
              {capTokens.toLocaleString("en-US")} tokens ({pctUsed}%)
            </span>
          </div>

          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                pctUsed > 80 ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.max(1, pctUsed)}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Tokens are consumed exclusively when the frontier LLM rubric judge executes calibrated evaluation against your commit diffs and quotes verification evidence.
          </p>
        </section>
      ) : null}

      {/* 3. Spaced Re-checks Section */}
      <RecheckSection result={recheckResult} />

      {/* 4. Enrolled & Available Units Grid */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
              Curriculum Units & Bench Access
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Authored drills with deterministic harnesses and rubric criteria.
            </p>
          </div>
          <Link
            href="/map"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full 13-Phase Map</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {profileResult.state !== "ok" ? (
          <div className="p-6 text-xs font-mono text-zinc-400">
            Unable to load unit enrollments right now. Please refresh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Unit Spec</th>
                  <th className="py-3 px-4 font-semibold">Phase</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {units.map((unit) => {
                  const isEnrolled = enrolledUnits.has(unit.id);
                  return (
                    <tr key={unit.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-100">
                        Unit {unit.id}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        PHASE 0{unit.phase}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isEnrolled
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {isEnrolled ? "ENROLLED" : "AVAILABLE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <UnitRowAction
                          unitId={unit.id}
                          enrolled={isEnrolled}
                          price={prices.get(unit.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. Cryptographic Gate Barriers */}
      {gateRules.length > 0 ? <GatesSection rules={gateRules} lookup={gatesLookup} /> : null}

      {/* 6. Standing Skeptical Reviewer Defenses HUD (S4.6) */}
      <DefensesHUDSection result={defensesResult} />

      {/* 7. Rebates Detail Ledger */}
      {rebates.length > 0 ? <RebateSection rebates={rebates} /> : null}

      {/* 8. Immutable Submission Audit Ledger */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
              Immutable Submission Audit Ledger
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Chronological log of verified git commit evaluations and automated verdicts.
            </p>
          </div>
          <Link
            href="/submit"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Submission Protocol</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <SubmissionsBody submissions={submissions} error={submissionsResult.state !== "ok"} />
      </section>

      {/* 9. Public Build Gallery Showcase Portfolio (S4.4) */}
      <GalleryProjectsSection result={galleryResult} />
    </div>
  );
}

function DefensesHUDSection({
  result,
}: {
  result: SimClientResult<StudentDefenses>;
}) {
  const defenses = result.state === "ok" ? result.data : null;
  const tech = defenses?.technical_stakeholder;
  const biz = defenses?.business_owner;
  const cleared = defenses?.defense_cleared ?? false;

  return (
    <section
      data-keel-section="skeptical-defenses-hud"
      className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden"
    >
      <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${cleared ? "bg-emerald-400" : "bg-amber-400"}`} />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
              Standing Skeptical Reviewer Defenses HUD
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Phase 12 capstone graduation and Section 14 credentialing check requiring passing simulations against Marcus Vance & Elena Rostova.
          </p>
        </div>
        <Link
          href="/simulations"
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Open Simulation Hub</span>
          <span>&rarr;</span>
        </Link>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tech Stakeholder Card */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">
                SECTION 14.3 • TECHNICAL AUDIT
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  tech?.passed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {tech?.passed ? "CLEARED" : "NOT CLEARED"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-zinc-100">
                Marcus Vance
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Staff AI Architect & Lead Systems Auditor
              </p>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Demands golden-set eval numbers, token economics, cascading routers, and prompt injection defense.
            </p>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 text-[11px]">
                {tech?.score_pct !== null && tech?.score_pct !== undefined
                  ? `Latest Score: ${tech.score_pct}%`
                  : "No completed reps"}
              </span>
              <Link
                href="/simulations/technical-stakeholder"
                className="text-emerald-400 hover:underline"
              >
                Rehearse Defense &rarr;
              </Link>
            </div>
          </div>

          {/* Business Owner Card */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold tracking-wider uppercase">
                SECTION 14.4 • COMMERCIAL AUDIT
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  biz?.passed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {biz?.passed ? "CLEARED" : "NOT CLEARED"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-zinc-100">
                Elena Rostova
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Managing Director & P&L Owner
              </p>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Demands plain-language dollar ROI, adjuster hours saved, and human-in-the-loop fallback for $50k claims.
            </p>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 text-[11px]">
                {biz?.score_pct !== null && biz?.score_pct !== undefined
                  ? `Latest Score: ${biz.score_pct}%`
                  : "No completed reps"}
              </span>
              <Link
                href="/simulations/business-owner"
                className="text-emerald-400 hover:underline"
              >
                Rehearse Defense &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function GalleryProjectsSection({
  result,
}: {
  result: GalleryResult<{ student_id: number; projects: StudentGalleryProject[] }>;
}) {
  const projects = result.state === "ok" ? result.data.projects : [];

  return (
    <section
      data-keel-section="gallery-portfolio"
      className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden"
    >
      <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
              Public Build Gallery Showcase Portfolio
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            Opt-in public portfolio deliverables visible across cohorts and prospective clients.
          </p>
        </div>
        <Link
          href="/gallery"
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explore Full Public Gallery</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {result.state !== "ok" ? (
        <div className="p-6 text-xs font-mono text-zinc-400">
          Gallery showcase status is temporarily unavailable.
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center space-y-3 font-mono">
          <p className="text-xs text-zinc-400 font-sans">
            No portfolio projects published yet. When your unit submissions pass automated verification, you can opt them into the public build gallery.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Project Title</th>
                <th className="py-3 px-4 font-semibold">Unit Spec</th>
                <th className="py-3 px-4 font-semibold">Showcase Visibility</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-100">
                    <div className="flex flex-col">
                      <span>{proj.title}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        Audit #{proj.submission_id} · {proj.commit_sha.slice(0, 7)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">UNIT {proj.unit_id}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        proj.published
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {proj.published ? "PUBLISHED LIVE" : "UNPUBLISHED"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-3">
                    {proj.published && (
                      <Link
                        href={`/gallery/${proj.id}`}
                        className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <span>&rarr;</span>
                      </Link>
                    )}
                    <Link
                      href={`/submissions/${proj.submission_id}`}
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RebateMilestoneChip({
  title,
  amount,
  rebate,
  ruleSummary,
}: {
  title: string;
  amount: string;
  rebate?: Rebate;
  ruleSummary: string;
}) {
  const status = rebate?.status ?? "pending";
  const isEarned = status === "earned" || status === "paid";

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-semibold text-zinc-200">{title}</span>
        <span className="font-bold text-emerald-400">{amount}</span>
      </div>
      <p className="text-[11px] text-zinc-400 font-sans leading-tight">
        {ruleSummary}
      </p>
      <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
        <span className="text-zinc-500">Status:</span>
        <span
          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
            isEarned
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : status === "expired" || status === "forfeited"
              ? "bg-red-500/10 text-red-400 border border-red-500/30"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function UnitRowAction({
  unitId,
  enrolled,
  price,
}: {
  unitId: string;
  enrolled: boolean;
  price: EnrollResult<{ amount_cents: number; currency: string }> | undefined;
}) {
  if (enrolled) {
    return (
      <Link
        href={`/units/${unitId}`}
        className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
      >
        <span>Open bench</span>
        <span>&rarr;</span>
      </Link>
    );
  }

  const priceLabel =
    price?.state === "ok" ? formatPrice(price.data.amount_cents, price.data.currency) : null;

  return (
    <form action={startCheckoutAction} className="inline-block">
      <input type="hidden" name="unit_id" value={unitId} />
      <button
        type="submit"
        className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-mono font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-700 transition-colors"
      >
        {priceLabel ? `Enroll (${priceLabel})` : `Enroll unit ${unitId}`}
      </button>
    </form>
  );
}

function gatesUnlocksSentence(rule: GateRule, cleared: boolean): string {
  if (rule.unlocks.length === 0) {
    return cleared
      ? "Terminal capstone cleared."
      : "Final milestone barrier.";
  }
  const list = rule.unlocks.join(", ");
  return cleared ? `Units ${list} unlocked.` : `Passing unlocks units ${list}.`;
}

function GatesSection({ rules, lookup }: { rules: GateRule[]; lookup: GatesLookup }) {
  const passed = new Map<string, PassedGate>(
    lookup.state === "ok" ? lookup.data.gates_passed.map((g) => [g.gate_id, g]) : [],
  );

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <div className="p-5 border-b border-zinc-800/80">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
          Cryptographic Gate Barriers
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Deterministic milestones protecting advanced pipeline tracks.
        </p>
      </div>

      {lookup.state !== "ok" ? (
        <div className="p-6 text-xs font-mono text-zinc-400">
          Gate status is temporarily unavailable. Refresh in a moment.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Milestone Gate</th>
                <th className="py-3 px-4 font-semibold">Barrier Status</th>
                <th className="py-3 px-4 font-semibold">Unlock Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {rules.map((rule) => {
                const clearedAt = passed.get(rule.gate_id);
                const cleared = clearedAt !== undefined;
                return (
                  <tr key={rule.gate_id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-100">{rule.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          cleared
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {cleared ? "CLEARED" : "LOCKED"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {cleared && clearedAt
                        ? `Cleared on ${formatUtc(clearedAt.passed_at)}. ${gatesUnlocksSentence(rule, true)}`
                        : `${rule.summary} ${gatesUnlocksSentence(rule, false)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const GATE_LABELS: Record<string, string> = {
  "phase-5-integration": "Phase 5 integration gate ($300 rebate)",
  capstone: "Final capstone delivery ($300 rebate)",
};

function gateLabel(gateId: string): string {
  return GATE_LABELS[gateId] ?? gateId;
}

function rebateStatusLine(rebate: Rebate): string {
  const amount = formatPrice(rebate.amount_cents, rebate.currency);
  switch (rebate.status) {
    case "pending":
      return `Target window open until ${formatUtc(rebate.window_ends_at)}. Credited automatically on verified gate pass.`;
    case "earned":
      return `Earned ${amount} on ${formatUtc(rebate.earned_at ?? rebate.pledged_at)}. Payout initiated to card via Stripe.`;
    case "paid":
      return `Refund of ${amount} issued to payment method on ${formatUtc(rebate.paid_at ?? rebate.earned_at ?? rebate.pledged_at)}.`;
    case "forfeited":
      return `Forfeited on ${formatUtc(rebate.forfeited_at ?? rebate.pledged_at)}.`;
    case "expired":
      return `Target window expired on ${formatUtc(rebate.expired_at ?? rebate.window_ends_at)} without verified pass.`;
  }
}

function RebateSection({ rebates }: { rebates: Rebate[] }) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <div className="p-5 border-b border-zinc-800/80">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-100">
          30% Completion Rebate Settlement Ledger
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Automatic refund ledger wired to Stripe payout engine.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Rebate Milestone</th>
              <th className="py-3 px-4 font-semibold">Ledger Status</th>
              <th className="py-3 px-4 font-semibold">Settlement Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {rebates.map((rebate) => {
              return (
                <tr key={rebate.gate_id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-100">{gateLabel(rebate.gate_id)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        rebate.status === "earned" || rebate.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : rebate.status === "pending"
                          ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {rebate.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    {rebateStatusLine(rebate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecheckSection({ result }: { result: PracticeResult<RecheckSchedule> }) {
  const schedule = result.state === "ok" ? result.data : null;
  const dueSeeds = schedule ? schedule.seeds.filter((s) => s.status === "due") : [];
  const upcomingSeeds = schedule ? schedule.seeds.filter((s) => s.status === "upcoming") : [];
  const nextDueAt =
    upcomingSeeds
      .map((s) => s.due_at)
      .filter((d): d is string => !!d)
      .sort()[0] ?? null;

  return (
    <section
      data-keel-section="spaced-rechecks"
      className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            Active Spaced Re-Checks
          </h2>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {dueSeeds.length} DUE NOW
        </span>
      </div>

      <div>
        {!schedule ? (
          <p className="text-xs font-mono text-zinc-400">
            Re-check schedule is temporarily unavailable. Refresh in a moment.
          </p>
        ) : dueSeeds.length === 0 ? (
          <p className="text-xs text-zinc-400 font-sans">
            No re-checks due today. Passed drills reappear here after 3 days, then 7 days to consolidate recall.
            {nextDueAt ? ` Next scheduled drill: ${formatUtc(nextDueAt)}.` : ""}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {dueSeeds.map((s) => (
              <li
                key={`${s.unit_id}-${s.seed_index}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md border border-zinc-800 bg-zinc-950/60"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    UNIT {s.unit_id} · SEED {s.seed_index + 1}
                  </span>
                  <p className="text-xs text-zinc-300 line-clamp-1">{s.seed_prompt}</p>
                </div>
                <Link
                  href={`/units/${s.unit_id}#practice`}
                  className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors self-start sm:self-auto inline-block"
                >
                  Open drill &rarr;
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function DigestSection({ result }: { result: PracticeResult<LatestDigestResponse> }) {
  const digest = result.state === "ok" && result.data.has_digest ? result.data.digest : null;
  const content = digest?.content_json;
  const pillars = content?.pillars;

  if (!digest || !content || !pillars) {
    return (
      <section
        data-keel-section="weekly-digest"
        className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
              Your Weekly Dispatch
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">PROACTIVE RETENTION</span>
        </div>
        <p className="text-xs text-zinc-400 font-sans">
          Your weekly personalized digest synthesizes every Monday morning, mapping where you stand, what unlocks next on the Meridian route, and peer activity from your pod.
        </p>
      </section>
    );
  }

  const { current_location: loc, next_unlocks: unlocks, pod_activity: pod, rebate_status: rebate } = pillars;

  return (
    <section
      data-keel-section="weekly-digest"
      className="rounded-lg border border-emerald-500/30 bg-zinc-900/50 p-5 sm:p-6 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Your Weekly Dispatch & Flight Plan ({digest.cohort_week})
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Delivered to <span className="font-mono text-zinc-300">{digest.email_to}</span> on {formatUtc(digest.delivered_at || digest.created_at)}.
          </p>
        </div>
        <div className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
          {loc.is_idle ? "REACH-OUT DISPATCH" : "ACTIVE MOMENTUM"}
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Location */}
        <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
              1. Current Location
            </span>
            <span className="text-[10px] text-zinc-400">Unit {loc.active_unit}</span>
          </div>
          <div className="text-sm font-semibold font-mono text-zinc-200">{loc.active_unit_title}</div>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">{loc.note}</p>
        </div>

        {/* Pillar 2: Unlocks */}
        <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
              2. Next Unlocks
            </span>
            <span className="text-[10px] text-zinc-400">Phase {unlocks.meridian_phase_next}</span>
          </div>
          <ul className="text-xs font-mono text-zinc-300 space-y-1">
            {unlocks.next_units.slice(0, 2).map((u) => (
              <li key={u.unit_id} className="flex items-center gap-1.5 truncate">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span className="text-zinc-200">Unit {u.unit_id}:</span>
                <span className="text-zinc-400 truncate">{u.title}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-zinc-500 font-sans">{unlocks.summary}</p>
        </div>

        {/* Pillar 3: Pod Highlights */}
        <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
              3. Pod Activity
            </span>
            <span className="text-[10px] text-zinc-400 truncate max-w-[120px]">{pod.pod_name}</span>
          </div>
          <div className="space-y-2 text-xs">
            {pod.highlights.slice(0, 2).map((h, i) => (
              <div key={i} className="rounded bg-zinc-900/60 p-2 text-[11px] space-y-0.5">
                <div className="font-mono font-semibold text-zinc-300">{h.author}:</div>
                <div className="text-zinc-400 line-clamp-1"><strong className="text-zinc-300">Shipped:</strong> {h.shipped}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillar 4: Rebates */}
        <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
              4. Rebate Progress
            </span>
            <span className="text-emerald-400 font-bold font-mono">
              ${rebate.earned_cents / 100} / ${rebate.pledged_cents / 100}
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">{rebate.summary}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {rebate.milestones.map((m) => (
              <span
                key={m.gate_id}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
              >
                {m.gate_id}: <strong className="text-emerald-400">${m.amount_cents / 100}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SubmissionsBody({
  submissions,
  error,
}: {
  submissions: OwnSubmission[];
  error: boolean;
}) {
  if (error) {
    return (
      <div className="p-6 text-xs font-mono text-zinc-400">
        Grading history is temporarily unavailable. Refresh in a moment.
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center space-y-3 font-mono">
        <p className="text-xs text-zinc-400">No automated submissions recorded yet.</p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 underline"
        >
          <span>View git submission instructions</span>
          <span>&rarr;</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs font-mono">
        <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-3 px-4 font-semibold">Submission Record</th>
            <th className="py-3 px-4 font-semibold">Target Unit</th>
            <th className="py-3 px-4 font-semibold">Runner Status</th>
            <th className="py-3 px-4 font-semibold">Verdict</th>
            <th className="py-3 px-4 text-right font-semibold">Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
          {submissions.map((s) => {
            return (
              <tr key={s.id} className="hover:bg-zinc-900/60 transition-colors">
                <td className="py-3 px-4 font-bold text-zinc-100">
                  <Link
                    href={`/submissions/${s.id}`}
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Record #{s.id}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-zinc-300">UNIT {s.unit_id}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                    {s.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      s.overall === "pass"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : s.overall === "fail"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {s.overall ?? "PENDING"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-zinc-400">{formatUtc(s.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

