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
        <SectionHeading
          stepNumber="03"
          title="Build: The Production Deliverable"
          lead="The unit deliverable and its published submission contract."
        />

        {/* Deliverable Callout */}
        <div>
          <span>
            UNIT DELIVERABLE OBJECTIVE
          </span>
          <p>
            {unit.build.deliverable}
          </p>
        </div>

        {/* Submission contract */}
        <div>
          <div>
            <h3>
              SUBMISSION CONTRACT SPECIFICATION
            </h3>
          </div>

          {contract ? (
            <div>
              <div>
                <table>
                  <thead>
                    <tr>
                      <th>Expected Path</th>
                      <th>Contract Responsibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.files.map((file) => (
                      <tr key={file.path}>
                        <td>
                          <code>{file.path}</code>
                        </td>
                        <td>{file.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {contract.cli ? (
                <div>
                  <span>
                    RUNNER CLI ENTRYPOINT
                  </span>
                  <code>
                    {contract.cli}
                  </code>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <ContentArriving what="The submission contract from the checks file" />
            </div>
          )}
        </div>

        {/* Repo naming + data variant */}
        <div>
          <div>
            <span>
              REPOSITORY NAME BINDING
            </span>
            <code>
              keel-{unit.id}-solution
            </code>
            <p>
              Push your repository to GitHub. The intake router resolves unit ID {unit.id} from the repository name.
            </p>
          </div>

          <div>
            <span>
              SEEDED DATA VARIANT
            </span>
            <code>
              {unit.build.data_variant}
            </code>
            <p>
              Corpus seeded from your student ID. Copied solution files from peers fail against your unique test cases.
            </p>
          </div>
        </div>

        {/* Submit guide link */}
        <div>
          <span>Ready to execute automated verification?</span>
          <Link href="/submit">
            <span>Read submission protocol</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
