import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import { PracticeWorkbench } from "@/components/unit/practice-workbench";
import { RetrievalDrill } from "@/components/unit/retrieval-drill";
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
      className="scroll-mt-28"
    >
      <div className="space-y-10">
        <SectionHeading
          stepNumber="02"
          title="Practice: Interactive Drill Workbench"
          lead="Warm up before building: study an annotated worked example of a parallel task, solve the completion problem, and run retrieval drills."
        />

        {/* Adaptive Route Strip (S3.4) */}
        <div data-keel-component="practice-route-strip" className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 shadow-sm">
          {!isSignedIn ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-zinc-400 uppercase">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                  ADAPTIVE PRACTICE ROUTE
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                  SIGN IN REQUIRED
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                Sign in and enroll to unlock your personalized practice route and track completion telemetry.
              </p>
            </div>
          ) : !isEnrolled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  ADAPTIVE PRACTICE ROUTE
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  ENROLLMENT REQUIRED
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                Active enrollment required to compute and display your practice route.
              </p>
            </div>
          ) : serviceDown || !routeData ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-rose-400 uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  ADAPTIVE PRACTICE ROUTE
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/60">
                  SERVICE UNREACHABLE
                </span>
              </div>
              <p className="text-sm text-zinc-400">
                Practice routing service is temporarily unreachable. Attempt history could not be loaded.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-xs font-mono font-semibold tracking-wider text-zinc-200 uppercase">
                    ADAPTIVE PRACTICE ROUTE
                  </span>
                </div>
                <div>
                  {routeData.status === "completed" && (
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                      ✓ ROUTE COMPLETE
                    </span>
                  )}
                  {routeData.status === "fast_pass" && (
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-sky-950/70 text-sky-300 border border-sky-800/80">
                      ⚡ FAST PASS ACTIVE
                    </span>
                  )}
                  {routeData.status === "scaffold_active" && (
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-amber-950/70 text-amber-300 border border-amber-800/80">
                      ⛑ SCAFFOLD ROUTE ACTIVE
                    </span>
                  )}
                  {(routeData.status === "in_progress" || routeData.status === "standard") && (
                    <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      STANDARD SEQUENCE
                    </span>
                  )}
                </div>
              </div>

              {/* Route summary line */}
              <p className="text-sm text-zinc-300 font-mono">
                {routeData.summary}
              </p>

              {/* Steps grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {routeData.steps.map((step, idx) => {
                  const stepNum = String(idx + 1).padStart(2, "0");
                  const isDone = step.status === "done";
                  const isCurrent = step.status === "current";
                  const isOptional = step.status === "optional";
                  const isScaffold = step.status === "scaffold";
                  const isRetry = step.status === "retry";

                  let statusBadge = (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                      UPCOMING
                    </span>
                  );
                  if (isDone) {
                    statusBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        DONE
                      </span>
                    );
                  } else if (isOptional) {
                    statusBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700">
                        OPTIONAL
                      </span>
                    );
                  } else if (isRetry) {
                    statusBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800">
                        RETRY
                      </span>
                    );
                  } else if (isScaffold) {
                    statusBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800">
                        SCAFFOLD
                      </span>
                    );
                  } else if (isCurrent) {
                    statusBadge = (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-800 animate-pulse">
                        CURRENT
                      </span>
                    );
                  }

                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-lg border text-xs font-mono transition-all ${
                        isCurrent
                          ? "bg-zinc-900 border-sky-500/80 shadow-sm ring-1 ring-sky-500/20"
                          : isDone
                          ? "bg-zinc-950/60 border-zinc-800/80 text-zinc-400"
                          : "bg-zinc-950/40 border-zinc-850 text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-500 font-semibold">STEP {stepNum}</span>
                        {statusBadge}
                      </div>
                      <div className={`font-semibold mb-1 ${isCurrent ? "text-zinc-100" : "text-zinc-300"}`}>
                        {step.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-relaxed">
                        {step.summary}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scaffold Callout */}
              {routeData.scaffold_callout && (
                <div className="p-4 rounded-lg border border-amber-800/80 bg-amber-950/30 text-amber-200 text-xs font-mono space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <span>⛑</span> REMEDIAL ROUTE: REVIEW WORKED EXAMPLE
                  </div>
                  <div className="text-zinc-300">
                    {routeData.scaffold_callout.summary}
                  </div>
                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href={routeData.scaffold_callout.url}
                      className="px-3 py-1 rounded bg-amber-900/60 hover:bg-amber-900 text-amber-200 border border-amber-700 transition-colors"
                    >
                      Review {routeData.scaffold_callout.target_file}
                    </a>
                    <a
                      href={routeData.scaffold_callout.type === "drill_retry" ? "#retrieval-drill" : "#completion-problem"}
                      className="text-zinc-400 hover:text-zinc-200 underline"
                    >
                      {routeData.scaffold_callout.type === "drill_retry" ? "Jump to drill" : "Jump to workbench"}
                    </a>
                  </div>
                </div>
              )}

              {/* Fast Pass Callout */}
              {routeData.fast_pass_active && !routeData.scaffold_callout && routeData.status !== "completed" && (
                <div className="p-4 rounded-lg border border-sky-800/80 bg-sky-950/30 text-sky-200 text-xs font-mono space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <span>⚡</span> FAST PASS ACTIVE
                  </div>
                  <div className="text-zinc-300">
                    All retrieval drills cleared on first attempt. The worked example is optional. You can proceed directly to the completion problem.
                  </div>
                  <div className="pt-1">
                    <a
                      href="#completion-problem"
                      className="px-3 py-1 rounded bg-sky-900/60 hover:bg-sky-900 text-sky-200 border border-sky-700 transition-colors inline-block"
                    >
                      Go to completion workbench →
                    </a>
                  </div>
                </div>
              )}

              {/* Route Complete Callout */}
              {routeData.status === "completed" && (
                <div className="p-4 rounded-lg border border-emerald-800/80 bg-emerald-950/30 text-emerald-200 text-xs font-mono space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <span>✓</span> PRACTICE ROUTE COMPLETE
                  </div>
                  <div className="text-zinc-300">
                    All retrieval checkpoints and completion problem checks passed. You are ready to start the Build deliverable.
                  </div>
                  <div className="pt-1">
                    <a
                      href="#build"
                      className="px-3 py-1 rounded bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 transition-colors inline-block"
                    >
                      Start build deliverable →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1. Worked example */}
        <div id="worked-example" className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 font-semibold">PART 01</span>
              <span className="text-zinc-700">/</span>
              <h3 className="text-base font-bold font-mono text-zinc-100">ANNOTATED WORKED EXAMPLE</h3>
            </div>
            <div className="flex items-center gap-2">
              {routeData?.fast_pass_active && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                  OPTIONAL (FAST PASS)
                </span>
              )}
              {routeData?.scaffold_active && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800">
                  RECOMMENDED REVIEW (SCAFFOLD)
                </span>
              )}
            </div>
          </div>

          {workedExample ? (
            <div
              className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:font-mono prose-headings:text-zinc-100 prose-code:text-sky-300 prose-code:bg-zinc-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-800 prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-strong:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: workedExample.html }}
            />
          ) : (
            <ContentArriving what="The worked example (a solved parallel task)" />
          )}
        </div>

        {/* 2. Completion problem */}
        <div id="completion-problem" className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6 scroll-mt-28">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/80">
            <span className="text-xs font-mono text-zinc-500 font-semibold">PART 02</span>
            <span className="text-zinc-700">/</span>
            <h3 className="text-base font-bold font-mono text-zinc-100">COMPLETION PROBLEM WORKBENCH</h3>
          </div>

          {completionProblem ? (
            <div
              className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:font-mono prose-headings:text-zinc-100 prose-code:text-sky-300 prose-code:bg-zinc-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-800 prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-strong:text-zinc-100"
              dangerouslySetInnerHTML={{ __html: completionProblem.html }}
            />
          ) : (
            <ContentArriving what="The completion problem (the worked example with gaps to fill)" />
          )}

          {/* Interactive practice workbench */}
          <div className="pt-4 border-t border-zinc-800/80">
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
        <div id="retrieval-drill" className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6 scroll-mt-28">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/80">
            <span className="text-xs font-mono text-zinc-500 font-semibold">PART 03</span>
            <span className="text-zinc-700">/</span>
            <h3 className="text-base font-bold font-mono text-zinc-100">RETRIEVAL CHECKPOINTS & DRILLS</h3>
          </div>

          {retrievalSeeds.length > 0 ? (
            <div className="space-y-6">
              <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                After studying this lesson, explain each concept from memory. Answers are graded against the lesson principles by our Layer-2 judge.
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
            <ContentArriving what="Retrieval practice seeds" />
          )}
        </div>
      </div>
    </section>
  );
}
