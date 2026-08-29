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
      <section id="learn" data-keel-section="learn" className="scroll-mt-28">
        <div className="space-y-6">
          <SectionHeading
            stepNumber="01"
            title="Learn: The Core Specification"
            lead="The foundational lesson, written specifically for the production claims system you are building."
          />
          <ContentArriving what="The unit lesson" />
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
    <section id="learn" data-keel-section="learn" className="scroll-mt-28">
      <div className="space-y-8">
        <SectionHeading
          stepNumber="01"
          title="Learn: The Core Specification"
          lead="The lesson in three layers: foundational concept core, production applied context, and freshness-audited tool specifics."
        />

        {curriculum?.learn && (
          <div className="rounded-lg border border-sky-950/80 bg-sky-950/20 p-4 sm:p-5 text-sm">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-sky-400 uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Curriculum Anchor & Context
            </div>
            <p className="text-zinc-300 leading-relaxed font-sans">{curriculum.learn}</p>
            {curriculum.tools ? (
              <div className="mt-3 pt-3 border-t border-sky-900/40 flex items-center gap-2 text-xs font-mono text-sky-300/80">
                <span className="text-zinc-500 uppercase">Target SDKs:</span>
                <span>{curriculum.tools}</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Intro Framing */}
        <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:font-mono prose-headings:text-zinc-100 prose-code:text-sky-300 prose-code:bg-zinc-900/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-800/80 prose-strong:text-zinc-100">
          <div dangerouslySetInnerHTML={{ __html: lesson.introHtml }} />
        </div>

        {/* Specification Layers Accordion / Card Stacks */}
        {lesson.layers.length > 0 ? (
          <div className="space-y-4 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-semibold">
                Instructional Specification Layers ({lesson.layers.length})
              </span>
              <span className="text-xs font-mono text-zinc-600">Freshness Audited</span>
            </div>

            <div className="space-y-4">
              {lesson.layers.map((layer, index) => {
                const date = verifiedDate(layer.name);
                return (
                  <details
                    key={layer.name}
                    open={index === 0}
                    className="group rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all duration-150 open:bg-zinc-900/70 open:border-zinc-700/80"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-850/50 transition-colors list-none">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-zinc-500 group-open:text-sky-400">
                          LAYER 0{index + 1}
                        </span>
                        <span className="text-sm font-semibold font-mono text-zinc-200">
                          {layer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {date ? (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
                            AUDITED {date}
                          </span>
                        ) : null}
                        <span className="text-xs font-mono text-zinc-500 group-open:rotate-180 transition-transform duration-200">
                          ▼
                        </span>
                      </div>
                    </summary>

                    <div className="px-5 py-5 border-t border-zinc-800/60 bg-zinc-950/40">
                      <div
                        className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:font-mono prose-headings:text-zinc-100 prose-code:text-sky-300 prose-code:bg-zinc-900/90 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-800 prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-strong:text-zinc-100 prose-li:text-zinc-300 prose-blockquote:border-sky-500 prose-blockquote:bg-sky-950/20 prose-blockquote:text-zinc-300 prose-blockquote:font-mono prose-blockquote:text-sm prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r"
                        dangerouslySetInnerHTML={{ __html: layer.html }}
                      />
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        ) : (
          <ContentArriving what="The three lesson layers (concept core, applied context, tool specifics)" />
        )}
      </div>
    </section>
  );
}
