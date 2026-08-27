import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assertValidUnitId, loadUnit, type Unit } from "@/lib/content";
import { LearnSection } from "@/components/unit/learn-section";
import { PracticeSection } from "@/components/unit/practice-section";
import { BuildSection } from "@/components/unit/build-section";
import { VerifySection } from "@/components/unit/verify-section";
import { UnstuckSection } from "@/components/unit/unstuck-section";
import { IconArrowRight, IconChevronRight } from "@/components/icons";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent, fetchProfile } from "@/lib/enroll";
import {
  fetchPracticeAttempts,
  fetchPracticeManifest,
  fetchPracticeRoute,
  fetchRecheckSchedule,
  fetchRetrievalAttempts,
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
];

function tryLoadUnit(unitId: string): Unit | null {
  try {
    return loadUnit(unitId);
  } catch {
    return null;
  }
}

export async function generateMetadata(
  props: PageProps<"/units/[unitId]">,
): Promise<Metadata> {
  const { unitId } = await props.params;
  const unit = tryLoadUnit(unitId);
  if (!unit) return { title: "Unit not found" };
  return {
    title: `Unit ${unit.yaml.id}: ${unit.lesson?.title ?? unit.curriculum?.title ?? unit.yaml.id}`,
    description: unit.yaml.build.deliverable,
  };
}

export default async function UnitPage(props: PageProps<"/units/[unitId]">) {
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
      }
    }
  }

  const manifestRes = await fetchPracticeManifest(unitId);
  const practiceManifest = manifestRes.state === "ok" ? manifestRes.data : null;
  const practiceServiceDown = manifestRes.state === "unreachable";

  return (
    <article className="space-y-0">
      {/* Header */}
      <header className="border-b border-line bg-canvas pt-8 pb-8">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/curriculum">CURRICULUM</Link>
            <IconChevronRight size={10} />
            <Link href={`/curriculum#phase-${yaml.phase}`}>PHASE-{yaml.phase}</Link>
            <IconChevronRight size={10} />
            <span className="text-ink font-semibold">UNIT-{yaml.id}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-accent/40 bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent font-semibold">
                  UNIT {yaml.id} SPECIFICATION
                </span>
                <span className="rounded border border-pass/40 bg-pass-soft px-2 py-0.5 font-mono text-[10px] text-pass font-semibold flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-pass" />
                  GRADING ACTIVE
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {lesson?.title ?? curriculum?.title ?? `Unit ${yaml.id}`}
              </h1>
              <p className="mt-2 font-mono text-xs text-ink-3">
                PHASE {yaml.phase} · {yaml.est_hours ? `~${yaml.est_hours} HOURS` : "CORE DELIVERABLE"} · MERIDIAN MUTUAL CLAIMS CORPUS
              </p>
            </div>

            <dl className="grid w-full max-w-md grid-cols-3 gap-px overflow-hidden rounded border border-line bg-line sm:w-auto font-mono">
              <Spec label="Prerequisites" value={yaml.prereq_units.length > 0 ? yaml.prereq_units.join(", ") : "ENTRY POINT"} />
              <Spec label="Unlocks" value={yaml.gate.unlocks.length > 0 ? yaml.gate.unlocks.join(", ") : "PHASE GATE"} />
              <Spec label="Corpus Variant" value={yaml.build.data_variant} />
            </dl>
          </div>

          {subtitleParts.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {subtitleParts.map((part) => (
                <span key={part} className="rounded border border-line bg-raised px-2 py-0.5 font-mono text-[10px] text-ink-3">
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
        className="sticky top-14 z-40 border-b border-line bg-ground/90 backdrop-blur-md"
      >
        <div className="shell flex items-center justify-between gap-4 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1">
            {SECTION_ANCHORS.map((anchor) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                className="rounded px-2.5 py-1 font-mono text-xs text-ink-3 transition-colors hover:bg-raised hover:text-ink"
              >
                {anchor.label.toUpperCase()}
              </a>
            ))}
          </div>
          <Link href="/submit" className="link-arrow shrink-0 text-xs">
            <span>Submission Guide</span>
            <IconArrowRight size={11} />
          </Link>
        </div>
      </nav>

      {/* Five unit sections */}
      <div>
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
      </div>
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-raised px-3.5 py-2.5">
      <dt className="font-mono text-[9px] text-ink-4 uppercase tracking-wider">{label}</dt>
      <dd className="mt-0.5 font-mono text-xs break-words text-ink font-medium">{value}</dd>
    </div>
  );
}
