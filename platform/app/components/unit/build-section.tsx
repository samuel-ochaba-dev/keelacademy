import Link from "next/link";
import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { SubmissionContract, UnitYaml } from "@/lib/content";

type BuildSectionProps = {
  unit: UnitYaml;
  contract: SubmissionContract | null;
};

export function BuildSection({ unit, contract }: BuildSectionProps) {
  return (
    <section id="build" data-keel-section="build" className="scroll-mt-28">
      <div className="space-y-8">
        <SectionHeading
          stepNumber="03"
          title="Build: The Production Deliverable"
          lead="The unit deliverable and its published submission contract. Every requirement tested deterministically before LLM evaluation."
        />

        {/* Deliverable Callout */}
        <div className="rounded-xl border border-sky-950/80 bg-gradient-to-br from-sky-950/30 via-zinc-900/60 to-zinc-900/40 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-sky-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              UNIT DELIVERABLE OBJECTIVE
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
              PHASE {unit.phase} GATE
            </span>
          </div>
          <p className="text-base sm:text-lg font-medium text-zinc-100 font-sans leading-relaxed">
            {unit.build.deliverable}
          </p>
        </div>

        {/* Submission contract */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 font-semibold">CONTRACT</span>
              <span className="text-zinc-700">/</span>
              <h3 className="text-base font-bold font-mono text-zinc-100">
                SUBMISSION CONTRACT SPECIFICATION
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
              STRICT ARTIFACT LAYOUT
            </span>
          </div>

          {contract ? (
            <div className="space-y-6">
              {/* Expected files table */}
              <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/50">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
                    <tr>
                      <th className="py-3 px-4 font-medium uppercase tracking-wider">Expected Path</th>
                      <th className="py-3 px-4 font-medium uppercase tracking-wider font-sans">Contract Responsibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {contract.files.map((file) => (
                      <tr key={file.path} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4 text-sky-400 font-semibold whitespace-nowrap">
                          <code>{file.path}</code>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 font-sans text-sm">{file.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CLI Command specification */}
              {contract.cli ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-semibold">
                      RUNNER CLI ENTRYPOINT
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">Automated Pipeline Invocation</span>
                  </div>
                  <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                    <code>{contract.cli}</code>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <ContentArriving what="The submission contract from the checks file" />
          )}
        </div>

        {/* Repo naming + data variant + Sandbox constraints */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-semibold block">
              REPOSITORY BINDING
            </span>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs text-sky-400">
              keel-{unit.id}-solution
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Push your solution to GitHub with this repository name. The intake router matches unit ID {unit.id} directly.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-semibold block">
              SEEDED DATA VARIANT
            </span>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs text-amber-400">
              {unit.build.data_variant}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Corpus seeded from your student ID. Copied solution files from peers fail against your unique test cases.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-semibold block">
              SANDBOX CONSTRAINTS
            </span>
            <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
              2 CPU · 2GB RAM · 60s Timeout
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Ephemeral isolated Linux runner container. No external internet access during test execution.
            </p>
          </div>
        </div>

        {/* Submit guide link CTA */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-sm font-semibold text-zinc-200 font-mono">Ready to execute automated verification?</div>
            <div className="text-xs text-zinc-400 font-sans">Review the end-to-end submission protocol and GitHub integration guide.</div>
          </div>
          <Link
            href="/submit"
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-mono text-xs font-semibold tracking-wide transition-all shadow-sm whitespace-nowrap"
          >
            Read submission protocol →
          </Link>
        </div>
      </div>
    </section>
  );
}
