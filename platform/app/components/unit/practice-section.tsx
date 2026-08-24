import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import { PracticeWorkbench } from "@/components/unit/practice-workbench";
import type { MarkdownDoc } from "@/lib/content";
import { IconZap } from "@/components/icons";
import type { PracticeAttemptSummary, PracticeManifest } from "@/lib/practice";

type PracticeSectionProps = {
  unitId: string;
  workedExample: MarkdownDoc | null;
  completionProblem: MarkdownDoc | null;
  retrievalSeeds: string[];
  manifest: PracticeManifest | null;
  initialAttempts: PracticeAttemptSummary[];
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown: boolean;
};

export function PracticeSection({
  unitId,
  workedExample,
  completionProblem,
  retrievalSeeds,
  manifest,
  initialAttempts,
  isEnrolled,
  isSignedIn,
  serviceDown,
}: PracticeSectionProps) {
  return (
    <section
      id="practice"
      data-keel-section="practice"
      className="scroll-mt-20 border-t border-line bg-raised/30"
    >
      <div className="shell py-14">
        <SectionHeading
          title="Practice"
          lead="Warm up before the build: study an annotated worked example of a parallel task, then solve the completion problem."
        />

        {/* 1. Worked example */}
        <div className="mt-8">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-accent">1</span>
            <h3 className="text-base font-semibold text-ink">Annotated worked example</h3>
          </div>

          {workedExample ? (
            <div
              className="prose-keel mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: workedExample.html }}
            />
          ) : (
            <div className="mt-4">
              <ContentArriving what="The worked example (a solved parallel task)" />
            </div>
          )}
        </div>

        {/* 2. Completion problem */}
        <div className="mt-10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-accent">2</span>
            <h3 className="text-base font-semibold text-ink">Completion problem</h3>
          </div>

          {completionProblem ? (
            <div
              className="prose-keel mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: completionProblem.html }}
            />
          ) : (
            <div className="mt-4">
              <ContentArriving what="The completion problem (the worked example with gaps to fill)" />
            </div>
          )}

          {/* Interactive practice workbench */}
          <div className="mt-8">
            <PracticeWorkbench
              unitId={unitId}
              manifest={manifest}
              initialAttempts={initialAttempts}
              isEnrolled={isEnrolled}
              isSignedIn={isSignedIn}
              serviceDown={serviceDown}
            />
          </div>
        </div>

        {/* 3. Retrieval checkpoints */}
        <div className="mt-10">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-accent">3</span>
            <h3 className="text-base font-semibold text-ink">Retrieval checkpoints</h3>
          </div>

          {retrievalSeeds.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm leading-relaxed text-ink-2">
                After studying this lesson, you should be able to explain each of these from memory:
              </p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {retrievalSeeds.map((seed) => (
                  <li
                    key={seed}
                    className="flex items-start gap-2.5 rounded-lg border border-line bg-raised px-4 py-3 text-[13px] leading-relaxed text-ink-2"
                  >
                    <IconZap size={14} className="mt-0.5 shrink-0 text-accent" />
                    {seed}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] leading-relaxed text-ink-3">
                Automated retrieval checks and spaced reviews test these concepts in future units.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <ContentArriving what="Retrieval practice seeds" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
