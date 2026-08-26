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
      className="scroll-mt-20 border-t border-line bg-raised/20"
    >
      <div className="shell py-12">
        <SectionHeading
          stepNumber="04"
          title="Verify: Hardened Grading Pipeline"
          lead="The published grading standard: every automated test and rubric criterion your code must pass before you move forward."
        />

        {curriculum?.proveIt ? (
          <div className="mt-6 rounded border border-line bg-raised p-5 space-y-1">
            <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold block">
              PHASE VERIFICATION STANDARD
            </span>
            <p className="text-xs leading-relaxed text-ink-2">{curriculum.proveIt}</p>
          </div>
        ) : null}

        {/* Verification stack */}
        <div className="mt-8 space-y-3">
          <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider block">
            VERIFICATION LAYERS ACTIVATED FOR UNIT {unit.id}
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {LAYER_INFO.map((layer) => {
              const applies = unit.verify.layers.includes(layer.num);
              const Icon = layer.icon;
              return (
                <div
                  key={layer.name}
                  className={`rounded border p-4 flex items-start gap-3.5 ${
                    applies ? "border-line bg-raised" : "border-line/60 bg-raised/40 opacity-70"
                  }`}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded border ${
                      applies
                        ? "border-accent/30 bg-inset text-accent"
                        : "border-line bg-inset text-ink-4"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] font-semibold ${applies ? "text-accent" : "text-ink-4"}`}>
                        LAYER 0{layer.num}
                      </span>
                      <span className={`rounded border px-1.5 py-0.2 font-mono text-[9px] uppercase ${
                        applies ? "border-pass/30 bg-pass-soft text-pass" : "border-line text-ink-4"
                      }`}>
                        {applies ? "ACTIVE" : "MILESTONE ONLY"}
                      </span>
                    </div>
                    <p className={`text-xs font-semibold ${applies ? "text-ink" : "text-ink-3"}`}>
                      {layer.name}
                    </p>
                    <p className="text-[11px] leading-relaxed text-ink-3">{layer.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 1 checks */}
        {checks && checks.length > 0 ? (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconTerminal size={14} className="text-accent" />
                <h3 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
                  LAYER 01 · {checks.length} DETERMINISTIC SANDBOX ASSERTIONS
                </h3>
              </div>
              <span className="font-mono text-[10px] text-pass">EPHEMERAL RUNNER</span>
            </div>

            <div className="rounded border border-line bg-raised overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-inset font-mono text-[10px] text-ink-4 uppercase">
                    <th className="py-2.5 px-4 font-semibold">Assertion Name</th>
                    <th className="py-2.5 px-4 font-semibold">Expected State</th>
                    <th className="py-2.5 px-4 font-semibold">Runner Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {checks.map((check) => {
                    const { text } = expectLabel(check.expect);
                    return (
                      <tr key={check.id} className="hover:bg-raised-2/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-ink">{humanizeId(check.id)}</td>
                        <td className="py-2.5 px-4">
                          <span className="rounded border border-pass/30 bg-pass-soft px-1.5 py-0.5 font-mono text-[10px] text-pass">
                            {text}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-accent">
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
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconShieldCheck size={14} className="text-accent" />
                <h3 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
                  LAYER 02 · {rubric.criteria.length} EVIDENCE-BACKED RUBRIC CRITERIA
                </h3>
              </div>
              <span className="font-mono text-[10px] text-ink-3">TIER: {rubric.judge.model_tier.toUpperCase()}</span>
            </div>

            <div className="space-y-3">
              {rubric.criteria.map((criterion, idx) => (
                <div key={criterion.id} className="rounded border border-line bg-raised p-4 space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-accent font-semibold">CRITERION 0{idx + 1}</span>
                    <span className="text-ink-4">/</span>
                    <h4 className="font-semibold text-ink">
                      {humanizeId(criterion.id)}
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-2">
                    {criterion.description}
                  </p>
                  <p className="text-[11px] leading-relaxed text-ink-3 font-mono border-l-2 border-accent/40 pl-3">
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
