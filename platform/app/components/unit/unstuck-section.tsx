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
      className="scroll-mt-20 border-t border-line"
    >
      <div className="shell py-14">
        <SectionHeading
          title="Unstuck"
          lead="Common edge cases and failure modes for this unit, derived from real student attempts, with concrete fixes."
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
                  className="panel group px-5 py-0 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4">
                    <div className="flex items-start gap-3">
                      <IconAlertTriangle size={17} className="mt-0.5 shrink-0 text-warn" />
                      <span className="text-[15px] font-medium text-ink">{entry.symptom}</span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-ink-3">
                      {entry.fix_ref}
                    </span>
                  </summary>
                  {answer ? (
                    <div
                      className="prose-keel border-t border-line pt-4 pb-5"
                      dangerouslySetInnerHTML={{ __html: answer.html }}
                    />
                  ) : (
                    <div className="border-t border-line pt-4 pb-5">
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
          <div className="mt-8">
            <ContentArriving what="Unstuck entries for this unit" />
          </div>
        )}

        <div className="mt-8 rounded-xl border border-line bg-raised px-6 py-5">
          <p className="text-sm font-medium text-ink">Still stuck after reviewing these symptoms?</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
            Re-read the lesson layer that corresponds to the failing check, or inspect the worked
            example in the Practice section above.
          </p>
        </div>
      </div>
    </section>
  );
}
