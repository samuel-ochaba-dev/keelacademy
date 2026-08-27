import { formatUtc, type TimelineEvent } from "@/lib/grading";
import { humanizeId } from "@/lib/text";

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
    <section id="timeline">
      <div>
        <div>
          
          <div>
            <h2>Event stream</h2>
            <p>
              Chronological log of recorded execution events for this submission.
            </p>
          </div>
        </div>

        {events.length > 0 ? (
          <ol>
            {events.map((event) => {
              const detail = typeof event.payload.detail === "string" ? event.payload.detail : null;
              return (
                <li
                  key={event.seq}
                >
                  <div>
                    <span>#{event.seq}</span>
                    <span>{eventLabel(event)}</span>
                  </div>
                  <div>
                    {detail ? <code>{detail}</code> : null}
                    <span>
                      {formatUtc(event.occurred_at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p>No events recorded yet.</p>
        )}
      </div>
    </section>
  );
}
