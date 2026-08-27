import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import { PracticeWorkbench } from "@/components/unit/practice-workbench";
import { RetrievalDrill } from "@/components/unit/retrieval-drill";
import { IconChevronRight } from "@/components/icons";
import type { MarkdownDoc } from "@/lib/content";
import type {
  PracticeAttemptSummary,
  PracticeManifest,
  PracticeRouteData,
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
  dueSeedIndices?: number[];
  routeData?: PracticeRouteData | null;
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
  dueSeedIndices = [],
  routeData = null,
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

        {/* Adaptive Route Strip (S3.4) */}
        <div data-keel-component="practice-route-strip" className="mt-8">
          {!isSignedIn ? (
            <div className="rounded border border-line bg-raised/40 p-4 font-mono text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-ink-3">
                  <span className="size-1.5 rounded-full bg-ink-4" />
                  <span className="font-semibold text-ink uppercase tracking-wider">ADAPTIVE PRACTICE ROUTE</span>
                </div>
                <span className="rounded border border-line bg-raised px-2 py-0.5 text-[10px] text-ink-3 font-semibold uppercase">
                  SIGN IN REQUIRED
                </span>
              </div>
              <p className="mt-2 text-ink-3 text-xs leading-relaxed">
                Sign in and enroll to unlock your personalized practice route.
              </p>
            </div>
          ) : !isEnrolled ? (
            <div className="rounded border border-line bg-raised/40 p-4 font-mono text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-ink-3">
                  <span className="size-1.5 rounded-full bg-ink-4" />
                  <span className="font-semibold text-ink uppercase tracking-wider">ADAPTIVE PRACTICE ROUTE</span>
                </div>
                <span className="rounded border border-line bg-raised px-2 py-0.5 text-[10px] text-ink-3 font-semibold uppercase">
                  ENROLLMENT REQUIRED
                </span>
              </div>
              <p className="mt-2 text-ink-3 text-xs leading-relaxed">
                Active enrollment required to compute and display your practice route.
              </p>
            </div>
          ) : serviceDown || !routeData ? (
            <div className="rounded border border-line bg-raised/40 p-4 font-mono text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber">
                  <span className="size-1.5 rounded-full bg-amber" />
                  <span className="font-semibold text-ink uppercase tracking-wider">ADAPTIVE PRACTICE ROUTE</span>
                </div>
                <span className="rounded border border-amber/40 bg-amber-soft px-2 py-0.5 text-[10px] text-amber font-semibold uppercase">
                  SERVICE UNREACHABLE
                </span>
              </div>
              <p className="mt-2 text-ink-3 text-xs leading-relaxed">
                Practice routing service is temporarily unreachable. Attempt history could not be loaded.
              </p>
            </div>
          ) : (
            <div className="space-y-4 rounded border border-line bg-raised/40 p-4 sm:p-5 font-mono">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                    ADAPTIVE PRACTICE ROUTE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {routeData.status === "completed" && (
                    <span className="rounded border border-pass/40 bg-pass-soft px-2.5 py-0.5 text-[10px] font-semibold text-pass uppercase">
                      ROUTE COMPLETE
                    </span>
                  )}
                  {routeData.status === "fast_pass" && (
                    <span className="rounded border border-accent/40 bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold text-accent uppercase flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-accent" />
                      FAST PASS ACTIVE
                    </span>
                  )}
                  {routeData.status === "scaffold_active" && (
                    <span className="rounded border border-amber/40 bg-amber-soft px-2.5 py-0.5 text-[10px] font-semibold text-amber uppercase flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-amber" />
                      SCAFFOLD ROUTE ACTIVE
                    </span>
                  )}
                  {(routeData.status === "in_progress" || routeData.status === "standard") && (
                    <span className="rounded border border-line bg-raised px-2.5 py-0.5 text-[10px] font-semibold text-ink-3 uppercase">
                      STANDARD SEQUENCE
                    </span>
                  )}
                </div>
              </div>

              {/* Route summary line */}
              <p className="text-xs leading-relaxed text-ink-2">
                {routeData.summary}
              </p>

              {/* Steps grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {routeData.steps.map((step, idx) => {
                  const stepNum = String(idx + 1).padStart(2, "0");
                  const isDone = step.status === "done";
                  const isCurrent = step.status === "current";
                  const isOptional = step.status === "optional";
                  const isScaffold = step.status === "scaffold";
                  const isRetry = step.status === "retry";

                  let statusBadge = (
                    <span className="rounded border border-line bg-raised px-2 py-0.5 text-[9px] font-semibold text-ink-4 uppercase">
                      UPCOMING
                    </span>
                  );
                  if (isDone) {
                    statusBadge = (
                      <span className="rounded border border-pass/40 bg-pass-soft px-2 py-0.5 text-[9px] font-semibold text-pass uppercase">
                        DONE
                      </span>
                    );
                  } else if (isOptional) {
                    statusBadge = (
                      <span className="rounded border border-line bg-raised-2 px-2 py-0.5 text-[9px] font-semibold text-ink-3 uppercase">
                        OPTIONAL
                      </span>
                    );
                  } else if (isRetry) {
                    statusBadge = (
                      <span className="rounded border border-fail/40 bg-fail-soft px-2 py-0.5 text-[9px] font-semibold text-fail uppercase">
                        RETRY
                      </span>
                    );
                  } else if (isScaffold) {
                    statusBadge = (
                      <span className="rounded border border-amber/40 bg-amber-soft px-2 py-0.5 text-[9px] font-semibold text-amber uppercase">
                        SCAFFOLD
                      </span>
                    );
                  } else if (isCurrent) {
                    statusBadge = (
                      <span className="rounded border border-accent/40 bg-accent-soft px-2 py-0.5 text-[9px] font-semibold text-accent uppercase">
                        CURRENT
                      </span>
                    );
                  }

                  return (
                    <div
                      key={step.id}
                      className={`rounded border p-3 flex flex-col justify-between gap-2 transition-colors ${
                        isCurrent
                          ? "border-accent/40 bg-accent-soft/20"
                          : isScaffold || isRetry
                          ? "border-amber/40 bg-amber-soft/20"
                          : isDone
                          ? "border-pass/30 bg-pass-soft/10"
                          : "border-line bg-raised/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 text-[10px] text-ink-4">
                          <span className="font-semibold text-ink-3">STEP {stepNum}</span>
                          {statusBadge}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-ink">
                          {step.title}
                        </div>
                      </div>
                      <div className="text-[11px] text-ink-3 leading-snug">
                        {step.summary}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scaffold Callout */}
              {routeData.scaffold_callout && (
                <div className="mt-3 rounded border border-amber/40 bg-amber-soft/30 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber font-semibold text-xs uppercase tracking-wider">
                    <span className="size-2 rounded-full bg-amber" />
                    REMEDIAL ROUTE: REVIEW WORKED EXAMPLE
                  </div>
                  <div className="text-xs text-ink-2 leading-relaxed">
                    {routeData.scaffold_callout.summary}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href={routeData.scaffold_callout.url}
                      className="inline-flex items-center gap-1.5 rounded border border-amber/50 bg-amber px-3 py-1.5 text-xs font-semibold text-ground transition hover:bg-amber-strong"
                    >
                      <span>Review {routeData.scaffold_callout.target_file}</span>
                      <IconChevronRight size={12} />
                    </a>
                    <a
                      href={routeData.scaffold_callout.type === "drill_retry" ? "#retrieval-drill" : "#completion-problem"}
                      className="text-xs text-amber underline underline-offset-4 hover:text-amber-strong"
                    >
                      {routeData.scaffold_callout.type === "drill_retry" ? "Jump to drill" : "Jump to workbench"}
                    </a>
                  </div>
                </div>
              )}

              {/* Fast Pass Callout */}
              {routeData.fast_pass_active && !routeData.scaffold_callout && routeData.status !== "completed" && (
                <div className="mt-3 rounded border border-accent/40 bg-accent-soft/30 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider">
                    <span className="size-2 rounded-full bg-accent" />
                    FAST PASS ACTIVE
                  </div>
                  <div className="text-xs text-ink-2 leading-relaxed">
                    All retrieval drills cleared on first attempt. The worked example is optional. You can proceed directly to the completion problem.
                  </div>
                  <div className="pt-1">
                    <a
                      href="#completion-problem"
                      className="inline-flex items-center gap-1.5 rounded border border-accent/50 bg-accent px-3 py-1.5 text-xs font-semibold text-ground transition hover:bg-accent-strong"
                    >
                      <span>Go to completion workbench</span>
                      <IconChevronRight size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Route Complete Callout */}
              {routeData.status === "completed" && (
                <div className="mt-3 rounded border border-pass/40 bg-pass-soft/30 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-pass font-semibold text-xs uppercase tracking-wider">
                    <span className="size-2 rounded-full bg-pass" />
                    PRACTICE ROUTE COMPLETE
                  </div>
                  <div className="text-xs text-ink-2 leading-relaxed">
                    All retrieval checkpoints and completion problem checks passed. You are ready to start the Build deliverable.
                  </div>
                  <div className="pt-1">
                    <a
                      href="#build"
                      className="inline-flex items-center gap-1.5 rounded border border-pass/50 bg-pass px-3 py-1.5 text-xs font-semibold text-ground transition hover:bg-pass"
                    >
                      <span>Start build deliverable</span>
                      <IconChevronRight size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1. Worked example */}
        <div id="worked-example" className="scroll-mt-20 mt-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 font-mono text-xs text-accent">
            <div className="flex items-center gap-2">
              <span className="font-semibold">PART 01</span>
              <span className="text-ink-4">/</span>
              <h3 className="font-semibold text-ink uppercase tracking-wider">ANNOTATED WORKED EXAMPLE</h3>
            </div>
            {routeData?.fast_pass_active && (
              <span className="rounded border border-line bg-raised-2 px-2 py-0.5 font-mono text-[10px] text-ink-3 font-semibold">
                OPTIONAL (FAST PASS)
              </span>
            )}
            {routeData?.scaffold_active && (
              <span className="rounded border border-amber/40 bg-amber-soft px-2 py-0.5 font-mono text-[10px] text-amber font-semibold">
                RECOMMENDED REVIEW (SCAFFOLD)
              </span>
            )}
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
        <div id="completion-problem" className="scroll-mt-20 mt-10 space-y-4">
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
        <div id="retrieval-drill" className="scroll-mt-20 mt-10 space-y-4">
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
                dueSeedIndices={dueSeedIndices}
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
