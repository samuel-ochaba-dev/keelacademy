import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { CurriculumAnchor, Lesson, LastVerified } from "@/lib/content";
import { IconBookOpen, IconLayers } from "@/components/icons";

type LearnSectionProps = {
  lesson: Lesson | null;
  curriculum: CurriculumAnchor | null;
  lastVerified: LastVerified;
};

export function LearnSection({ lesson, curriculum, lastVerified }: LearnSectionProps) {
  if (!lesson) {
    return (
      <section id="learn" data-keel-section="learn" className="border-t border-line bg-canvas">
        <div className="shell py-12">
          <SectionHeading
            stepNumber="01"
            title="Learn: The Core Specification"
            lead="The foundational lesson, written specifically for the production claims system you are building."
          />
          <div className="mt-6">
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
    <section id="learn" data-keel-section="learn" className="scroll-mt-20 border-t border-line bg-canvas">
      <div className="shell py-12">
        <SectionHeading
          stepNumber="01"
          title="Learn: The Core Specification"
          lead="The lesson in three layers: the foundational concept core, how it applies to Meridian Mutual, and current tool specifics."
        />

        {curriculum?.learn && (
          <div className="mt-6 rounded border border-line bg-raised p-5 space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <IconBookOpen size={14} />
              <p className="font-mono text-[10px] tracking-wider uppercase font-semibold">CURRICULUM SPEC CONTEXT</p>
            </div>
            <p className="text-xs leading-relaxed text-ink-2">{curriculum.learn}</p>
            {curriculum.tools ? (
              <p className="font-mono text-[11px] text-ink-3 pt-1 border-t border-line">SDKs / TOOLS: {curriculum.tools}</p>
            ) : null}
          </div>
        )}

        <div
          className="prose-keel mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.introHtml }}
        />

        {lesson.layers.length > 0 ? (
          <div className="mt-8 space-y-3">
            <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider block">
              INSTRUCTIONAL SPECIFICATION LAYERS
            </span>
            <div className="space-y-2">
              {lesson.layers.map((layer, index) => {
                const date = verifiedDate(layer.name);
                return (
                  <details
                    key={layer.name}
                    open={index === 0}
                    className="rounded border border-line bg-raised overflow-hidden group [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 bg-inset/50 hover:bg-raised-2/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <IconLayers size={14} className="text-accent" />
                        <span className="text-xs font-semibold text-ink">{layer.name}</span>
                      </div>
                      {date ? (
                        <span className="font-mono text-[10px] text-ink-3">
                          AUDITED {date}
                        </span>
                      ) : null}
                    </summary>
                    <div
                      className="prose-keel border-t border-line p-5 bg-raised"
                      dangerouslySetInnerHTML={{ __html: layer.html }}
                    />
                  </details>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <ContentArriving what="The three lesson layers (concept core, applied context, tool specifics)" />
          </div>
        )}
      </div>
    </section>
  );
}
