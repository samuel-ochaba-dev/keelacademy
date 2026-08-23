"use client";

import { useState } from "react";

const CODE_A = `# The tutorial way
prompt = "Extract the claim fields as JSON."
response = call_llm(prompt + claim_note)
data = json.loads(response)  # hope it parses`;

const CODE_B = `# The engineered way (Unit 3.2.1)
class ClaimExtraction(BaseModel):
    claimant: str
    policy_number: str
    incident_date: date
    claim_type: ClaimType

for record in corpus:            # all 20, even the hostile ones
    try:
        out = extract(record)    # schema-constrained
        log_ok(record.id)
    except ExtractionError:
        log_failure(record.id)   # logged, never dropped`;

export function HeroInspection() {
  const [tab, setTab] = useState<"a" | "b">("b");
  const [simulated, setSimulated] = useState(false);
  const a = tab === "a";

  return (
    <div className="card">
      <p className="eyebrow">Two ways to build the same feature</p>

      <div className="mt-4 flex gap-2" role="tablist" aria-label="Approach comparison">
        <button
          type="button"
          role="tab"
          aria-selected={a}
          onClick={() => {
            setTab("a");
            setSimulated(false);
          }}
          className={a ? "btn-secondary !border-school text-sm" : "btn-secondary text-sm opacity-60"}
        >
          The tutorial way
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!a}
          onClick={() => {
            setTab("b");
            setSimulated(false);
          }}
          className={!a ? "btn-secondary !border-school text-sm" : "btn-secondary text-sm opacity-60"}
        >
          The engineered way
        </button>
      </div>

      <div className="mt-5">
        <pre className="text-sm">
          <code>{a ? CODE_A : CODE_B}</code>
        </pre>

        <div className="mt-4">
          <button type="button" onClick={() => setSimulated(true)} className="btn-secondary text-sm">
            Run it against 20 messy claim notes
          </button>
          {simulated && (
            <p className="mt-3 text-sm leading-relaxed">
              {a ? (
                <>
                  <strong className="text-mark">17 of 20 parsed.</strong> Three
                  responses came back as prose, a markdown fence, and an apology.
                  Nothing was logged. You find out in production, or you never
                  find out.
                </>
              ) : (
                <>
                  <strong className="text-school-strong">20 of 20 accounted for.</strong>{" "}
                  Every output validated against the schema. The two failures are
                  in the log with their record ids, which is exactly what the
                  first rubric criterion checks.
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr>
            <th>When input 4,001 looks nothing like the samples</th>
            <th>When the judge asks for evidence</th>
            <th>What you learned</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-ink-soft">
              {a ? "Silently wrong, or silently dead." : "A logged failure with a record id and a reason."}
            </td>
            <td className="text-ink-soft">
              {a ? "There is none to give." : "The log line is the evidence. It is quoted back at you."}
            </td>
            <td className="text-ink-soft">
              {a ? "How to copy a demo." : "How to build the thing the demo was imitating."}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
