import { SectionHeading } from "@/components/unit/section-heading";
import type { JudgeVerdict } from "@/lib/grading";
import { humanizeId } from "@/lib/text";

export function JudgeSection({ judge }: { judge: JudgeVerdict | null | undefined }) {
  return (
    <section id="layer-2">
      <div>
        <hr />
        <SectionHeading
          title="Layer 2: Rubric Evaluation"
          lead="The judge evaluated your architecture against the published rubric, quoting specific lines as evidence."
        />
        {judge && judge.criteria.length > 0 ? (
          <>
            <p>
              <strong>Overall: {judge.overall.toUpperCase()}</strong> ({judge.criteria.filter((c) => c.verdict === "pass").length} of {judge.criteria.length} criteria passed)
            </p>
            <ol>
              {judge.criteria.map((criterion) => (
                <li key={criterion.id}>
                  <p>
                    <strong>{humanizeId(criterion.id)}</strong> — <em>{criterion.verdict.toUpperCase()}</em>
                  </p>
                  <blockquote>
                    <p><strong>Quoted evidence from submission:</strong></p>
                    <pre><code>{criterion.evidence}</code></pre>
                  </blockquote>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p>
            No judge verdict was recorded for this submission.
          </p>
        )}
      </div>
    </section>
  );
}
