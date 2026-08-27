import { SectionHeading } from "@/components/unit/section-heading";
import type { Check, CurriculumAnchor, Rubric, UnitYaml } from "@/lib/content";
import { humanizeId } from "@/lib/text";

const LAYER_INFO = [
  { num: 1, name: "Automated sandbox checks", note: "Pytest suites in an isolated container" },
  { num: 2, name: "Calibrated rubric judge", note: "LLM judge requiring quoted lines of code as evidence" },
  { num: 3, name: "Defend your work", note: "Code interrogation interview triggered at gate units" },
  { num: 4, name: "Recorded walkthrough", note: "Unscripted video walkthrough at high-stakes gates" },
];

function expectLabel(expect: Check["expect"]): { text: string } {
  if (expect === "exit_zero") return { text: "exit 0 (pass)" };
  if (expect === "exit_nonzero") return { text: "exit non-zero (fail)" };
  return { text: `contains: "${(expect as { output_contains: string }).output_contains}"` };
}

type VerifySectionProps = {
  unit: UnitYaml;
  checks: Check[] | null;
  rubric: Rubric | null;
  curriculum: CurriculumAnchor | null;
};

export function VerifySection({ unit, checks, rubric, curriculum }: VerifySectionProps) {
  return (
    <section
      id="verify"
      data-keel-section="verify"
    >
      <div>
        <SectionHeading
          stepNumber="04"
          title="Verify: Hardened Grading Pipeline"
          lead="The published grading standard: every automated test and rubric criterion your code must pass before you move forward."
        />

        {curriculum?.proveIt ? (
          <div>
            <span>
              PHASE VERIFICATION STANDARD
            </span>
            <p>{curriculum.proveIt}</p>
          </div>
        ) : null}

        {/* Verification stack */}
        <div>
          <span>
            VERIFICATION LAYERS ACTIVATED FOR UNIT {unit.id}
          </span>
          <div>
            {LAYER_INFO.map((layer) => {
              const applies = unit.verify.layers.includes(layer.num);
              return (
                <div
                  key={layer.name}
                >
                  <div>
                    <div>
                      <span>
                        LAYER 0{layer.num}
                      </span>
                      <span>
                        {applies ? "ACTIVE" : "MILESTONE ONLY"}
                      </span>
                    </div>
                    <p>
                      {layer.name}
                    </p>
                    <p>{layer.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 1 checks */}
        {checks && checks.length > 0 ? (
          <div>
            <div>
              <div>
                <h3>
                  LAYER 01 · {checks.length} DETERMINISTIC SANDBOX ASSERTIONS
                </h3>
              </div>
              <span>EPHEMERAL RUNNER</span>
            </div>

            <div>
              <table>
                <thead>
                  <tr>
                    <th>Assertion Name</th>
                    <th>Expected State</th>
                    <th>Runner Command</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((check) => {
                    const { text } = expectLabel(check.expect);
                    return (
                      <tr key={check.id}>
                        <td>{humanizeId(check.id)}</td>
                        <td>
                          <span>
                            {text}
                          </span>
                        </td>
                        <td>
                          <code>{check.run}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Layer 2 rubric */}
        {rubric ? (
          <div>
            <div>
              <div>
                <h3>
                  LAYER 02 · {rubric.criteria.length} EVIDENCE-BACKED RUBRIC CRITERIA
                </h3>
              </div>
              <span>TIER: {rubric.judge.model_tier.toUpperCase()}</span>
            </div>

            <div>
              {rubric.criteria.map((criterion, idx) => (
                <div key={criterion.id}>
                  <div>
                    <span>CRITERION 0{idx + 1}</span>
                    <span>/</span>
                    <h4>
                      {humanizeId(criterion.id)}
                    </h4>
                  </div>
                  <p>
                    {criterion.description}
                  </p>
                  <p>
                    REQUIRED QUOTE EVIDENCE: {criterion.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
