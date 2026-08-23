import { SectionHeading } from "@/components/unit/section-heading";
import type { Check, CurriculumAnchor, Rubric, UnitYaml } from "@/lib/content";
import { humanizeId } from "@/lib/text";

const LAYER_LABELS = [
  { name: "Layer 1: Automated sandbox checks", note: "Unit pytest suites run in an isolated Docker container" },
  { name: "Layer 2: Rubric evaluation judge", note: "Qualitative review requiring quoted lines of code for every criterion" },
  { name: "Layer 3: Defend your work", note: "Code interrogation questions generated directly from your submission" },
  { name: "Layer 4: Recorded walkthrough", note: "Unscripted video walkthrough for integration gates and capstone" },
];

function expectLabel(expect: Check["expect"]): string {
  if (expect === "exit_zero") return "must exit 0";
  if (expect === "exit_nonzero") return "must exit non-zero";
  return `must print: ${(expect as { output_contains: string }).output_contains}`;
}

type VerifySectionProps = {
  unit: UnitYaml;
  checks: Check[] | null;
  rubric: Rubric | null;
  curriculum: CurriculumAnchor | null;
};

export function VerifySection({ unit, checks, rubric, curriculum }: VerifySectionProps) {
  return (
    <section id="verify" data-keel-section="verify">
      <div>
        <hr />
        <SectionHeading
          title="Verify"
          lead="The published grading bar: every automated test and rubric criterion required to pass."
        />

        {curriculum?.proveIt ? (
          <div>
            <p><strong>The Graduation Standard:</strong></p>
            <p>{curriculum.proveIt}</p>
          </div>
        ) : null}

        <h3>Active Verification Layers</h3>
        <ul>
          {LAYER_LABELS.map((layer, index) => {
            const applies = unit.verify.layers.includes(index + 1);
            return (
              <li key={layer.name}>
                <strong>{layer.name}</strong> ({applies ? "active this unit" : "integration only"})
                <p>{layer.note}</p>
              </li>
            );
          })}
        </ul>

        {checks && checks.length > 0 ? (
          <div>
            <h3>Layer 1: {checks.length} Automated Sandbox Checks</h3>
            <table border={1}>
              <thead>
                <tr>
                  <th>Check ID</th>
                  <th>Expected Result</th>
                  <th>Command</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => (
                  <tr key={check.id}>
                    <td><strong>{humanizeId(check.id)}</strong></td>
                    <td>{expectLabel(check.expect)}</td>
                    <td><code>{check.run}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {rubric ? (
          <div>
            <h3>Layer 2: {rubric.criteria.length} Rubric Criteria</h3>
            <p>
              <em>Judge: {rubric.judge.model_tier}-tier model · Pass rule: {rubric.pass_rule}</em>
            </p>

            <ol>
              {rubric.criteria.map((criterion, index) => (
                <li key={criterion.id}>
                  <strong>{humanizeId(criterion.id)}</strong>
                  <p>{criterion.description}</p>
                  <p><strong>Required evidence:</strong> {criterion.evidence}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </section>
  );
}
