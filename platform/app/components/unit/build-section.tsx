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
    <section id="build" data-keel-section="build" className="scroll-mt-20 border-t border-line bg-canvas">
      <div className="shell py-12">
        <SectionHeading
          stepNumber="03"
          title="Build: The Production Deliverable"
          lead="The unit deliverable and its published submission contract."
        />

        {/* Deliverable Callout */}
        <div className="mt-6 rounded border border-accent/30 bg-accent-soft p-5">
          <span className="font-mono text-[10px] text-accent uppercase tracking-wider font-semibold block">
            UNIT DELIVERABLE OBJECTIVE
          </span>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink font-medium">
            {unit.build.deliverable}
          </p>
        </div>

        {/* Submission contract */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <IconCode size={14} className="text-accent" />
            <h3 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
              SUBMISSION CONTRACT SPECIFICATION
            </h3>
          </div>

          {contract ? (
            <div className="space-y-4">
              <div className="rounded border border-line bg-raised overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line bg-inset font-mono text-[10px] text-ink-4 uppercase">
                      <th className="py-2.5 px-4 font-semibold">Expected Path</th>
                      <th className="py-2.5 px-4 font-semibold">Contract Responsibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {contract.files.map((file) => (
                      <tr key={file.path} className="hover:bg-raised-2/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-accent">
                          <code>{file.path}</code>
                        </td>
                        <td className="py-2.5 px-4 text-ink-2">{file.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {contract.cli ? (
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider block">
                    RUNNER CLI ENTRYPOINT
                  </span>
                  <code className="block overflow-x-auto rounded border border-line bg-inset p-3 font-mono text-xs text-accent">
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
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded border border-line bg-raised p-5 space-y-2">
            <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider block">
              REPOSITORY NAME BINDING
            </span>
            <code className="block rounded border border-line bg-inset p-2.5 font-mono text-xs text-ink">
              keel-{unit.id}-solution
            </code>
            <p className="text-[11px] leading-relaxed text-ink-3">
              Push your repository to GitHub. The intake router resolves unit ID {unit.id} from the repository name.
            </p>
          </div>

          <div className="rounded border border-line bg-raised p-5 space-y-2">
            <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider block">
              SEEDED DATA VARIANT
            </span>
            <code className="block rounded border border-line bg-inset p-2.5 font-mono text-xs text-ink">
              {unit.build.data_variant}
            </code>
            <p className="text-[11px] leading-relaxed text-ink-3">
              Corpus seeded from your student ID. Copied solution files from peers fail against your unique test cases.
            </p>
          </div>
        </div>

        {/* Submit guide link */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded border border-line bg-raised px-5 py-3 font-mono text-xs">
          <span className="text-ink-3">Ready to execute automated verification?</span>
          <Link href="/submit" className="link-arrow">
            <span>Read submission protocol</span>
            <IconArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
