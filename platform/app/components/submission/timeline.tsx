import { formatUtc, type TimelineEvent } from "@/lib/grading";
import { humanizeId } from "@/lib/text";
import { IconClock } from "@/components/icons";

const EVENT_LABELS: Record<string, string> = {
  "submission.created": "Submission received",
  "verdict.issued": "Verdict generated",
  "grade.budget_blocked": "Budget limit reached",
};

function eventLabel(event: TimelineEvent): string {
  return EVENT_LABELS[event.type] ?? humanizeId(event.type);
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section id="timeline" className="scroll-mt-24">
      <div className="panel overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line bg-inset px-5 py-4">
          <span className="grid size-9 place-items-center rounded-lg border border-line bg-raised text-accent">
            <IconClock size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink">Event stream</h2>
            <p className="text-[13px] text-ink-3">
              Chronological log of recorded execution events for this submission.
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <ol className="divide-y divide-line">
            {events.map((event) => {
              const detail = typeof event.payload.detail === "string" ? event.payload.detail : null;
              return (
                <li
                  key={event.seq}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-ink-3">#{event.seq}</span>
                    <span className="text-sm font-medium text-ink">{eventLabel(event)}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    {detail ? <code className="text-xs text-ink-3">{detail}</code> : null}
                    <span className="font-mono text-xs text-ink-3">
                      {formatUtc(event.occurred_at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-3">No events recorded yet.</p>
        )}
      </div>
    </section>
  );
}
