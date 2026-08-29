import type { JudgeVerdict } from "@/lib/grading";
import { humanizeId } from "@/lib/text";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface VerdictViewProps {
  judge: JudgeVerdict | null | undefined;
}

export function VerdictView({ judge }: VerdictViewProps) {
  const criteria = judge?.criteria ?? [];
  const passCount = criteria.filter((c) => c.verdict === "pass").length;
  const totalCount = criteria.length;
  const allPassed = totalCount > 0 && passCount === totalCount;
  const isOverallPass = judge?.overall === "pass" || allPassed;

  return (
    <Card className="border-zinc-800 bg-zinc-950 shadow-md">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
              L2
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-100">
                Layer 2: Calibrated LLM-as-Judge Rubric
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Structured rubric evaluation with strict cited evidence quotes directly extracted from your code.
              </CardDescription>
            </div>
          </div>

          {judge ? (
            <div className="flex items-center gap-2">
              <Badge variant={isOverallPass ? "success" : "danger"} className="text-xs px-2.5 py-1">
                {passCount}/{totalCount} criteria passed
              </Badge>
              <Badge variant={isOverallPass ? "success" : "danger"} className="text-xs font-mono uppercase">
                {judge.overall || (isOverallPass ? "pass" : "fail")}
              </Badge>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs">
              Pending evaluation
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-zinc-800/60">
        {criteria.length > 0 ? (
          criteria.map((criterion) => {
            const isPass = criterion.verdict === "pass";

            return (
              <div key={criterion.id} className="p-5 space-y-3 hover:bg-zinc-900/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono text-xs font-bold ${
                        isPass
                          ? "border-emerald-700/60 bg-emerald-950/80 text-emerald-400"
                          : "border-rose-700/60 bg-rose-950/80 text-rose-400"
                      }`}
                    >
                      {isPass ? "✓" : "✕"}
                    </div>

                    <div>
                      <h4 className="font-mono text-sm font-semibold text-zinc-200">
                        {humanizeId(criterion.id)}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                        ID: {criterion.id}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={isPass ? "success" : "danger"}
                    className="text-[11px] uppercase tracking-wider font-mono shrink-0"
                  >
                    {criterion.verdict}
                  </Badge>
                </div>

                {criterion.evidence ? (
                  <div className="ml-8 mt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Exact Cited Evidence from Student Code</span>
                    </div>
                    <div className="relative rounded border border-zinc-800 bg-zinc-900/80 p-3 shadow-inner">
                      <pre className="overflow-x-auto font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        <code>{criterion.evidence}</code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="ml-8 text-xs text-zinc-500 italic">
                    No code excerpt cited for this criterion.
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-sm text-zinc-500 font-mono">
            No judge verdict was recorded for this submission.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
