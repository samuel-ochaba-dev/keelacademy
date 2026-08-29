import { formatUtc, type TimelineEvent } from "@/lib/grading";
import { humanizeId } from "@/lib/text";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EVENT_LABELS: Record<string, string> = {
  "submission.created": "Submission Received & Intake Locked",
  "submission.queued": "Queued for Runner Sandbox",
  "grading.started": "Container Spawned & Tests Running",
  "layer1.completed": "Layer 1 Deterministic Checks Finished",
  "judge.started": "Layer 2 Rubric Evaluation Started",
  "judge.completed": "Layer 2 Rubric Evaluation Completed",
  "verdict.issued": "Cryptographic Verdict Generated & Recorded",
  "grade.budget_blocked": "Token Budget Limit Exceeded",
  "error.occurred": "Runner Execution Failure",
};

function eventLabel(event: TimelineEvent): string {
  return EVENT_LABELS[event.type] ?? humanizeId(event.type);
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card className="border-zinc-800 bg-zinc-950 shadow-md">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
              EV
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-100">
                Execution Event Stream
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Auditable event ledger tracking each lifecycle transition in the grading pipeline.
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs">
            {events.length} events logged
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {events.length > 0 ? (
          <div className="relative pl-6 border-l border-zinc-800 space-y-6">
            {events.map((event) => {
              const detail = typeof event.payload.detail === "string" ? event.payload.detail : null;
              const isError = event.type.includes("error") || event.type.includes("blocked");
              const isSuccess = event.type.includes("issued") || event.type.includes("completed");

              return (
                <div key={event.seq} className="relative group">
                  {/* Timeline node */}
                  <div
                    className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-zinc-950 ${
                      isError
                        ? "border-rose-500 text-rose-500"
                        : isSuccess
                        ? "border-emerald-500 text-emerald-500"
                        : "border-zinc-600 text-zinc-400"
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        isError
                          ? "bg-rose-500"
                          : isSuccess
                          ? "bg-emerald-500"
                          : "bg-zinc-500"
                      }`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-400">
                        #{event.seq}
                      </span>
                      <span className="text-sm font-medium text-zinc-200">
                        {eventLabel(event)}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500 uppercase bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {event.type}
                      </span>
                    </div>

                    <time className="font-mono text-xs text-zinc-500 tabular-nums">
                      {formatUtc(event.occurred_at)}
                    </time>
                  </div>

                  {detail && (
                    <div className="mt-2">
                      <pre className="rounded border border-zinc-800/80 bg-zinc-900/70 p-2 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                        <code>{detail}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-zinc-500 font-mono py-4">
            No pipeline events recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
