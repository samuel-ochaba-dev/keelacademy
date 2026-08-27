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
    >
      <div>
        <SectionHeading
          stepNumber="02"
          title="Practice: Interactive Drill Workbench"
          lead="Warm up before building: study an annotated worked example of a parallel task, solve the completion problem, and run retrieval drills."
        />

        {/* Adaptive Route Strip (S3.4) */}
        <div data-keel-component="practice-route-strip">
          {!isSignedIn ? (
            <div>
              <div>
                <div>
                  
                  <span>ADAPTIVE PRACTICE ROUTE</span>
                </div>
                <span>
                  SIGN IN REQUIRED
                </span>
              </div>
              <p>
                Sign in and enroll to unlock your personalized practice route.
              </p>
            </div>
          ) : !isEnrolled ? (
            <div>
              <div>
                <div>
                  
                  <span>ADAPTIVE PRACTICE ROUTE</span>
                </div>
                <span>
                  ENROLLMENT REQUIRED
                </span>
              </div>
              <p>
                Active enrollment required to compute and display your practice route.
              </p>
            </div>
          ) : serviceDown || !routeData ? (
            <div>
              <div>
                <div>
                  
                  <span>ADAPTIVE PRACTICE ROUTE</span>
                </div>
                <span>
                  SERVICE UNREACHABLE
                </span>
              </div>
              <p>
                Practice routing service is temporarily unreachable. Attempt history could not be loaded.
              </p>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div>
                <div>
                  
                  <span>
                    ADAPTIVE PRACTICE ROUTE
                  </span>
                </div>
                <div>
                  {routeData.status === "completed" && (
                    <span>
                      ROUTE COMPLETE
                    </span>
                  )}
                  {routeData.status === "fast_pass" && (
                    <span>
                      
                      FAST PASS ACTIVE
                    </span>
                  )}
                  {routeData.status === "scaffold_active" && (
                    <span>
                      
                      SCAFFOLD ROUTE ACTIVE
                    </span>
                  )}
                  {(routeData.status === "in_progress" || routeData.status === "standard") && (
                    <span>
                      STANDARD SEQUENCE
                    </span>
                  )}
                </div>
              </div>

              {/* Route summary line */}
              <p>
                {routeData.summary}
              </p>

              {/* Steps grid */}
              <div>
                {routeData.steps.map((step, idx) => {
                  const stepNum = String(idx + 1).padStart(2, "0");
                  const isDone = step.status === "done";
                  const isCurrent = step.status === "current";
                  const isOptional = step.status === "optional";
                  const isScaffold = step.status === "scaffold";
                  const isRetry = step.status === "retry";

                  let statusBadge = (
                    <span>
                      UPCOMING
                    </span>
                  );
                  if (isDone) {
                    statusBadge = (
                      <span>
                        DONE
                      </span>
                    );
                  } else if (isOptional) {
                    statusBadge = (
                      <span>
                        OPTIONAL
                      </span>
                    );
                  } else if (isRetry) {
                    statusBadge = (
                      <span>
                        RETRY
                      </span>
                    );
                  } else if (isScaffold) {
                    statusBadge = (
                      <span>
                        SCAFFOLD
                      </span>
                    );
                  } else if (isCurrent) {
                    statusBadge = (
                      <span>
                        CURRENT
                      </span>
                    );
                  }

                  return (
                    <div
                      key={step.id}
                    >
                      <div>
                        <div>
                          <span>STEP {stepNum}</span>
                          {statusBadge}
                        </div>
                        <div>
                          {step.title}
                        </div>
                      </div>
                      <div>
                        {step.summary}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scaffold Callout */}
              {routeData.scaffold_callout && (
                <div>
                  <div>
                    
                    REMEDIAL ROUTE: REVIEW WORKED EXAMPLE
                  </div>
                  <div>
                    {routeData.scaffold_callout.summary}
                  </div>
                  <div>
                    <a
                      href={routeData.scaffold_callout.url}
                    >
                      <span>Review {routeData.scaffold_callout.target_file}</span>
                    </a>
                    <a
                      href={routeData.scaffold_callout.type === "drill_retry" ? "#retrieval-drill" : "#completion-problem"}
                    >
                      {routeData.scaffold_callout.type === "drill_retry" ? "Jump to drill" : "Jump to workbench"}
                    </a>
                  </div>
                </div>
              )}

              {/* Fast Pass Callout */}
              {routeData.fast_pass_active && !routeData.scaffold_callout && routeData.status !== "completed" && (
                <div>
                  <div>
                    
                    FAST PASS ACTIVE
                  </div>
                  <div>
                    All retrieval drills cleared on first attempt. The worked example is optional. You can proceed directly to the completion problem.
                  </div>
                  <div>
                    <a
                      href="#completion-problem"
                    >
                      <span>Go to completion workbench</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Route Complete Callout */}
              {routeData.status === "completed" && (
                <div>
                  <div>
                    
                    PRACTICE ROUTE COMPLETE
                  </div>
                  <div>
                    All retrieval checkpoints and completion problem checks passed. You are ready to start the Build deliverable.
                  </div>
                  <div>
                    <a
                      href="#build"
                    >
                      <span>Start build deliverable</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 1. Worked example */}
        <div id="worked-example">
          <div>
            <div>
              <span>PART 01</span>
              <span>/</span>
              <h3>ANNOTATED WORKED EXAMPLE</h3>
            </div>
            {routeData?.fast_pass_active && (
              <span>
                OPTIONAL (FAST PASS)
              </span>
            )}
            {routeData?.scaffold_active && (
              <span>
                RECOMMENDED REVIEW (SCAFFOLD)
              </span>
            )}
          </div>

          {workedExample ? (
            <div
              dangerouslySetInnerHTML={{ __html: workedExample.html }}
            />
          ) : (
            <div>
              <ContentArriving what="The worked example (a solved parallel task)" />
            </div>
          )}
        </div>

        {/* 2. Completion problem */}
        <div id="completion-problem">
          <div>
            <span>PART 02</span>
            <span>/</span>
            <h3>COMPLETION PROBLEM WORKBENCH</h3>
          </div>

          {completionProblem ? (
            <div
              dangerouslySetInnerHTML={{ __html: completionProblem.html }}
            />
          ) : (
            <div>
              <ContentArriving what="The completion problem (the worked example with gaps to fill)" />
            </div>
          )}

          {/* Interactive practice workbench */}
          <div>
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
        <div id="retrieval-drill">
          <div>
            <span>PART 03</span>
            <span>/</span>
            <h3>RETRIEVAL CHECKPOINTS & DRILLS</h3>
          </div>

          {retrievalSeeds.length > 0 ? (
            <div>
              <p>
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
            <div>
              <ContentArriving what="Retrieval practice seeds" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
