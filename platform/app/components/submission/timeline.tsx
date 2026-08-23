import { formatUtc, type TimelineEvent } from "@/lib/grading";
import { humanizeId } from "@/lib/text";

const EVENT_LABELS: Record<string, string> = {
  "submission.created": "Submission received",
  "verdict.issued": "Verdict issued",
  "grade.budget_blocked": "Budget blocked",
};

function eventLabel(event: TimelineEvent): string {
  return EVENT_LABELS[event.type] ?? humanizeId(event.type);
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <section id="timeline">
      <div>
        <hr />
        <h2>Event Stream</h2>
        <p>Chronological log of recorded grading events.</p>
        {events.length > 0 ? (
          <table border={1}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event</th>
                <th>Seq #</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const detail = typeof event.payload.detail === "string" ? event.payload.detail : null;
                return (
                  <tr key={event.seq}>
                    <td><small>{formatUtc(event.occurred_at)}</small></td>
                    <td><strong>{eventLabel(event)}</strong></td>
                    <td>#{event.seq}</td>
                    <td>{detail ? <code>{detail}</code> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>
            No events recorded yet.
          </p>
        )}
      </div>
    </section>
  );
}
