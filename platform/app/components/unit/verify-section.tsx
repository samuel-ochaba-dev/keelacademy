import { SectionHeading } from "@/components/unit/section-heading";
import type { Check, CurriculumAnchor, Rubric, UnitYaml } from "@/lib/content";
import { humanizeId } from "@/lib/text";
import { IconTerminal, IconShieldCheck, IconCpu, IconAward } from "@/components/icons";

const LAYER_INFO = [
  { num: 1, name: "Automated sandbox checks", icon: IconTerminal, note: "Pytest suites in an isolated container" },
  { num: 2, name: "Calibrated rubric judge", icon: IconShieldCheck, note: "LLM judge requiring quoted lines of code as evidence" },
  { num: 3, name: "Defend your work", icon: IconCpu, note: "Code interrogation interview triggered at gate units" },
  { num: 4, name: "Recorded walkthrough", icon: IconAward, note: "Unscripted video walkthrough at high-stakes gates" },
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
      className="scroll-mt-20 border-t border-line bg-raised/30"
    >
      <div className="shell py-14">
        <SectionHeading
          title="Verify"
          lead="The published grading bar: every automated test and rubric criterion required to pass."
        />

        {curriculum?.proveIt ? (
          <div className="mt-8 rounded-xl border border-line bg-raised p-6">
            <p className="font-mono text-[11px] tracking-[0.1em] text-accent uppercase">
              The graduation standard
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{curriculum.proveIt}</p>
          </div>
        ) : null}

        {/* Verification stack */}
        <div className="mt-10">
          <h3 className="text-base font-semibold text-ink">
            Verification stack for unit {unit.id}
          </h3>
          <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {LAYER_INFO.map((layer) => {
              const applies = unit.verify.layers.includes(layer.num);
              const Icon = layer.icon;
              return (
                <div
                  key={layer.name}
                  className={`flex items-start gap-4 p-5 ${applies ? "bg-raised" : "bg-raised/40"}`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg border ${
                      applies
                        ? "border-accent/30 bg-accent-soft text-accent"
                        : "border-line bg-inset text-ink-3"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className={`font-mono text-[11px] ${applies ? "text-accent" : "text-ink-3"}`}>
                        Layer {layer.num}
                      </span>
                      <span className={applies ? "chip-accent" : "chip"}>
                        {applies ? "active" : "gate only"}
                      </span>
                    </div>
                    <p className={`mt-1.5 text-sm font-medium ${applies ? "text-ink" : "text-ink-3"}`}>
                      {layer.name}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{layer.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 1 checks */}
        {checks && checks.length > 0 ? (
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2.5 text-base font-semibold text-ink">
                <IconTerminal size={18} className="text-accent" />
                Layer 1: {checks.length} automated sandbox checks
              </h3>
              <span className="chip">deterministic CI</span>
            </div>

            <div className="panel mt-4 overflow-x-auto p-2">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Check</th>
                    <th>Expected result</th>
                    <th>Command executed</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((check) => {
                    const { text } = expectLabel(check.expect);
                    return (
                      <tr key={check.id}>
                        <td className="font-medium text-ink">{humanizeId(check.id)}</td>
                        <td>
                          <span className="chip-pass">{text}</span>
                        </td>
                        <td>
                          <code className="text-xs">{check.run}</code>
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
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2.5 text-base font-semibold text-ink">
                <IconShieldCheck size={18} className="text-accent" />
                Layer 2: {rubric.criteria.length} rubric criteria
              </h3>
              <div className="flex gap-2">
                <span className="chip">judge tier {rubric.judge.model_tier}</span>
                <span className="chip">pass rule {rubric.pass_rule}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {rubric.criteria.map((criterion, idx) => (
                <div key={criterion.id} className="panel p-5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-accent">{idx + 1}</span>
                    <h4 className="text-[15px] font-semibold text-ink">
                      {humanizeId(criterion.id)}
                    </h4>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
                    {criterion.description}
                  </p>
                  <p className="mt-3 border-l-2 border-accent/40 pl-3 text-[13px] leading-relaxed text-ink-3">
                    Required evidence: {criterion.evidence}
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
