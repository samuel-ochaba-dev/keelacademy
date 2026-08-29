import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assertValidUnitId, loadUnit, type Unit } from "@/lib/content";
import { LearnSection } from "@/components/unit/learn-section";
import { PracticeSection } from "@/components/unit/practice-section";
import { BuildSection } from "@/components/unit/build-section";
import { VerifySection } from "@/components/unit/verify-section";
import { UnstuckSection } from "@/components/unit/unstuck-section";
import { ConciergePanel } from "@/components/unit/concierge-panel";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent, fetchProfile } from "@/lib/enroll";
import {
  fetchConciergeTurns,
  fetchPracticeAttempts,
  fetchPracticeManifest,
  fetchPracticeRoute,
  fetchRecheckSchedule,
  fetchRetrievalAttempts,
  type ConciergeTurn,
  type PracticeAttemptSummary,
  type PracticeRouteData,
  type RetrievalAttemptSummary,
} from "@/lib/practice";

export const dynamic = "force-dynamic";

const SECTION_ANCHORS = [
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practice" },
  { id: "build", label: "Build" },
  { id: "verify", label: "Verify" },
  { id: "unstuck", label: "Unstuck" },
  { id: "concierge", label: "Concierge" },
];

function tryLoadUnit(unitId: string): Unit | null {
  try {
    return loadUnit(unitId);
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ unitId: string }>;
};

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const { unitId } = await props.params;
  const unit = tryLoadUnit(unitId);
  if (!unit) return { title: "Unit not found" };
  return {
    title: `Unit ${unit.yaml.id}: ${unit.lesson?.title ?? unit.curriculum?.title ?? unit.yaml.id}`,
    description: unit.yaml.build.deliverable,
  };
}

export default async function UnitPage(props: Props) {
  const { unitId } = await props.params;
  try {
    assertValidUnitId(unitId);
  } catch {
    notFound();
  }
  const unit = tryLoadUnit(unitId);
  if (!unit) notFound();

  const {
    yaml,
    lesson,
    workedExample,
    completionProblem,
    checks,
    contract,
    rubric,
    faq,
    curriculum,
  } = unit;
  const subtitleParts = lesson?.subtitle
    ? lesson.subtitle
        .split("·")
        .map((part) => part.trim())
        .filter(Boolean)
    : [];

  const user = await getSessionUser();
  const isSignedIn = !!user;
  let isEnrolled = false;
  let studentId: number | null = null;
  let practiceAttempts: PracticeAttemptSummary[] = [];
  let retrievalAttempts: RetrievalAttemptSummary[] = [];
  let dueSeedIndices: number[] = [];
  let routeData: PracticeRouteData | null = null;
  let conciergeTurns: ConciergeTurn[] = [];

  if (user) {
    const studentRes = await ensureStudent(user);
    if (studentRes.state === "ok") {
      studentId = studentRes.data;
      const profileRes = await fetchProfile(studentId);
      if (profileRes.state === "ok") {
        isEnrolled = profileRes.data.enrollments.some(
          (e) => e.unit_id === unitId && e.status === "active",
        );
      }
      const attemptsRes = await fetchPracticeAttempts(studentId, unitId);
      if (attemptsRes.state === "ok") {
        practiceAttempts = attemptsRes.data.attempts;
      }
      const retrievalRes = await fetchRetrievalAttempts(studentId, unitId);
      if (retrievalRes.state === "ok") {
        retrievalAttempts = retrievalRes.data.attempts;
      }
      const scheduleRes = await fetchRecheckSchedule(studentId, unitId);
      if (scheduleRes.state === "ok") {
        dueSeedIndices = scheduleRes.data.seeds
          .filter((s) => s.status === "due")
          .map((s) => s.seed_index);
      }
      if (isEnrolled) {
        const routeRes = await fetchPracticeRoute(studentId, unitId);
        if (routeRes.state === "ok") {
          routeData = routeRes.data;
        }
        const turnsRes = await fetchConciergeTurns(studentId, unitId);
        if (turnsRes.state === "ok") {
          conciergeTurns = turnsRes.data.turns;
        }
      }
    }
  }

  const manifestRes = await fetchPracticeManifest(unitId);
  const practiceManifest = manifestRes.state === "ok" ? manifestRes.data : null;
  const practiceServiceDown = manifestRes.state === "unreachable";

  return (
    <article>
      {/* Header & Context HUD */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-500 uppercase mb-4">
            <Link href="/curriculum" className="hover:text-zinc-300 transition-colors">
              CURRICULUM
            </Link>
            <span className="text-zinc-700">/</span>
            <Link href={`/curriculum#phase-${yaml.phase}`} className="hover:text-zinc-300 transition-colors">
              PHASE {yaml.phase}
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-sky-400 font-semibold">UNIT {yaml.id}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  UNIT {yaml.id} SPECIFICATION
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GRADING PIPELINE ACTIVE
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
                  TIER: {unit.rubric ? unit.rubric.judge.model_tier.toUpperCase() : "DETERMINISTIC"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-100 font-mono">
                {lesson?.title ?? curriculum?.title ?? `Unit ${yaml.id}`}
              </h1>

              <p className="text-sm text-zinc-400 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>PHASE {yaml.phase}</span>
                <span className="text-zinc-700">·</span>
                <span>{yaml.est_hours ? `~${yaml.est_hours} HOURS` : "CORE DELIVERABLE"}</span>
                <span className="text-zinc-700">·</span>
                <span className="text-zinc-300">MERIDIAN MUTUAL CORPUS</span>
              </p>
            </div>

            {/* Spec HUD Cards */}
            <dl className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 text-xs font-mono min-w-[240px] bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3">
              <Spec
                label="Prerequisites"
                value={yaml.prereq_units.length > 0 ? yaml.prereq_units.join(", ") : "ENTRY POINT"}
                highlight={yaml.prereq_units.length === 0}
              />
              <Spec
                label="Unlocks"
                value={yaml.gate.unlocks.length > 0 ? yaml.gate.unlocks.join(", ") : "PHASE GATE"}
              />
              <Spec
                label="Corpus Variant"
                value={yaml.build.data_variant}
              />
            </dl>
          </div>

          {subtitleParts.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-zinc-900">
              {subtitleParts.map((part) => (
                <span
                  key={part}
                  className="px-2.5 py-1 rounded text-xs font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800/80"
                >
                  {part}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {/* Sticky section nav */}
      <nav
        aria-label="Unit sections"
        className="sticky top-14 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-2.5 gap-4 scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {SECTION_ANCHORS.map((anchor, idx) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                className="px-3 py-1.5 rounded-md text-xs font-mono font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all flex items-center gap-1.5"
              >
                <span className="text-zinc-600">0{idx + 1}.</span>
                <span>{anchor.label}</span>
              </a>
            ))}
          </div>
          <Link
            href="/submit"
            className="text-xs font-mono px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-700/80 transition-colors whitespace-nowrap hidden sm:inline-flex items-center gap-1.5"
          >
            <span>Submission Guide →</span>
          </Link>
        </div>
      </nav>

      {/* Five unit sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-16">
        <LearnSection lesson={lesson} curriculum={curriculum} lastVerified={yaml.last_verified} />
        <PracticeSection
          unitId={yaml.id}
          workedExample={workedExample}
          completionProblem={completionProblem}
          retrievalSeeds={yaml.practice.retrieval_seeds}
          manifest={practiceManifest}
          initialAttempts={practiceAttempts}
          initialRetrievalAttempts={retrievalAttempts}
          dueSeedIndices={dueSeedIndices}
          routeData={routeData}
          isEnrolled={isEnrolled}
          isSignedIn={isSignedIn}
          serviceDown={practiceServiceDown}
        />
        <BuildSection unit={yaml} contract={contract} />
        <VerifySection unit={yaml} checks={checks} rubric={rubric} curriculum={curriculum} />
        <UnstuckSection unit={yaml} faq={faq} />
        <ConciergePanel
          unitId={yaml.id}
          isEnrolled={isEnrolled}
          isSignedIn={isSignedIn}
          serviceDown={practiceServiceDown}
          routeData={routeData}
          initialTurns={conciergeTurns}
        />
      </div>
    </article>
  );
}

function Spec({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-zinc-800/40 last:border-0">
      <dt className="text-zinc-500 uppercase tracking-wider">{label}</dt>
      <dd className={`font-semibold ${highlight ? "text-sky-400" : "text-zinc-200"}`}>{value}</dd>
    </div>
  );
}
