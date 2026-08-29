import Link from "next/link";
import { budgetCharged, formatUtc, type SubmissionView } from "@/lib/grading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function VerdictFacts({ view }: { view: SubmissionView }) {
  const verdict = view.verdict;
  if (!verdict) return null;
  const charged = budgetCharged(view);

  return (
    <Card className="border-zinc-800 bg-zinc-950 shadow-md">
      <CardHeader className="border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
            TX
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-zinc-100">
              Audit & Ledger Telemetry
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Cryptographic audit record, calibrated rubric version, and inference token budget ledger.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Record label="Rubric Version">
            <dd className="font-mono text-xs text-emerald-400">
              <Link
                href={`/units/${view.submission.unit_id}#verify`}
                className="hover:underline flex items-center gap-1"
              >
                <span>{verdict.rubric_id ?? "unknown"}</span>
                {verdict.rubric_version != null && (
                  <span className="text-zinc-400">v{verdict.rubric_version}</span>
                )}
                <span className="text-zinc-500 text-[10px]">↗</span>
              </Link>
            </dd>
          </Record>

          <Record label="Issued At (UTC)">
            <dd className="font-mono text-xs text-zinc-300">
              {formatUtc(verdict.issued_at)}
            </dd>
          </Record>

          <Record label="Inference Budget Charged">
            <dd className="font-mono text-xs text-amber-300/90">
              {charged
                ? `${charged.tokens.toLocaleString("en-US")} tokens${
                    charged.costUsd != null ? ` ($${charged.costUsd.toFixed(4)})` : ""
                  }`
                : "0 tokens"}
            </dd>
          </Record>

          <Record label="Trace Call ID">
            <dd className="font-mono text-xs text-zinc-400 truncate" title={verdict.json?.trace?.call_id}>
              <code>{verdict.json?.trace?.call_id ?? "trace-sandbox-direct"}</code>
            </dd>
          </Record>
        </dl>
      </CardContent>
    </Card>
  );
}

function Record({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-md border border-zinc-800/80 bg-zinc-900/50 p-3">
      <dt className="font-mono text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
        {label}
      </dt>
      {children}
    </div>
  );
}
