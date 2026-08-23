import Link from "next/link";
import { SectionHeading } from "@/components/unit/section-heading";
import { budgetCharged, formatUtc, type SubmissionView } from "@/lib/grading";

export function VerdictFacts({ view }: { view: SubmissionView }) {
  const verdict = view.verdict;
  if (!verdict) return null;
  const charged = budgetCharged(view);

  return (
    <section id="verdict-record">
      <div>
        <hr />
        <SectionHeading
          title="Grading Audit Record"
          lead="Bookkeeping details: rubric version, timing, and token budget consumption."
        />
        <table border={1}>
          <tbody>
            <tr>
              <td><strong>Rubric Version:</strong></td>
              <td>
                <Link href={`/units/${view.submission.unit_id}#verify`}>
                  {verdict.rubric_id ?? "unknown"}
                  {verdict.rubric_version != null ? ` v${verdict.rubric_version}` : ""}
                </Link>
              </td>
            </tr>
            <tr>
              <td><strong>Issued At:</strong></td>
              <td>{formatUtc(verdict.issued_at)}</td>
            </tr>
            <tr>
              <td><strong>Budget Charged:</strong></td>
              <td>
                {charged ? (
                  <>
                    {charged.tokens.toLocaleString("en-US")} tokens
                    {charged.model ? ` (${charged.model})` : ""}
                    {charged.costUsd != null ? ` · $${charged.costUsd.toFixed(4)}` : ""}
                  </>
                ) : (
                  "0 tokens"
                )}
              </td>
            </tr>
            <tr>
              <td><strong>Trace Call ID:</strong></td>
              <td><code>{verdict.json?.trace?.call_id ?? "not recorded"}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
