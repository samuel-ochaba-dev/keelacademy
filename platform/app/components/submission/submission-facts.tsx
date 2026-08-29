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
  const shortSha = s.commit_sha.slice(0, 10);
  const gitCommitUrl = s.repo_url
    ? `${s.repo_url.replace(/\.git$/, "")}/commit/${s.commit_sha}`
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <Fact label="STUDENT IDENTIFIER">
        <dd className="font-mono text-xs font-medium text-zinc-200 truncate">
          {studentEmail ?? s.student_name ?? `Student #${s.student_id}`}
        </dd>
      </Fact>

      <Fact label="TARGET WORKBENCH">
        <dd className="font-mono text-xs font-semibold text-emerald-400">
          <Link
            href={`/units/${s.unit_id}`}
            className="hover:underline flex items-center gap-1"
          >
            <span>UNIT-{s.unit_id}</span>
            <span className="text-zinc-500 text-[10px]">↗</span>
          </Link>
        </dd>
      </Fact>

      <Fact label="LOCKED COMMIT SHA">
        <dd className="font-mono text-xs font-medium text-sky-400">
          {gitCommitUrl ? (
            <a
              href={gitCommitUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1"
              title="Open commit in GitHub"
            >
              <code>{shortSha}</code>
              <span className="text-zinc-500 text-[10px]">↗</span>
            </a>
          ) : (
            <code className="text-zinc-300">{shortSha}</code>
          )}
        </dd>
      </Fact>

      <Fact label="SUBMITTED (UTC)">
        <dd className="font-mono text-xs text-zinc-300">
          {formatUtc(s.created_at)}
        </dd>
      </Fact>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="font-mono text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
        {label}
      </dt>
      {children}
    </div>
  );
}
