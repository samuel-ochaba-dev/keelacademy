import Link from "next/link";
import { formatUtc, type SubmissionView } from "@/lib/grading";

export function SubmissionFacts({ view }: { view: SubmissionView }) {
  const s = view.submission;
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
      <Fact label="Student account">
        <dd className="mt-1.5 text-sm text-ink">{s.student_name ?? `Student #${s.student_id}`}</dd>
      </Fact>
      <Fact label="Target unit">
        <dd className="mt-1.5 text-sm">
          <Link href={`/units/${s.unit_id}`} className="text-accent hover:text-accent-strong">
            Unit {s.unit_id}
          </Link>
        </dd>
      </Fact>
      <Fact label="Commit SHA">
        <dd className="mt-1.5">
          <code className="text-xs text-ink">{s.commit_sha.slice(0, 10)}</code>
        </dd>
      </Fact>
      <Fact label="Submitted (UTC)">
        <dd className="mt-1.5 font-mono text-xs text-ink">{formatUtc(s.created_at)}</dd>
      </Fact>
    </dl>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-raised px-5 py-4">
      <dt className="font-mono text-[10px] tracking-[0.1em] text-ink-3 uppercase">{label}</dt>
      {children}
    </div>
  );
}
