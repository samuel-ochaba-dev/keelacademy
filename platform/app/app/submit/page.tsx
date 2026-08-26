import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { IconGitBranch, IconArrowRight, IconTerminal } from "@/components/icons";

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
    <div className="space-y-0">
      {/* Header */}
      <section className="border-b border-line bg-canvas pt-12 pb-10">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            <span>GIT INGESTION & RUNNER ARCHITECTURE PROTOCOL</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            How to push and verify your work.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            No messy zip file uploads or browser code sandboxes. Write code in your local IDE, commit and push to
            GitHub, and let our isolated Linux containers execute test harnesses and evidence rubrics in seconds.
          </p>
        </div>
      </section>

      {/* Repository Contract & Naming */}
      <section className="shell py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-accent uppercase tracking-wider">
              01 · REPOSITORY NAMING CONTRACT
            </span>
            <h2 className="text-xl font-semibold text-ink">Deterministic Repository Binding</h2>
            <p className="text-xs leading-relaxed text-ink-2">
              Each unit deliverable lives in a separate GitHub repository named with your unit ID and project suffix.
              Our intake daemon listens for push webhooks, resolves the target unit from the repository name, and binds your commit SHA.
            </p>
            <p className="text-xs leading-relaxed text-ink-2">
              Your repository must expose the exact entrypoint specified in the unit&apos;s build contract. For Unit 3.2.1,
              the test harness imports <code>extract_claims.py</code> exposing <code>extract_claim(text: str) -&gt; ClaimExtraction</code>.
            </p>
            {first ? (
              <Link href={`/units/${first.id}#build`} className="link-arrow text-xs pt-2 inline-flex">
                <span>Inspect Unit {first.id} Contract Specification</span>
                <IconArrowRight size={12} />
              </Link>
            ) : null}
          </div>

          <div className="rounded-lg border border-line bg-raised p-6 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-ink-3">
              <span className="flex items-center gap-2">
                <IconGitBranch size={14} className="text-accent" />
                <span>REPO BINDING PATTERN</span>
              </span>
              <span className="text-pass">MATCH RULE ACTIVE</span>
            </div>
            <code className="block rounded border border-line bg-inset p-3 font-mono text-xs text-accent">
              keel-{unitId}-claims-extractor
            </code>
            <p className="text-[11px] font-mono text-ink-3 leading-relaxed">
              Push to main. Webhook signature validated via HMAC-SHA256. Ephemeral Docker sandbox spawns within 800ms.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Stage Lifecycle Stepper */}
      <section className="border-t border-line bg-raised/30 py-14">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-accent">
            <IconTerminal size={14} />
            <span>02 · RUNNER PIPELINE EXECUTION</span>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            The four-stage automated grading lifecycle.
          </h2>

          <div className="mt-8 space-y-6">
            {LIFECYCLE_STEPS.map((step, index) => (
              <div key={step.name} className="rounded border border-line bg-raised p-5 grid gap-4 lg:grid-cols-[220px_1fr] items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-accent">
                    <span>STAGE 0{index + 1}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-ink">{step.name}</h3>
                  <p className="text-[11px] leading-relaxed text-ink-3">{step.detail}</p>
                </div>
                <div className="rounded border border-line bg-inset p-3 overflow-x-auto font-mono text-[11px] text-ink-2">
                  <pre><code>{step.code}</code></pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Taxonomy Grid */}
      <section className="border-t border-line bg-canvas py-14">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-ink-3">
            <span>03 · STATUS TAXONOMY</span>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Submission status dictionary.
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {STATUS_TAXONOMY.map((item) => (
              <div key={item.status} className="rounded border border-line bg-raised p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={item.tone}>{item.status}</span>
                </div>
                <h3 className="text-xs font-semibold text-ink">{item.summary}</h3>
                <p className="text-xs text-ink-3 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cockpit link callout */}
      <section className="border-t border-line bg-raised/40 py-12">
        <div className="shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-ink">Link your GitHub repository in the Cockpit</h3>
            <p className="text-xs text-ink-3">
              Track active unit submissions, view raw runner logs, and inspect rubric proof quotes.
            </p>
          </div>
          <Link href="/me" className="btn-ghost">
            <span>Open Learner Cockpit</span>
            <IconArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
}
