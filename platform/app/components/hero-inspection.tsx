"use client";

import { useState } from "react";

export function HeroInspection() {
  const [tab, setTab] = useState<"a" | "b">("b");
  const [simulated, setSimulated] = useState(false);

  return (
    <div>
      <div>
        <button
          type="button"
          onClick={() => {
            setTab("a");
            setSimulated(false);
          }}
        >
          {tab === "a" ? "● [Option A: Baseline]" : "[Option A: Baseline]"}
        </button>
        {" | "}
        <button
          type="button"
          onClick={() => {
            setTab("b");
            setSimulated(false);
          }}
        >
          {tab === "b" ? "● [Option B: Engineered]" : "[Option B: Engineered]"}
        </button>
      </div>

      <div>
        {tab === "a" ? (
          <div>
            <p>
              <strong>[Option A Description Placeholder]:</strong>
            </p>
            <pre>
              <code>
{`# [Option A Code Sample Placeholder]
prompt = "[Input Prompt Placeholder]"
response = call_llm(prompt)
data = parse_json(response)`}
              </code>
            </pre>

            <div>
              <button
                type="button"
                onClick={() => setSimulated(true)}
              >
                [Simulate Option A Test]
              </button>
              {simulated && (
                <p>
                  <strong>[Simulation Result]:</strong> [Option A Error / Output Placeholder]
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p>
              <strong>[Option B Description Placeholder]:</strong>
            </p>
            <pre>
              <code>
{`# [Option B Code Sample Placeholder]
class SchemaModel(BaseModel):
    field_id: str
    validated: bool

result = run_pipeline(corpus)`}
              </code>
            </pre>

            <div>
              <button
                type="button"
                onClick={() => setSimulated(true)}
              >
                [Simulate Option B Test]
              </button>
              {simulated && (
                <p>
                  <strong>[Simulation Result]:</strong> [Option B Pass / Output Placeholder]
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <table border={1}>
          <thead>
            <tr>
              <th>[Metric 1]</th>
              <th>[Metric 2]</th>
              <th>[Metric 3]</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{tab === "a" ? "[Option A Metric 1]" : "[Option B Metric 1]"}</td>
              <td>{tab === "a" ? "[Option A Metric 2]" : "[Option B Metric 2]"}</td>
              <td>{tab === "a" ? "[Option A Metric 3]" : "[Option B Metric 3]"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
