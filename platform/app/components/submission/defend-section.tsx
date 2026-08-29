import type { DefendResult } from "@/lib/grading";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface DefendSectionProps {
  defend: DefendResult | null | undefined;
}

export function DefendSection({ defend }: DefendSectionProps) {
  const questions = defend?.questions ?? [];

  return (
    <Card className="border-zinc-800 bg-zinc-950 shadow-md">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
              L3
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-100">
                Layer 3: Defend Your Work (Author Verification)
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Code-specific follow-up questions targeting concrete identifiers, magic constants, and branches to verify author comprehension.
              </CardDescription>
            </div>
          </div>

          {questions.length > 0 ? (
            <Badge variant="info" className="text-xs px-2.5 py-1">
              {questions.length} questions generated
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Optional / Standby
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-zinc-800/60">
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <div key={q.id || idx} className="p-5 space-y-3 hover:bg-zinc-900/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-sky-800/60 bg-sky-950/60 font-mono text-xs font-bold text-sky-400">
                    Q{idx + 1}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-zinc-200 leading-relaxed">
                      {q.question}
                    </p>
                    {q.anchors && q.anchors.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-mono text-zinc-500">Target Anchors:</span>
                        {q.anchors.map((anchor, aIdx) => (
                          <span
                            key={aIdx}
                            className="rounded border border-zinc-800 bg-zinc-900/80 px-2 py-0.5 font-mono text-xs text-amber-300/90"
                          >
                            {anchor}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Author explanation guidance */}
              <div className="ml-9 rounded-md border border-dashed border-zinc-800 bg-zinc-900/30 p-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-[11px] text-zinc-500">
                    Author Defense Prompt · Oral/Written Review Checkpoint
                  </span>
                  <span className="text-[11px] text-zinc-500">2–3 sentences required</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Explain the design rationale behind these specific lines in your solution. Why was this branch or constant selected over alternative implementations?
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-zinc-500 font-mono">
            No Layer 3 defense questions generated for this run. Defense questions are generated during oral review gates and verification checks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
