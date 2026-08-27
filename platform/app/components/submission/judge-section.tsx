import type { JudgeVerdict } from "@/lib/grading";
import { humanizeId } from "@/lib/text";

export function JudgeSection({ judge }: { judge: JudgeVerdict | null | undefined }) {
  const passCount = judge?.criteria.filter((c) => c.verdict === "pass").length ?? 0;
  const totalCount = judge?.criteria.length ?? 0;

  return (
    <section id="layer-2">
      <div>
        <div>
          <div>
            
            <h2>
              Layer 2: calibrated rubric evaluation
            </h2>
          </div>

          {judge ? (
            <span>
              {passCount}/{totalCount} criteria passed
            </span>
          ) : null}
        </div>

        {judge && judge.criteria.length > 0 ? (
          <div>
            {judge.criteria.map((criterion) => {
              return (
                <div key={criterion.id}>
                  <div>
                    <div>
                      <span>
                        {humanizeId(criterion.id)}
                      </span>
                    </div>
                    <span>{criterion.verdict}</span>
                  </div>

                  {criterion.evidence ? (
                    <div>
                      <p>
                        Quoted evidence from code and logs
                      </p>
                      <pre>
                        <code>{criterion.evidence}</code>
                      </pre>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p>
            No judge verdict was recorded for this submission.
          </p>
        )}
      </div>
    </section>
  );
}
