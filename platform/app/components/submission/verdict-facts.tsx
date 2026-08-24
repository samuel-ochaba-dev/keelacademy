import Link from "next/link";
import { budgetCharged, formatUtc, type SubmissionView } from "@/lib/grading";
import { IconShieldCheck } from "@/components/icons";

export function VerdictFacts({ view }: { view: SubmissionView }) {
  const verdict = view.verdict;
  if (!verdict) return null;
  const charged = budgetCharged(view);

  return (
    <section id="verdict-record" className="scroll-mt-24">
      <div className="panel overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line bg-inset px-5 py-4">
          <span className="grid size-9 place-items-center rounded-lg border border-line bg-raised text-accent">
            <IconShieldCheck size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink">Grading audit record</h2>
            <p className="text-[13px] text-ink-3">
              Rubric version, timestamp, and token budget consumption.
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          <Record label="Rubric version">
            <dd className="mt-1.5 text-sm">
              <Link
                href={`/units/${view.submission.unit_id}#verify`}
                className="font-mono text-xs text-accent hover:text-accent-strong"
              >
                {verdict.rubric_id ?? "unknown"}
                {verdict.rubric_version != null ? ` v${verdict.rubric_version}` : ""}
              </Link>
            </dd>
          </Record>
          <Record label="Issued (UTC)">
            <dd className="mt-1.5 font-mono text-xs text-ink">{formatUtc(verdict.issued_at)}</dd>
          </Record>
          <Record label="Budget charged">
            <dd className="mt-1.5 font-mono text-xs text-ink">
              {charged
                ? `${charged.tokens.toLocaleString("en-US")} tokens${
                    charged.costUsd != null ? ` ($${charged.costUsd.toFixed(4)})` : ""
                  }`
                : "0 tokens"}
            </dd>
          </Record>
          <Record label="Trace call ID">
            <dd className="mt-1.5">
              <code className="text-xs text-ink">{verdict.json?.trace?.call_id ?? "not recorded"}</code>
            </dd>
          </Record>
        </dl>
      </div>
    </section>
  );
}

function Record({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-raised px-5 py-4">
      <dt className="font-mono text-[10px] tracking-[0.1em] text-ink-3 uppercase">{label}</dt>
      {children}
    </div>
  );
}
