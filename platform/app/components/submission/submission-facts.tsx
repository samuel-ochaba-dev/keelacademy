import Link from "next/link";
import { formatUtc, type SubmissionView } from "@/lib/grading";

export function SubmissionFacts({ view }: { view: SubmissionView }) {
  const s = view.submission;
  return (
    <div>
      <table border={1}>
        <tbody>
          <tr>
            <td><strong>Student:</strong></td>
            <td>{s.student_name ?? `Student #${s.student_id}`}</td>
          </tr>
          <tr>
            <td><strong>Unit Target:</strong></td>
            <td>
              <Link href={`/units/${s.unit_id}`}>
                Unit {s.unit_id}
              </Link>
            </td>
          </tr>
          <tr>
            <td><strong>Commit Hash:</strong></td>
            <td><code>{s.commit_sha.slice(0, 10)}</code></td>
          </tr>
          <tr>
            <td><strong>Timestamp:</strong></td>
            <td>{formatUtc(s.created_at)}</td>
          </tr>
          {s.repo_url ? (
            <tr>
              <td><strong>Repository:</strong></td>
              <td><code>{s.repo_url}</code></td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
