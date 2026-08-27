import type { Layer1Check, Layer1Result } from "@/lib/grading";
import { humanizeId } from "@/lib/text";

function CheckRow({ check }: { check: Layer1Check }) {
  return (
    <div>
      <div>
        <div>
          <span>{humanizeId(check.id)}</span>
        </div>

        <div>
          {typeof check.wall_s === "number" ? (
            <span>{check.wall_s.toFixed(2)}s</span>
          ) : null}
          <span>{check.status}</span>
        </div>
      </div>

      {check.note ? <p>{check.note}</p> : null}

      {check.output_tail ? (
        <details>
          <summary>
            Container output
          </summary>
          <pre>
            <code>{check.output_tail}</code>
          </pre>
        </details>
      ) : null}
    </div>
  );
}

export function Layer1Section({ layer1 }: { layer1: Layer1Result | null | undefined }) {
  const passCount = layer1?.checks.filter((c) => c.status === "pass").length ?? 0;
  const totalCount = layer1?.checks.length ?? 0;

  return (
    <section id="layer-1">
      <div>
        <div>
          <div>
            
            <h2>
              Layer 1: automated sandbox checks
            </h2>
          </div>

          {layer1 ? (
            <span>
              {passCount}/{totalCount} passed
            </span>
          ) : null}
        </div>

        {layer1 && layer1.checks.length > 0 ? (
          <div>
            {layer1.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>
        ) : (
          <p>
            No Layer 1 test results recorded for this submission.
          </p>
        )}
      </div>
    </section>
  );
}
