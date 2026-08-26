import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { FaqEntry, UnitYaml } from "@/lib/content";
import { IconAlertTriangle } from "@/components/icons";

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
      className="scroll-mt-20 border-t border-line bg-canvas"
    >
      <div className="shell py-12">
        <SectionHeading
          stepNumber="05"
          title="Unstuck: 2AM Curated Diagnostics"
          lead="Common edge cases and error messages for this unit, curated from real developer attempts, with exact fixes so you never stay stuck."
        />

        {unit.unstuck.length > 0 ? (
          <div className="mt-8 space-y-3">
            {unit.unstuck.map((entry) => {
              const anchor = anchorOf(entry.fix_ref);
              const answer = anchor
                ? (faq ?? []).find((item) => item.anchor === anchor)
                : undefined;
              return (
                <details
                  key={entry.fix_ref}
                  className="rounded border border-line bg-raised overflow-hidden group [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 bg-inset/50 hover:bg-raised-2/50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <IconAlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" />
                      <span className="text-xs font-semibold text-ink">{entry.symptom}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-ink-4">
                      {entry.fix_ref}
                    </span>
                  </summary>
                  {answer ? (
                    <div
                      className="prose-keel border-t border-line p-5 bg-raised text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: answer.html }}
                    />
                  ) : (
                    <div className="border-t border-line p-5">
                      <ContentArriving
                        what={`The FAQ answer for this symptom (${entry.fix_ref})`}
                      />
                    </div>
                  )}
                </details>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <ContentArriving what="Unstuck entries for this unit" />
          </div>
        )}

        <div className="mt-6 rounded border border-line bg-raised p-5 space-y-1">
          <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider font-semibold block">
            DIAGNOSTIC PROTOCOL
          </span>
          <p className="text-xs text-ink-2 leading-relaxed">
            Still stuck after reviewing these symptoms? Inspect the annotated worked example in the Practice workbench or review the schema validation tests.
          </p>
        </div>
      </div>
    </section>
  );
}
