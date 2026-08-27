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
    >
      <div>
        <SectionHeading
          stepNumber="05"
          title="Unstuck: 2AM Curated Diagnostics"
          lead="Common edge cases and error messages for this unit, curated from real developer attempts, with exact fixes so you never stay stuck."
        />

        {unit.unstuck.length > 0 ? (
          <div>
            {unit.unstuck.map((entry) => {
              const anchor = anchorOf(entry.fix_ref);
              const answer = anchor
                ? (faq ?? []).find((item) => item.anchor === anchor)
                : undefined;
              return (
                <details
                  key={entry.fix_ref}
                >
                  <summary>
                    <div>
                      <span>{entry.symptom}</span>
                    </div>
                    <span>
                      {entry.fix_ref}
                    </span>
                  </summary>
                  {answer ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: answer.html }}
                    />
                  ) : (
                    <div>
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
          <div>
            <ContentArriving what="Unstuck entries for this unit" />
          </div>
        )}

        <div>
          <span>
            DIAGNOSTIC PROTOCOL
          </span>
          <p>
            Still stuck after reviewing these symptoms? Inspect the annotated worked example in the Practice workbench or review the schema validation tests.
          </p>
        </div>
      </div>
    </section>
  );
}
