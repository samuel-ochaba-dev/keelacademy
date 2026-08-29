import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submission Protocol",
  description: "How to configure repositories, push deliverables, and inspect automated verdicts in the Keel grading pipeline.",
};

const STATUS_TAXONOMY = [
  {
    status: "QUEUED",
    summary: "Submission received and waiting for an available runner.",
    detail: "Your commit and unit files are verified. A clean, isolated test environment is spinning up to run your code.",
  },
  {
    status: "GRADING",
    summary: "Automated test execution and rubric evaluation in progress.",
    detail: "Automated test suites are running against your code, followed by line-by-line rubric evaluation with exact evidence quotes.",
  },
  {
    status: "GRADED",
    summary: "Evaluation complete with an auditable verdict.",
    detail: "Pass or retry verdict recorded with per-check results, grader reasoning, and quoted lines from your code.",
  },
  {
    status: "ERROR",
    summary: "Environment crash or timeout limit reached.",
    detail: "Your code exceeded the execution timeout, memory bounds, or failed during setup. Free retry is immediately available.",
  },
];

const LIFECYCLE_STEPS = [
  {
    name: "1. Push your code to main",
    detail: "Commit and push your solution to your GitHub repository on the main branch.",
    code: "git add .\ngit commit -m 'feat: complete unit'\ngit push origin main",
  },
  {
    name: "2. Automatic intake & commit locking",
    detail: "Keel receives your push webhook, verifies your signature, and locks in your specific commit SHA so your grade is 100% reproducible.",
    code: "keel: received push for commit on unit",
  },
  {
    name: "3. Clean environment execution",
    detail: "Your repository is cloned into a fresh, isolated container. Automated test suites run against your personal dataset.",
    code: "pytest -v tests/",
  },
  {
    name: "4. Line-by-line rubric evaluation",
    detail: "The grading model evaluates your implementation against specific production criteria and attaches quoted code lines as proof.",
    code: 'Criterion 1: PASS',
  },
];

export default function SubmitPage() {
  const units = listUnits();
  const first = units[0];
  const unitId = first ? first.id : "3.2.1";

  return (
    <div>
      <header>
        <h1>How to push and verify your work</h1>
        <p>
          Write code in your local repository, commit and push to GitHub, and let the test runner execute tests and rubrics.
        </p>
      </header>

      <section>
        <h2>Repository Naming Contract</h2>
        <p>
          Each unit deliverable lives in a separate GitHub repository named with your unit ID.
        </p>
        <code>keel-{unitId}-your-suffix</code>
      </section>

      <section>
        <h2>Runner Pipeline Execution</h2>
        <ol>
          {LIFECYCLE_STEPS.map((step) => (
            <li key={step.name}>
              <h3>{step.name}</h3>
              <p>{step.detail}</p>
              <pre><code>{step.code}</code></pre>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Status Taxonomy</h2>
        <dl>
          {STATUS_TAXONOMY.map((item) => (
            <div key={item.status}>
              <dt><strong>{item.status}</strong>: {item.summary}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Accounts and payments</h2>
        <p>
          Enrolling in a unit links your student account to the grading runner and provisions an isolated token budget.
        </p>
      </section>

      <section>
        <p>
          <Link href="/me">Open Dashboard</Link>
        </p>
      </section>
    </div>
  );
}
