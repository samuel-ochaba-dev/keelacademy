import { ContentArriving } from "@/components/content-arriving";
import { PracticeWorkbench } from "@/components/unit/practice-workbench";
import { RetrievalDrill } from "@/components/unit/retrieval-drill";
import type { MarkdownDoc } from "@/lib/content";
import type {
  PracticeAttemptSummary,
  PracticeManifest,
  PracticeRouteData,
  RetrievalAttemptSummary,
} from "@/lib/practice";

/**
 * The four pieces below are placed by a unit script, in its own order and with
 * its own words in between, so none of them opens with a sentence about itself.
 */
export function PracticeRouteStrip({
  routeData = null,
  isEnrolled,
  isSignedIn,
  serviceDown,
}: {
  routeData?: PracticeRouteData | null;
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown: boolean;
}) {
  return (
    <div data-keel-component="practice-route-strip" className="apparatus">
          {!isSignedIn ? (
            <div className="space-y-2">
              <div className="apparatus-head">
                <span className="apparatus-label">Your practice route</span>
                <span className="chip chip-outline text-[11px] font-code-mono">SIGN IN</span>
              </div>
              <p className="text-[14.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                Sign in and enroll, and your route through this practice set shows up here.
              </p>
            </div>
          ) : !isEnrolled ? (
            <div className="space-y-2">
              <div className="apparatus-head">
                <span className="apparatus-label">Your practice route</span>
                <span className="chip chip-outline text-[11px] font-code-mono">NOT ENROLLED</span>
              </div>
              <p className="text-[14.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                Your route through this practice set appears once you enroll in this unit.
              </p>
            </div>
          ) : serviceDown || !routeData ? (
            <div className="space-y-2">
              <div className="apparatus-head">
                <span className="apparatus-label">Your practice route</span>
                <span className="chip chip-outline text-[11px] font-code-mono">NOT ANSWERING</span>
              </div>
              <p className="text-[14.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                Your route is not loading just now. Nothing you have already done is lost, and the
                practice below still works.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header row */}
              <div className="apparatus-head">
                <span className="apparatus-label">Your practice route</span>
                <div>
                  {routeData.status === "completed" && (
                    <span className="chip chip-live text-[11px]">
                      ROUTE COMPLETE
                    </span>
                  )}
                  {routeData.status === "fast_pass" && (
                    <span className="chip chip-live text-[11px]">
                      SHORTER ROUTE
                    </span>
                  )}
                  {routeData.status === "scaffold_active" && (
                    <span className="chip chip-alert text-[11px] font-code-mono">
                      EXTRA PRACTICE ADDED
                    </span>
                  )}
                  {(routeData.status === "in_progress" || routeData.status === "standard") && (
                    <span className="chip chip-outline text-[11px] font-code-mono">
                      STANDARD ROUTE
                    </span>
                  )}
                </div>
              </div>

              {/* Route summary line */}
              <p className="text-[14.5px] leading-relaxed text-phosphor-white">
                {routeData.summary}
              </p>

              {/* Steps grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {routeData.steps.map((step, idx) => {
                  const stepNum = String(idx + 1).padStart(2, "0");
                  const isDone = step.status === "done";
                  const isCurrent = step.status === "current";
                  const isOptional = step.status === "optional";
                  const isScaffold = step.status === "scaffold";
                  const isRetry = step.status === "retry";

                  let statusBadge = (
                    <span className="chip chip-outline text-[10px] font-code-mono opacity-60">
                      UPCOMING
                    </span>
                  );
                  if (isDone) {
                    statusBadge = (
                      <span className="chip chip-live text-[10px]">
                        DONE
                      </span>
                    );
                  } else if (isOptional) {
                    statusBadge = (
                      <span className="chip chip-outline text-[10px] font-code-mono opacity-60">
                        OPTIONAL
                      </span>
                    );
                  } else if (isRetry) {
                    statusBadge = (
                      <span className="chip chip-alert text-[10px] font-code-mono">
                        RETRY
                      </span>
                    );
                  } else if (isScaffold) {
                    statusBadge = (
                      <span className="chip chip-alert text-[10px] font-code-mono">
                        SCAFFOLD
                      </span>
                    );
                  } else if (isCurrent) {
                    statusBadge = (
                      <span className="chip chip-outline text-[10px] font-code-mono border-lime-pulse text-lime-pulse">
                        CURRENT
                      </span>
                    );
                  }

                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-lg border bg-carbon-veil space-y-2 ${isCurrent ? "border-lime-pulse" : "border-circuit-border"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-code-mono text-[11px] text-moss-70">STEP {stepNum}</span>
                        {statusBadge}
                      </div>
                      <div className="font-goga text-[14.5px] font-medium text-phosphor-white">
                        {step.title}
                      </div>
                      <div className="text-[12.5px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                        {step.summary}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scaffold Callout */}
              {routeData.scaffold_callout && (
                <div className="p-4 rounded-lg bg-carbon-veil border border-circuit-border space-y-2">
                  <div className="font-code-mono text-[12px] font-medium text-phosphor-white">
                    GO BACK TO THE WORKED EXAMPLE
                  </div>
                  <div className="text-[14px] text-phosphor-white">
                    {routeData.scaffold_callout.summary}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a
                      href={routeData.scaffold_callout.url}
                      className="btn btn-ghost btn-sm text-[12px]"
                    >
                      Review {routeData.scaffold_callout.target_file}
                    </a>
                    <a
                      href={routeData.scaffold_callout.type === "drill_retry" ? "#retrieval-drill" : "#completion-problem"}
                      className="btn btn-accent btn-sm text-[12px]"
                    >
                      {routeData.scaffold_callout.type === "drill_retry" ? "Jump to drill" : "Jump to workbench"}
                    </a>
                  </div>
                </div>
              )}

              {/* Fast Pass Callout */}
              {routeData.fast_pass_active && !routeData.scaffold_callout && routeData.status !== "completed" && (
                <div className="p-4 rounded-lg bg-carbon-veil border border-lime-pulse/40 space-y-2">
                  <div className="font-code-mono text-[12px] font-medium text-lime-pulse">
                    SHORTER ROUTE
                  </div>
                  <div className="text-[14px] text-phosphor-white">
                    You cleared every retrieval drill first time, so the worked example is optional
                    here. Go straight to the completion problem if you want to.
                  </div>
                  <div className="pt-1">
                    <a
                      href="#completion-problem"
                      className="btn btn-accent btn-sm text-[12px]"
                    >
                      Go to the completion problem
                    </a>
                  </div>
                </div>
              )}

              {/* Route Complete Callout */}
              {routeData.status === "completed" && (
                <div className="p-4 rounded-lg bg-carbon-veil border border-lime-pulse/40 space-y-2">
                  <div className="font-code-mono text-[12px] font-medium text-lime-pulse">
                    PRACTICE DONE
                  </div>
                  <div className="text-[14px] text-phosphor-white">
                    Every retrieval drill and the completion problem passed. Start the deliverable.
                  </div>
                  <div className="pt-1">
                    <a
                      href="#build"
                      className="btn btn-accent btn-sm text-[12px]"
                    >
                      Start the deliverable
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
    </div>
  );
}

export function WorkedExampleCard({
  workedExample,
  routeData = null,
}: {
  workedExample: MarkdownDoc | null;
  routeData?: PracticeRouteData | null;
}) {
  return (
    <div id="worked-example" className="apparatus">
      <div className="apparatus-head">
        <h3 className="apparatus-label">A worked example, annotated</h3>
        {routeData?.fast_pass_active && (
          <span className="chip chip-outline text-[11px] font-code-mono">
            OPTIONAL
          </span>
        )}
        {routeData?.scaffold_active && (
          <span className="chip chip-alert text-[11px] font-code-mono">
            WORTH RE-READING
          </span>
        )}
      </div>

      {workedExample ? (
        <div
          className="lesson-prose"
          dangerouslySetInnerHTML={{ __html: workedExample.html }}
        />
      ) : (
        <ContentArriving what="The worked example (a solved parallel task)" />
      )}
    </div>
  );
}
export function CompletionWorkbenchCard({
  unitId,
  completionProblem,
  manifest,
  initialAttempts,
  isEnrolled,
  isSignedIn,
  serviceDown,
}: {
  unitId: string;
  completionProblem: MarkdownDoc | null;
  manifest: PracticeManifest | null;
  initialAttempts: PracticeAttemptSummary[];
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown: boolean;
}) {
  return (
    <div id="completion-problem" className="card-dark space-y-6">
      <div className="border-b border-phosphor-blue-black pb-4">
        <h3 className="font-goga text-[17px] font-medium text-phosphor-white">
          The completion problem
        </h3>
      </div>

      {completionProblem ? (
        <div
          className="lesson-prose"
          dangerouslySetInnerHTML={{ __html: completionProblem.html }}
        />
      ) : (
        <ContentArriving what="The completion problem (the worked example with gaps to fill)" />
      )}

      <div className="pt-4">
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
  );
}

export function RetrievalDrillCard({
  unitId,
  retrievalSeeds,
  initialRetrievalAttempts = [],
  dueSeedIndices = [],
  isEnrolled,
  isSignedIn,
  serviceDown,
}: {
  unitId: string;
  retrievalSeeds: string[];
  initialRetrievalAttempts?: RetrievalAttemptSummary[];
  dueSeedIndices?: number[];
  isEnrolled: boolean;
  isSignedIn: boolean;
  serviceDown: boolean;
}) {
  return (
    <div id="retrieval-drill" className="card-dark space-y-6">
      <div className="border-b border-phosphor-blue-black pb-4">
        <h3 className="font-goga text-[17px] font-medium text-phosphor-white">
          Retrieval drills
        </h3>
      </div>

      {retrievalSeeds.length > 0 ? (
        <div className="space-y-6">
          <p className="text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
            Close the lesson and explain each idea from memory. Each answer is graded against
            the lesson, and the ones you get wrong come back to you a few days later.
          </p>

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
  );
}
