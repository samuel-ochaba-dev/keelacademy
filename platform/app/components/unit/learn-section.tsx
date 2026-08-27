import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { CurriculumAnchor, Lesson, LastVerified } from "@/lib/content";

type LearnSectionProps = {
  lesson: Lesson | null;
  curriculum: CurriculumAnchor | null;
  lastVerified: LastVerified;
};

export function LearnSection({ lesson, curriculum, lastVerified }: LearnSectionProps) {
  if (!lesson) {
    return (
      <section id="learn" data-keel-section="learn">
        <div>
          <SectionHeading
            stepNumber="01"
            title="Learn: The Core Specification"
            lead="The foundational lesson, written specifically for the production claims system you are building."
          />
          <div>
            <ContentArriving what="The unit lesson" />
          </div>
        </div>
      </section>
    );
  }

  const verifiedDate = (layerName: string): string | null => {
    const key = layerName.toLowerCase().replace(/\s+/g, "_");
    const value = (lastVerified as Record<string, string>)[key];
    return value ?? null;
  };

  return (
    <section id="learn" data-keel-section="learn">
      <div>
        <SectionHeading
          stepNumber="01"
          title="Learn: The Core Specification"
          lead="The lesson in three layers: the foundational concept core, how it applies to Meridian Mutual, and current tool specifics."
        />

        {curriculum?.learn && (
          <div>
            <div>
              <p>CURRICULUM SPEC CONTEXT</p>
            </div>
            <p>{curriculum.learn}</p>
            {curriculum.tools ? (
              <p>SDKs / TOOLS: {curriculum.tools}</p>
            ) : null}
          </div>
        )}

        <div
          dangerouslySetInnerHTML={{ __html: lesson.introHtml }}
        />

        {lesson.layers.length > 0 ? (
          <div>
            <span>
              INSTRUCTIONAL SPECIFICATION LAYERS
            </span>
            <div>
              {lesson.layers.map((layer, index) => {
                const date = verifiedDate(layer.name);
                return (
                  <details
                    key={layer.name}
                    open={index === 0}
                  >
                    <summary>
                      <div>
                        <span>{layer.name}</span>
                      </div>
                      {date ? (
                        <span>
                          AUDITED {date}
                        </span>
                      ) : null}
                    </summary>
                    <div
                      dangerouslySetInnerHTML={{ __html: layer.html }}
                    />
                  </details>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <ContentArriving what="The three lesson layers (concept core, applied context, tool specifics)" />
          </div>
        )}
      </div>
    </section>
  );
}
