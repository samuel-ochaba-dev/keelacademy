import Link from "next/link";
import { budgetCharged, formatUtc, type SubmissionView } from "@/lib/grading";

export function VerdictFacts({ view }: { view: SubmissionView }) {
  const verdict = view.verdict;
  if (!verdict) return null;
  const charged = budgetCharged(view);

  return (
    <section id="verdict-record">
      <div>
        <div>
          
          <div>
            <h2>Grading audit record</h2>
            <p>
              Rubric version, timestamp, and token budget consumption.
            </p>
          </div>
        </div>

        <dl>
          <Record label="Rubric version">
            <dd>
              <Link
                href={`/units/${view.submission.unit_id}#verify`}
              >
                {verdict.rubric_id ?? "unknown"}
                {verdict.rubric_version != null ? ` v${verdict.rubric_version}` : ""}
              </Link>
            </dd>
          </Record>
          <Record label="Issued (UTC)">
            <dd>{formatUtc(verdict.issued_at)}</dd>
          </Record>
          <Record label="Budget charged">
            <dd>
              {charged
                ? `${charged.tokens.toLocaleString("en-US")} tokens${
                    charged.costUsd != null ? ` ($${charged.costUsd.toFixed(4)})` : ""
                  }`
                : "0 tokens"}
            </dd>
          </Record>
          <Record label="Trace call ID">
            <dd>
              <code>{verdict.json?.trace?.call_id ?? "not recorded"}</code>
            </dd>
          </Record>
        </dl>
      </div>
    </section>
  );
}

function Record({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      {children}
    </div>
  );
}
