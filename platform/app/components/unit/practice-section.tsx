import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import { PracticeWorkbench } from "@/components/unit/practice-workbench";
import { RetrievalDrill } from "@/components/unit/retrieval-drill";
import type { MarkdownDoc } from "@/lib/content";
import type {
  PracticeAttemptSummary,
  PracticeManifest,
  RetrievalAttemptSummary,
} from "@/lib/practice";

type PracticeSectionProps = {
  unitId: string;
  workedExample: MarkdownDoc | null;
  completionProblem: MarkdownDoc | null;
  retrievalSeeds: string[];
  manifest: PracticeManifest | null;
  initialAttempts: PracticeAttemptSummary[];
  initialRetrievalAttempts?: RetrievalAttemptSummary[];
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
  initialRetrievalAttempts = [],
  isEnrolled,
  isSignedIn,
  serviceDown,
}: PracticeSectionProps) {
  return (
    <section
      id="practice"
      data-keel-section="practice"
      className="scroll-mt-20 border-t border-line bg-raised/20"
    >
      <div className="shell py-12">
        <SectionHeading
          stepNumber="02"
          title="Practice: Interactive Drill Workbench"
          lead="Warm up before building: study an annotated worked example of a parallel task, solve the completion problem, and run retrieval drills."
        />

        {/* 1. Worked example */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2 border-b border-line pb-2 font-mono text-xs text-accent">
            <span className="font-semibold">PART 01</span>
            <span className="text-ink-4">/</span>
            <h3 className="font-semibold text-ink uppercase tracking-wider">ANNOTATED WORKED EXAMPLE</h3>
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
        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-2 font-mono text-xs text-accent">
            <span className="font-semibold">PART 02</span>
            <span className="text-ink-4">/</span>
            <h3 className="font-semibold text-ink uppercase tracking-wider">COMPLETION PROBLEM WORKBENCH</h3>
          </div>

          {completionProblem ? (
            <div
              className="prose-keel mt-2 max-w-none"
              dangerouslySetInnerHTML={{ __html: completionProblem.html }}
            />
          ) : (
            <div className="mt-2">
              <ContentArriving what="The completion problem (the worked example with gaps to fill)" />
            </div>
          )}

          {/* Interactive practice workbench */}
          <div className="mt-6">
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

        {/* 3. Retrieval checkpoints & drills */}
        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-2 border-b border-line pb-2 font-mono text-xs text-accent">
            <span className="font-semibold">PART 03</span>
            <span className="text-ink-4">/</span>
            <h3 className="font-semibold text-ink uppercase tracking-wider">RETRIEVAL CHECKPOINTS & DRILLS</h3>
          </div>

          {retrievalSeeds.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-ink-2">
                After studying this lesson, explain each concept from memory. Answers are graded against the lesson principles.
              </p>

              {/* Interactive retrieval drill */}
              <RetrievalDrill
                unitId={unitId}
                seeds={retrievalSeeds}
                initialAttempts={initialRetrievalAttempts}
                isEnrolled={isEnrolled}
                isSignedIn={isSignedIn}
                serviceDown={serviceDown}
              />
            </div>
          ) : (
            <div className="mt-2">
              <ContentArriving what="Retrieval practice seeds" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
