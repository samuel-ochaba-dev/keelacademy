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
      {/* Header */}
      <header>
        <div>
          <nav aria-label="Breadcrumb">
            <Link href="/curriculum">CURRICULUM</Link>
            <Link href={`/curriculum#phase-${yaml.phase}`}>PHASE-{yaml.phase}</Link>
            <span>UNIT-{yaml.id}</span>
          </nav>

          <div>
            <div>
              <div>
                <span>
                  UNIT {yaml.id} SPECIFICATION
                </span>
                <span>
                  
                  GRADING ACTIVE
                </span>
              </div>
              <h1>
                {lesson?.title ?? curriculum?.title ?? `Unit ${yaml.id}`}
              </h1>
              <p>
                PHASE {yaml.phase} · {yaml.est_hours ? `~${yaml.est_hours} HOURS` : "CORE DELIVERABLE"} · MERIDIAN MUTUAL CLAIMS CORPUS
              </p>
            </div>

            <dl>
              <Spec label="Prerequisites" value={yaml.prereq_units.length > 0 ? yaml.prereq_units.join(", ") : "ENTRY POINT"} />
              <Spec label="Unlocks" value={yaml.gate.unlocks.length > 0 ? yaml.gate.unlocks.join(", ") : "PHASE GATE"} />
              <Spec label="Corpus Variant" value={yaml.build.data_variant} />
            </dl>
          </div>

          {subtitleParts.length > 0 ? (
            <div>
              {subtitleParts.map((part) => (
                <span key={part}>
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
      >
        <div>
          <div>
            {SECTION_ANCHORS.map((anchor) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
              >
                {anchor.label.toUpperCase()}
              </a>
            ))}
          </div>
          <Link href="/submit">
            <span>Submission Guide</span>
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

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
