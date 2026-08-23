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
    <section id="unstuck" data-keel-section="unstuck">
      <div>
        <hr />
        <SectionHeading
          title="Unstuck"
          lead="Common edge cases and failure modes for this unit, with concrete fixes."
        />

        {unit.unstuck.length > 0 ? (
          <div>
            {unit.unstuck.map((entry) => {
              const anchor = anchorOf(entry.fix_ref);
              const answer = anchor ? (faq ?? []).find((item) => item.anchor === anchor) : undefined;
              return (
                <div key={entry.fix_ref}>
                  <h3>{entry.symptom}</h3>
                  {answer ? (
                    <div dangerouslySetInnerHTML={{ __html: answer.html }} />
                  ) : (
                    <div>
                      <ContentArriving what={`The FAQ answer for this symptom (${entry.fix_ref})`} />
                    </div>
                  )}
                  <p>
                    <small>Reference: {entry.fix_ref}</small>
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <ContentArriving what="Unstuck entries for this unit" />
        )}

        <p>
          <em>If you remain stuck after reviewing these symptoms, re-read the lesson layer that corresponds
          to the failing check, or inspect the worked example in the Practice section.</em>
        </p>
      </div>
    </section>
  );
}
