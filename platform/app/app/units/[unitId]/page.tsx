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
  type PracticeAttemptSummary,
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
    }
  }

  const manifestRes = await fetchPracticeManifest(unitId);
  const practiceManifest = manifestRes.state === "ok" ? manifestRes.data : null;
  const practiceServiceDown = manifestRes.state === "unreachable";

  return (
    <article>
      {/* Header */}
      <header className="border-b border-line bg-raised/30">
        <div className="shell pt-8 pb-10">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href="/curriculum">curriculum</Link>
            <IconChevronRight size={11} />
            <Link href={`/curriculum#phase-${yaml.phase}`}>phase-{yaml.phase}</Link>
            <IconChevronRight size={11} />
            <span className="text-ink-2">unit-{yaml.id}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="chip-accent font-medium">unit {yaml.id}</span>
                <span className="chip-accent">
                  <span className="live-dot" aria-hidden />
                  live and grading
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {lesson?.title ?? curriculum?.title ?? `Unit ${yaml.id}`}
              </h1>
              <p className="mt-3 font-mono text-xs text-ink-3">
                phase {yaml.phase}
                {yaml.est_hours ? ` / ~${yaml.est_hours} hours estimated` : " / core deliverable"}
              </p>
            </div>

            <dl className="grid w-full max-w-md grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line sm:w-auto">
              <Spec label="Prerequisites" value={yaml.prereq_units.length > 0 ? yaml.prereq_units.join(", ") : "None (entry point)"} />
              <Spec label="Unlocks" value={yaml.gate.unlocks.length > 0 ? yaml.gate.unlocks.join(", ") : "Next unit"} />
              <Spec label="Data variant" value={yaml.build.data_variant} />
            </dl>
          </div>

          {subtitleParts.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {subtitleParts.map((part) => (
                <span key={part} className="chip">
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
        className="sticky top-16 z-40 border-b border-line bg-ground/90 backdrop-blur-md"
      >
        <div className="shell flex items-center justify-between gap-4 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1.5">
            {SECTION_ANCHORS.map((anchor) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                className="rounded-full border border-transparent px-3.5 py-1.5 text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink"
              >
                {anchor.label}
              </a>
            ))}
          </div>
          <Link href="/submit" className="link-arrow shrink-0 text-xs">
            Submission guide
            <IconArrowRight size={12} />
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
    <div className="bg-raised px-4 py-3">
      <dt className="font-mono text-[10px] tracking-[0.1em] text-ink-3 uppercase">{label}</dt>
      <dd className="mt-1 font-mono text-xs break-words text-ink">{value}</dd>
    </div>
  );
}
