import Link from "next/link";
import { ContentArriving } from "@/components/content-arriving";
import type { SubmissionContract, UnitYaml } from "@/lib/content";

type SubmissionCardProps = {
  unit: UnitYaml;
  contract: SubmissionContract | null;
};

/**
 * Both pieces below are placed by a unit script, with its own words in between,
 * so neither has to open with a sentence introducing itself.
 */
export function DeliverableCallout({ unit }: { unit: UnitYaml }) {
  return (
    <div className="apparatus">
      <div className="apparatus-head">
        <p className="apparatus-label">What you ship</p>
      </div>
      <p className="max-w-[68ch] text-[16px] leading-relaxed text-phosphor-white">
        {unit.build.deliverable}
      </p>
    </div>
  );
}

export function SubmissionContractCard({ unit, contract }: SubmissionCardProps) {
  return (
    <div className="space-y-8">
        {/* Submission contract */}
        <div className="card-dark space-y-6">
          <div className="border-b border-phosphor-blue-black pb-4">
            <h3 className="eyebrow text-[12px]">
              How to submit it
            </h3>
          </div>

          {contract ? (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-1/3">File</th>
                      <th>What it has to do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.files.map((file) => (
                      <tr key={file.path}>
                        <td>
                          <code className="code-inline">{file.path}</code>
                        </td>
                        <td className="text-[14.5px] text-[color:var(--text-muted-on-dark)]">{file.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {contract.cli ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-carbon-veil border border-circuit-border">
                  <span className="eyebrow text-[11px]">
                    The command the automated checks run
                  </span>
                  <code className="font-code-mono text-[13px] text-lime-pulse">
                    {contract.cli}
                  </code>
                </div>
              ) : null}
            </div>
          ) : (
            <ContentArriving what="The submission contract for this unit" />
          )}
        </div>

        {/* Repo naming + data variant */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-dark space-y-3">
            <span className="eyebrow text-[11px]">
              What to name your repository
            </span>
            <div className="block">
              <code className="code-inline text-[15px] font-code-mono text-phosphor-white">
                keel-{unit.id}-solution
              </code>
            </div>
            <p className="text-[14px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
              Push it to GitHub under that exact name. GitHub matches that name to
              unit {unit.id}; a typo skips the automated checks entirely.
            </p>
          </div>

          <div className="card-dark space-y-3">
            <span className="eyebrow text-[11px]">
              The data you build against
            </span>
            <div className="block">
              <code className="code-inline text-[15px] font-code-mono text-lime-pulse">
                {unit.build.data_variant}
              </code>
            </div>
            <p className="text-[14px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
              The automated checks run against this fixture corpus. It ships with the unit, so
              run them locally first; you will get the same result the grader gets.
            </p>
          </div>
        </div>

        {/* Submit guide link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-lg bg-carbon-veil border border-circuit-border">
          <span className="text-[15px] text-phosphor-white">Push your work for grading.</span>
          <Link href="/submit" className="btn btn-accent btn-sm">
            Read how submitting works
          </Link>
        </div>
    </div>
  );
}
