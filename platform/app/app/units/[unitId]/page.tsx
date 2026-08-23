import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { assertValidUnitId, loadUnit, type Unit } from "@/lib/content";
import { LearnSection } from "@/components/unit/learn-section";
import { PracticeSection } from "@/components/unit/practice-section";
import { BuildSection } from "@/components/unit/build-section";
import { VerifySection } from "@/components/unit/verify-section";
import { UnstuckSection } from "@/components/unit/unstuck-section";

export const dynamic = "force-dynamic";

const SECTION_ANCHORS = [
  { id: "learn", label: "1. Learn" },
  { id: "practice", label: "2. Practice" },
  { id: "build", label: "3. Build" },
  { id: "verify", label: "4. Verify" },
  { id: "unstuck", label: "5. Unstuck" },
];

function tryLoadUnit(unitId: string): Unit | null {
  try {
    return loadUnit(unitId);
  } catch {
    return null;
  }
}

export async function generateMetadata(props: PageProps<"/units/[unitId]">): Promise<Metadata> {
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

  const { yaml, lesson, workedExample, completionProblem, checks, contract, rubric, faq, curriculum } = unit;
  const subtitleParts = lesson?.subtitle ? lesson.subtitle.split("·").map((part) => part.trim()).filter(Boolean) : [];

  return (
    <article>
      {/* Unit Header */}
      <header>
        <p>
          <strong>Unit {yaml.id}</strong> · Phase {yaml.phase} {yaml.est_hours ? `· ${yaml.est_hours} hours` : ""}
        </p>

        <h1>
          {lesson?.title ?? curriculum?.title ?? `Unit ${yaml.id}`}
        </h1>

        {subtitleParts.length > 0 ? (
          <p>
            {subtitleParts.join(" · ")}
          </p>
        ) : null}

        <table border={1}>
          <tbody>
            <tr>
              <td><strong>Prerequisites:</strong></td>
              <td>{yaml.prereq_units.length > 0 ? yaml.prereq_units.join(", ") : "None"}</td>
            </tr>
            <tr>
              <td><strong>Unlocks:</strong></td>
              <td>{yaml.gate.unlocks.join(", ")}</td>
            </tr>
            <tr>
              <td><strong>Data Variant:</strong></td>
              <td>{yaml.build.data_variant}</td>
            </tr>
          </tbody>
        </table>
      </header>

      {/* Step Navigation */}
      <nav aria-label="Unit sections">
        <p>
          {SECTION_ANCHORS.map((anchor, i) => (
            <span key={anchor.id}>
              {i > 0 ? " | " : ""}
              <a href={`#${anchor.id}`}>
                {anchor.label}
              </a>
            </span>
          ))}
        </p>
      </nav>

      {/* Five Unit Sections */}
      <LearnSection lesson={lesson} curriculum={curriculum} lastVerified={yaml.last_verified} />
      <PracticeSection
        workedExample={workedExample}
        completionProblem={completionProblem}
        retrievalSeeds={yaml.practice.retrieval_seeds}
      />
      <BuildSection unit={yaml} contract={contract} />
      <VerifySection unit={yaml} checks={checks} rubric={rubric} curriculum={curriculum} />
      <UnstuckSection unit={yaml} faq={faq} />
    </article>
  );
}
