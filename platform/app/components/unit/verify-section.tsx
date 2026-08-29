import Link from "next/link";
import { SectionHeading } from "@/components/unit/section-heading";
import type { Check, CurriculumAnchor, Rubric, UnitYaml } from "@/lib/content";
import { humanizeId } from "@/lib/text";

const LAYER_INFO = [
  { num: 1, name: "Automated sandbox checks", note: "Pytest suites and CLI contract checks in an isolated container" },
  { num: 2, name: "Calibrated rubric judge", note: "LLM judge requiring quoted lines of code as evidence" },
  { num: 3, name: "Defend your work", note: "Code interrogation interview triggered at gate units" },
  { num: 4, name: "Recorded walkthrough", note: "Unscripted video walkthrough at high-stakes phase milestones" },
];

function expectLabel(expect: Check["expect"]): { text: string; isExitZero: boolean } {
  if (expect === "exit_zero") return { text: "exit 0 (pass)", isExitZero: true };
  if (expect === "exit_nonzero") return { text: "exit non-zero (fail)", isExitZero: false };
  return { text: `contains: "${(expect as { output_contains: string }).output_contains}"`, isExitZero: true };
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
      className="scroll-mt-28"
    >
      <div className="space-y-10">
        <SectionHeading
          stepNumber="04"
          title="Verify: Hardened Grading Pipeline"
          lead="The published grading standard: every automated test, rubric criterion, and defense checkpoint your code must pass before you unlock the next unit."
        />

        {curriculum?.proveIt ? (
          <div className="rounded-lg border border-emerald-950/80 bg-emerald-950/20 p-4 sm:p-5 text-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              CURRICULUM PROVE-IT STANDARD
            </div>
            <p className="text-zinc-300 leading-relaxed font-sans">{curriculum.proveIt}</p>
          </div>
        ) : null}

        {/* Verification stack overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-semibold">
              VERIFICATION LAYERS ACTIVATED FOR UNIT {unit.id}
            </span>
            <span className="text-xs font-mono text-zinc-500">4-Layer Defense Model</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LAYER_INFO.map((layer) => {
              const applies = unit.verify.layers.includes(layer.num);
              return (
                <div
                  key={layer.name}
                  className={`p-4 rounded-xl border text-xs font-mono transition-all ${
                    applies
                      ? "bg-zinc-900/60 border-zinc-700/80 shadow-sm"
                      : "bg-zinc-950/40 border-zinc-850 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-500 font-semibold">LAYER 0{layer.num}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        applies
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                      }`}
                    >
                      {applies ? "ACTIVE" : "MILESTONE"}
                    </span>
                  </div>
                  <div className={`font-semibold mb-1 ${applies ? "text-zinc-200" : "text-zinc-400"}`}>
                    {layer.name}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                    {layer.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layer 1 checks matrix */}
        {checks && checks.length > 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 font-semibold">LAYER 01</span>
                <span className="text-zinc-700">/</span>
                <h3 className="text-base font-bold font-mono text-zinc-100">
                  {checks.length} DETERMINISTIC SANDBOX ASSERTIONS
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                EPHEMERAL RUNNER
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/50">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
                  <tr>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Assertion Name</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Expected State</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider">Runner Command / Test Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {checks.map((check) => {
                    const { text } = expectLabel(check.expect);
                    return (
                      <tr key={check.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4 text-zinc-200 font-semibold whitespace-nowrap">
                          {humanizeId(check.id)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                            {text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sky-400 font-mono text-xs">
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

        {/* Layer 2 rubric matrix */}
        {rubric ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 font-semibold">LAYER 02</span>
                <span className="text-zinc-700">/</span>
                <h3 className="text-base font-bold font-mono text-zinc-100">
                  {rubric.criteria.length} EVIDENCE-BACKED RUBRIC CRITERIA
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                TIER: {rubric.judge.model_tier.toUpperCase()} JUDGE
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {rubric.criteria.map((criterion, idx) => (
                <div
                  key={criterion.id}
                  className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500 font-semibold">CRITERION 0{idx + 1}</span>
                      <span className="text-zinc-700">/</span>
                      <h4 className="text-sm font-bold font-mono text-zinc-200">
                        {humanizeId(criterion.id)}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                      STRICT PASS REQUIRED
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                    {criterion.description}
                  </p>

                  <div className="p-3 rounded bg-zinc-900/90 border border-zinc-800/80 text-xs font-mono space-y-1">
                    <div className="text-zinc-500 uppercase tracking-wider text-[10px]">Required Quote Evidence:</div>
                    <div className="text-sky-300 font-sans text-xs">
                      {criterion.evidence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Layer 3 Defend Preview */}
        {unit.verify.layers.includes(3) ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 font-semibold">LAYER 03</span>
                <span className="text-zinc-700">/</span>
                <h3 className="text-base font-bold font-mono text-zinc-100">DEFEND YOUR WORK INTERVIEW</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-950/80 text-sky-300 border border-sky-800/80">
                CODE INTERROGATION
              </span>
            </div>
            <p className="text-sm text-zinc-300 font-sans leading-relaxed">
              Upon passing Layer 1 (deterministic assertions) and Layer 2 (rubric evidence), gate units trigger an automated code defense session. You will be asked 3 code-specific architectural and reasoning questions based directly on the commits you submitted.
            </p>
          </div>
        ) : null}

        {/* Action Bar / Direct CTAs */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-sm font-semibold text-zinc-200 font-mono">Submit your implementation</div>
            <div className="text-xs text-zinc-400 font-sans">Ready to test against the full grading pipeline? Push your repo or check active submissions.</div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/submit"
              className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-mono text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              Submit Your Repository →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
