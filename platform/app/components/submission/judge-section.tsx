import type { JudgeVerdict } from "@/lib/grading";
import { humanizeId } from "@/lib/text";
import { IconShieldCheck, IconCheckCircle, IconXCircle, IconCode } from "@/components/icons";

export function JudgeSection({ judge }: { judge: JudgeVerdict | null | undefined }) {
  const passCount = judge?.criteria.filter((c) => c.verdict === "pass").length ?? 0;
  const totalCount = judge?.criteria.length ?? 0;
  const isOverallPass = judge?.overall === "pass";

  return (
    <section id="layer-2" className="scroll-mt-24">
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-line bg-raised text-accent">
              <IconShieldCheck size={18} />
            </span>
            <h2 className="text-base font-semibold text-ink">
              Layer 2: calibrated rubric evaluation
            </h2>
          </div>

          {judge ? (
            <span className={isOverallPass ? "chip-pass" : "chip-fail"}>
              {passCount}/{totalCount} criteria passed
            </span>
          ) : null}
        </div>

        {judge && judge.criteria.length > 0 ? (
          <div className="divide-y divide-line">
            {judge.criteria.map((criterion) => {
              const isPass = criterion.verdict === "pass";
              return (
                <div key={criterion.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {isPass ? (
                        <IconCheckCircle size={16} className="text-pass" />
                      ) : (
                        <IconXCircle size={16} className="text-fail" />
                      )}
                      <span className="font-mono text-[13px] text-ink">
                        {humanizeId(criterion.id)}
                      </span>
                    </div>
                    <span className={isPass ? "chip-pass" : "chip-fail"}>{criterion.verdict}</span>
                  </div>

                  {criterion.evidence ? (
                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase">
                        <IconCode size={12} />
                        Quoted evidence from code and logs
                      </p>
                      <pre className="code-block mt-2 text-xs">
                        <code>{criterion.evidence}</code>
                      </pre>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-3">
            No judge verdict was recorded for this submission.
          </p>
        )}
      </div>
    </section>
  );
}
