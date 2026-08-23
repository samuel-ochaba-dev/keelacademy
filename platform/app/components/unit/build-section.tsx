import Link from "next/link";
import { ContentArriving } from "@/components/content-arriving";
import { SectionHeading } from "@/components/unit/section-heading";
import type { SubmissionContract, UnitYaml } from "@/lib/content";

type BuildSectionProps = {
  unit: UnitYaml;
  contract: SubmissionContract | null;
};

export function BuildSection({ unit, contract }: BuildSectionProps) {
  return (
    <section id="build" data-keel-section="build">
      <div>
        <hr />
        <SectionHeading title="Build" lead="The unit deliverable and its published submission contract." />

        <blockquote>
          <p><strong>Unit Deliverable:</strong></p>
          <p>{unit.build.deliverable}</p>
        </blockquote>

        <h3>Submission Contract</h3>
        {contract ? (
          <div>
            <table border={1}>
              <thead>
                <tr>
                  <th>Expected Path</th>
                  <th>Responsibility</th>
                </tr>
              </thead>
              <tbody>
                {contract.files.map((file) => (
                  <tr key={file.path}>
                    <td><code>{file.path}</code></td>
                    <td>{file.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {contract.cli ? (
              <div>
                <p><strong>Runner Command Line:</strong></p>
                <code>{contract.cli}</code>
              </div>
            ) : null}
          </div>
        ) : (
          <ContentArriving what="The submission contract from the checks file" />
        )}

        <div>
          <p>
            <strong>Repository Naming:</strong> <code>keel-{unit.id}-your-suffix</code>
          </p>
          <p>
            Push a repository matching this format. The intake router extracts the unit id to grade automatically.
          </p>

          <p>
            <strong>Corpus Variant:</strong> <code>{unit.build.data_variant}</code>
          </p>
          <p>
            Your variant is generated from your student seed.
          </p>
        </div>

        <p>
          Ready to submit?{" "}
          <Link href="/submit">
            View submission guide
          </Link>
        </p>
      </div>
    </section>
  );
}
