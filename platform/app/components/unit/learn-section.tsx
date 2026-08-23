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
          <SectionHeading title="Learn" lead="The core lesson, written specifically for the system you are building." />
          <ContentArriving what="The lesson" />
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
        <hr />
        <SectionHeading
          title="Learn"
          lead="The lesson in three layers: the concept core, how it applies to Meridian, and current tool specifics."
        />

        {curriculum?.learn ? (
          <div>
            <p><strong>Curriculum Context:</strong></p>
            <p>{curriculum.learn}</p>
            {curriculum.tools ? (
              <p>Tools: {curriculum.tools}</p>
            ) : null}
          </div>
        ) : null}

        <div dangerouslySetInnerHTML={{ __html: lesson.introHtml }} />

        {lesson.layers.length > 0 ? (
          <div>
            {lesson.layers.map((layer, index) => {
              const date = verifiedDate(layer.name);
              return (
                <details key={layer.name} open={index === 0}>
                  <summary>
                    <strong>{layer.name}</strong>
                    {date ? ` (verified ${date})` : ""}
                  </summary>
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: layer.html }} />
                  </div>
                </details>
              );
            })}
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
