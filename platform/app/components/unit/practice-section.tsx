import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { MarkdownDoc } from "@/lib/content";

type PracticeSectionProps = {
  workedExample: MarkdownDoc | null;
  completionProblem: MarkdownDoc | null;
  retrievalSeeds: string[];
};

export function PracticeSection({ workedExample, completionProblem, retrievalSeeds }: PracticeSectionProps) {
  return (
    <section id="practice" data-keel-section="practice">
      <div>
        <hr />
        <SectionHeading
          title="Practice"
          lead="Warm up before the build: study an annotated worked example, then solve the completion problem."
        />

        <div>
          <h3>Step 1: Annotated Worked Example</h3>
          {workedExample ? (
            <div dangerouslySetInnerHTML={{ __html: workedExample.html }} />
          ) : (
            <ContentArriving what="The worked example (a solved parallel task)" />
          )}
        </div>

        <div>
          <h3>Step 2: Completion Problem</h3>
          {completionProblem ? (
            <div dangerouslySetInnerHTML={{ __html: completionProblem.html }} />
          ) : (
            <ContentArriving what="The completion problem (the worked example with gaps to fill)" />
          )}
        </div>

        <div>
          <h3>Retrieval Checkpoints</h3>
          {retrievalSeeds.length > 0 ? (
            <div>
              <p>
                After studying this lesson, you should be able to explain each of these from memory:
              </p>
              <ul>
                {retrievalSeeds.map((seed) => (
                  <li key={seed}>
                    {seed}
                  </li>
                ))}
              </ul>
              <p>
                <em>Automated retrieval checks and spaced reviews will test these concepts in future units.</em>
              </p>
            </div>
          ) : (
            <ContentArriving what="Retrieval practice seeds" />
          )}
        </div>
      </div>
    </section>
  );
}
