import Link from "next/link";
import { formatUtc, type SubmissionView } from "@/lib/grading";

export function SubmissionFacts({
  view,
  studentEmail,
}: {
  view: SubmissionView;
  studentEmail?: string | null;
}) {
  const s = view.submission;
  return (
    <dl>
      <Fact label="Student account">
        <dd>{studentEmail ?? s.student_name ?? `Student #${s.student_id}`}</dd>
      </Fact>
      <Fact label="Target unit">
        <dd>
          <Link href={`/units/${s.unit_id}`}>
            Unit {s.unit_id}
          </Link>
        </dd>
      </Fact>
      <Fact label="Commit SHA">
        <dd>
          <code>{s.commit_sha.slice(0, 10)}</code>
        </dd>
      </Fact>
      <Fact label="Submitted (UTC)">
        <dd>{formatUtc(s.created_at)}</dd>
      </Fact>
    </dl>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      {children}
    </div>
  );
}
