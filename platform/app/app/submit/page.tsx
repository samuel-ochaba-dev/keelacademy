import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submission Protocol & Git Workflow Guide",
  description:
    "How to configure repositories, push deliverables, and inspect automated verdicts in the Keel grading pipeline.",
};

const STATUS_TAXONOMY = [
  {
    status: "QUEUED",
    tone: "chip",
    summary: "Submission received and waiting for an available runner.",
    detail:
      "Your commit and unit files are verified. A clean, isolated test environment is spinning up to run your code.",
  },
  {
    status: "GRADING",
    tone: "chip-accent",
    summary: "Automated test execution and rubric evaluation in progress.",
    detail:
      "Automated test suites are running against your code, followed by line-by-line rubric evaluation with exact evidence quotes.",
  },
  {
    status: "GRADED",
    tone: "chip-pass",
    summary: "Evaluation complete with an auditable verdict.",
    detail:
      "Pass or retry verdict recorded with per-check results, grader reasoning, and quoted lines from your code.",
  },
  {
    status: "ERROR",
    tone: "chip-fail",
    summary: "Environment crash or timeout limit reached.",
    detail:
      "Your code exceeded the execution timeout (120s), memory bounds, or failed during setup. Free retry is immediately available.",
  },
];

const LIFECYCLE_STEPS = [
  {
    name: "1. Push your code to main",
    detail: "Commit and push your solution to your GitHub repository on the main branch.",
    code: "git add .\ngit commit -m 'feat: complete unit 3.2.1 claim extractor'\ngit push origin main",
  },
  {
    name: "2. Automatic intake & commit locking",
    detail:
      "Keel receives your push webhook, verifies your signature, and locks in your specific commit SHA so your grade is 100% reproducible.",
    code: "keel: received push for commit 8f9b2d1 on unit 3.2.1",
  },
  {
    name: "3. Clean environment execution",
    detail:
      "Your repository is cloned into a fresh, isolated container. Automated test suites run against your personal Meridian dataset.",
    code: "pytest -v --tb=short tests/test_unit_3_2_1.py\n# 8 passed in 2.34s",
  },
  {
    name: "4. Line-by-line rubric evaluation",
    detail:
      "The grading model evaluates your implementation against specific production criteria and attaches quoted code lines as proof.",
    code: 'Criterion 1 (schema constraints): PASS\nEvidence: extract_claims.py:14 "class ClaimExtraction(BaseModel)"',
  },
];

export default function SubmitPage() {
  const units = listUnits();
  const first = units[0];
  const unitId = first ? first.id : "3.2.1";

  return (
    <div>
      {/* Header */}
      <section>
        <div>
          <div>
            
            <span>GIT INGESTION & RUNNER ARCHITECTURE PROTOCOL</span>
          </div>

          <h1>
            How to push and verify your work.
          </h1>

          <p>
            No messy zip file uploads or browser code sandboxes. Write code in your local IDE, commit and push to
            GitHub, and let our isolated Linux containers execute test harnesses and evidence rubrics in seconds.
          </p>
        </div>
      </section>

      {/* Repository Contract & Naming */}
      <section>
        <div>
          <div>
            <span>
              01 · REPOSITORY NAMING CONTRACT
            </span>
            <h2>Deterministic Repository Binding</h2>
            <p>
              Each unit deliverable lives in a separate GitHub repository named with your unit ID and project suffix.
              Our intake daemon listens for push webhooks, resolves the target unit from the repository name, and binds your commit SHA.
            </p>
            <p>
              Your repository must expose the exact entrypoint specified in the unit&apos;s build contract. For Unit 3.2.1,
              the test harness imports <code>extract_claims.py</code> exposing <code>extract_claim(text: str) -&gt; ClaimExtraction</code>.
            </p>
            {first ? (
              <Link href={`/units/${first.id}#build`}>
                <span>Inspect Unit {first.id} Contract Specification</span>
              </Link>
            ) : null}
          </div>

          <div>
            <div>
              <span>
                <span>REPO BINDING PATTERN</span>
              </span>
              <span>MATCH RULE ACTIVE</span>
            </div>
            <code>
              keel-{unitId}-claims-extractor
            </code>
            <p>
              Push to main. Webhook signature validated via HMAC-SHA256. Ephemeral Docker sandbox spawns within 800ms.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Stage Lifecycle Stepper */}
      <section>
        <div>
          <div>
            <span>02 · RUNNER PIPELINE EXECUTION</span>
          </div>

          <h2>
            The four-stage automated grading lifecycle.
          </h2>

          <div>
            {LIFECYCLE_STEPS.map((step, index) => (
              <div key={step.name}>
                <div>
                  <div>
                    <span>STAGE 0{index + 1}</span>
                  </div>
                  <h3>{step.name}</h3>
                  <p>{step.detail}</p>
                </div>
                <div>
                  <pre><code>{step.code}</code></pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Taxonomy Grid */}
      <section>
        <div>
          <div>
            <span>03 · STATUS TAXONOMY</span>
          </div>

          <h2>
            Submission status dictionary.
          </h2>

          <div>
            {STATUS_TAXONOMY.map((item) => (
              <div key={item.status}>
                <div>
                  <span>{item.status}</span>
                </div>
                <h3>{item.summary}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cockpit link callout */}
      <section>
        <div>
          <div>
            <h3>Link your GitHub repository in the Cockpit</h3>
            <p>
              Track active unit submissions, view raw runner logs, and inspect rubric proof quotes.
            </p>
          </div>
          <Link href="/me">
            <span>Open Learner Cockpit</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
