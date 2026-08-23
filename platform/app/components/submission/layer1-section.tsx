import { SectionHeading } from "@/components/unit/section-heading";
import type { Layer1Check, Layer1Result } from "@/lib/grading";
import { humanizeId } from "@/lib/text";

function CheckRow({ check }: { check: Layer1Check }) {
  return (
    <div>
      <p>
        <strong>{humanizeId(check.id)}</strong> — <em>{check.status.toUpperCase()}</em>
      </p>
      <p>
        {check.note}
        {typeof check.wall_s === "number" ? ` (duration: ${check.wall_s.toFixed(2)}s)` : ""}
      </p>
      {check.output_tail ? (
        <details>
          <summary>View runner output</summary>
          <pre>{check.output_tail}</pre>
        </details>
      ) : null}
    </div>
  );
}

export function Layer1Section({ layer1 }: { layer1: Layer1Result | null | undefined }) {
  return (
    <section id="layer-1">
      <div>
        <hr />
        <SectionHeading
          title="Layer 1: Automated Sandbox Checks"
          lead="Deterministic test suites executed in an isolated Docker container."
        />
        {layer1 && layer1.checks.length > 0 ? (
          <>
            <p>
              <strong>Overall: {layer1.overall.toUpperCase()}</strong> ({layer1.checks.filter((c) => c.status === "pass").length} of {layer1.checks.length} tests passed)
            </p>
            <div>
              {layer1.checks.map((check) => (
                <div key={check.id}>
                  <CheckRow check={check} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>
            No Layer 1 results recorded for this submission.
          </p>
        )}
      </div>
    </section>
  );
}
