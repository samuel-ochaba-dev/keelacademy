import type { Layer1Check, Layer1Result } from "@/lib/grading";
import { humanizeId } from "@/lib/text";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CheckListProps {
  layer1: Layer1Result | null | undefined;
}

export function CheckList({ layer1 }: CheckListProps) {
  const checks = layer1?.checks ?? [];
  const passCount = checks.filter((c) => c.status === "pass").length;
  const totalCount = checks.length;
  const allPassed = totalCount > 0 && passCount === totalCount;

  return (
    <Card className="border-zinc-800 bg-zinc-950 shadow-md">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
              L1
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-100">
                Layer 1: Deterministic Sandbox Checks
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Isolated container execution verifying syntax, functional test suites, and boundary conditions.
              </CardDescription>
            </div>
          </div>

          {layer1 ? (
            <Badge variant={allPassed ? "success" : "danger"} className="text-xs px-2.5 py-1">
              {passCount}/{totalCount} checks passed
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Pending execution
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-zinc-800/60">
        {checks.length > 0 ? (
          checks.map((check) => <CheckItem key={check.id} check={check} />)
        ) : (
          <div className="p-6 text-center text-sm text-zinc-500 font-mono">
            No Layer 1 test results recorded for this submission.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckItem({ check }: { check: Layer1Check }) {
  const isPass = check.status === "pass";

  return (
    <div className="p-5 hover:bg-zinc-900/40 transition-colors">
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

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold text-zinc-200">
                {humanizeId(check.id)}
              </span>
              <span className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 uppercase">
                {check.type || "sandbox-check"}
              </span>
              {check.exit_code !== null && (
                <span className="font-mono text-[11px] text-zinc-500">
                  exit:{check.exit_code}
                </span>
              )}
            </div>

            {check.note && (
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                {check.note}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {typeof check.wall_s === "number" && (
            <span className="font-mono text-xs text-zinc-500 tabular-nums">
              {check.wall_s.toFixed(2)}s
            </span>
          )}
          <Badge
            variant={isPass ? "success" : "danger"}
            className="text-[11px] uppercase tracking-wider font-mono"
          >
            {check.status}
          </Badge>
        </div>
      </div>

      {check.output_tail && (
        <div className="mt-3 pl-8">
          <details className="group rounded border border-zinc-800/80 bg-zinc-900/60 transition-colors open:bg-zinc-900/90">
            <summary className="cursor-pointer px-3 py-2 text-xs font-mono font-medium text-zinc-400 hover:text-zinc-200 select-none flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="text-zinc-600 group-open:rotate-90 transition-transform">▸</span>
                Container output / Stderr trace
              </span>
              <span className="text-[10px] text-zinc-500">expand snippet</span>
            </summary>
            <div className="border-t border-zinc-800/60 p-3">
              <pre className="overflow-x-auto font-mono text-xs text-zinc-300 leading-relaxed max-h-64 whitespace-pre-wrap">
                <code>{check.output_tail}</code>
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
