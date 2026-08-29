import Link from "next/link";
import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { FaqEntry, UnitYaml } from "@/lib/content";

type UnstuckSectionProps = {
  unit: UnitYaml;
  faq: FaqEntry[] | null;
};

function anchorOf(fixRef: string): string | null {
  const hashIndex = fixRef.indexOf("#");
  return hashIndex >= 0 ? fixRef.slice(hashIndex + 1) : null;
}

export function UnstuckSection({ unit, faq }: UnstuckSectionProps) {
  return (
    <section
      id="unstuck"
      data-keel-section="unstuck"
      className="scroll-mt-28"
    >
      <div className="space-y-8">
        <SectionHeading
          stepNumber="05"
          title="Unstuck: 2AM Curated Diagnostics"
          lead="Common edge cases and error messages for this unit, curated from real developer attempts, with exact fixes so you never stay stuck."
        />

        {/* Diagnostic Accordions */}
        {unit.unstuck.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-semibold">
                CURATED FAILURE MODES ({unit.unstuck.length})
              </span>
              <span className="text-xs font-mono text-zinc-500">Root-Cause Remediation</span>
            </div>

            <div className="space-y-3">
              {unit.unstuck.map((entry, idx) => {
                const anchor = anchorOf(entry.fix_ref);
                const answer = anchor
                  ? (faq ?? []).find((item) => item.anchor === anchor)
                  : undefined;
                return (
                  <details
                    key={entry.fix_ref}
                    open={idx === 0}
                    className="group rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all open:bg-zinc-900/70 open:border-zinc-700/80"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-zinc-850/50 transition-colors list-none">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-rose-400 font-semibold">
                          ERR 0{idx + 1}
                        </span>
                        <span className="text-sm font-semibold font-mono text-zinc-200">
                          {entry.symptom}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500">
                          {entry.fix_ref}
                        </span>
                        <span className="text-xs font-mono text-zinc-500 group-open:rotate-180 transition-transform duration-200">
                          ▼
                        </span>
                      </div>
                    </summary>
                    <div className="px-5 py-5 border-t border-zinc-800/60 bg-zinc-950/50">
                      {answer ? (
                        <div
                          className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-code:text-sky-300 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-zinc-800 prose-strong:text-zinc-100"
                          dangerouslySetInnerHTML={{ __html: answer.html }}
                        />
                      ) : (
                        <ContentArriving
                          what={`The FAQ answer for this symptom (${entry.fix_ref})`}
                        />
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        ) : (
          <ContentArriving what="Unstuck entries for this unit" />
        )}

        {/* Concierge Assistance & Diagnostic Protocol Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <span className="text-xs font-mono tracking-wider text-sky-400 uppercase font-semibold block">
              CONCIERGE ASSISTANCE (SECTION 06)
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Need interactive help? The AI Concierge switches between <strong className="text-zinc-100">Teach Mode</strong> (explaining concepts and generating practice drills) and <strong className="text-zinc-100">Guard Mode</strong> (Socratic debugging without writing your deliverable).
            </p>
            <div className="pt-1">
              <a
                href="#concierge"
                className="text-xs font-mono text-sky-400 hover:text-sky-300 underline"
              >
                Jump to AI Concierge panel ↓
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <span className="text-xs font-mono tracking-wider text-zinc-400 uppercase font-semibold block">
              DEDICATED UNIT FAQ & KNOWLEDGE BASE
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Browse the complete unedited collection of architectural FAQs, provider quirks, and edge-case documentation for Unit {unit.id}.
            </p>
            <div className="pt-1">
              <Link
                href={`/faq#unit-${unit.id}`}
                className="text-xs font-mono text-zinc-300 hover:text-zinc-100 underline"
              >
                View full Unit {unit.id} FAQ archive →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
