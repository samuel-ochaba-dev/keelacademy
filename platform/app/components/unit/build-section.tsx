import Link from "next/link";
import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { SubmissionContract, UnitYaml } from "@/lib/content";
import { IconArrowRight, IconCode } from "@/components/icons";

type BuildSectionProps = {
  unit: UnitYaml;
  contract: SubmissionContract | null;
};

export function BuildSection({ unit, contract }: BuildSectionProps) {
  return (
    <section id="build" data-keel-section="build" className="scroll-mt-20 border-t border-line">
      <div className="shell py-14">
        <SectionHeading
          title="Build"
          lead="The unit deliverable and its published submission contract."
        />

        {/* Deliverable */}
        <div className="mt-8 rounded-xl border border-accent/25 bg-accent-soft px-6 py-5">
          <p className="font-mono text-[11px] tracking-[0.1em] text-accent uppercase">
            The unit deliverable
          </p>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink">
            {unit.build.deliverable}
          </p>
        </div>

        {/* Submission contract */}
        <div className="mt-10">
          <h3 className="flex items-center gap-2.5 text-base font-semibold text-ink">
            <IconCode size={18} className="text-accent" />
            Submission contract
          </h3>

          {contract ? (
            <div className="mt-4">
              <div className="panel overflow-x-auto p-2">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Expected path</th>
                      <th>Contract responsibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.files.map((file) => (
                      <tr key={file.path}>
                        <td>
                          <code>{file.path}</code>
                        </td>
                        <td className="text-ink-2">{file.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {contract.cli ? (
                <div className="mt-4">
                  <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
                    Runner command line
                  </p>
                  <code className="mt-2 block overflow-x-auto rounded-lg border border-line bg-inset px-4 py-3 text-sm text-accent-strong">
                    {contract.cli}
                  </code>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4">
              <ContentArriving what="The submission contract from the checks file" />
            </div>
          )}
        </div>

        {/* Repo naming + data variant */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="panel p-6">
            <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
              Repository naming
            </p>
            <code className="mt-3 block overflow-x-auto rounded-lg border border-line bg-inset px-4 py-3 text-sm text-ink">
              keel-{unit.id}-solution
            </code>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
              Push your repository to GitHub. The intake router resolves unit ID {unit.id} from the
              repository name.
            </p>
          </div>

          <div className="panel p-6">
            <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
              Corpus data variant
            </p>
            <code className="mt-3 block overflow-x-auto rounded-lg border border-line bg-inset px-4 py-3 text-sm text-ink">
              {unit.build.data_variant}
            </code>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
              Seeded from your student ID. Copied solution files from peers fail against your unique
              test cases.
            </p>
          </div>
        </div>

        {/* Submit guide */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-raised px-6 py-4">
          <span className="text-sm text-ink-2">Ready to run automated verification?</span>
          <Link href="/submit" className="link-arrow">
            Read the submission guide
            <IconArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
