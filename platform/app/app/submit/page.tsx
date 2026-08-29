import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Git Submission Protocol & Intake Guide",
  description:
    "How to configure repositories, push code to origin main, trigger webhook intake, and resolve diagnostic failures in Keel Academy.",
};

const STATUS_TAXONOMY = [
  {
    status: "QUEUED",
    variant: "warning" as const,
    summary: "Submission payload received and locked; waiting for an available container.",
    detail:
      "Keel verified your HMAC webhook signature and locked your commit SHA in Postgres. A fresh Docker container is provisioning in the runner pool.",
  },
  {
    status: "GRADING",
    variant: "info" as const,
    summary: "Deterministic test execution and rubric evaluation in progress.",
    detail:
      "Layer 1 functional assertions and test suites run in isolation, followed by Layer 2 LLM-as-judge evaluation against your code files.",
  },
  {
    status: "GRADED",
    variant: "success" as const,
    summary: "Evaluation completed with a cryptographic verdict ledger entry.",
    detail:
      "Pass or fail verdict recorded with per-check results, container exit codes, exact quoted evidence lines, and author defense questions.",
  },
  {
    status: "ERROR",
    variant: "danger" as const,
    summary: "Container crash, execution timeout, or budget limit reached.",
    detail:
      "Your code exceeded the execution timeout, memory bounds, or threw an unhandled environment error. Your token budget is preserved and retry is immediate.",
  },
];

const LIFECYCLE_STEPS = [
  {
    step: "01",
    name: "Push your code to origin main",
    detail:
      "Commit your completed unit solution and push to your GitHub repository on the main branch. Ensure all required files and tests are staged.",
    code: "git checkout main\ngit add .\ngit commit -m 'feat: complete unit deliverable'\ngit push origin main",
  },
  {
    step: "02",
    name: "Webhook Intake & Commit SHA Locking",
    detail:
      "GitHub delivers an intake webhook to Keel. The grading core verifies your student signature and records the exact immutable commit SHA.",
    code: 'POST /api/intake/github-webhook\n{\n  "ref": "refs/heads/main",\n  "after": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",\n  "repository": { "name": "keel-3.2.1-extraction" }\n}',
  },
  {
    step: "03",
    name: "Layer 1: Deterministic Sandbox Execution",
    detail:
      "Your repository is cloned into a clean, zero-network Docker container. Unit test suites and adversarial checks execute against your code.",
    code: "# Clean container execution\npytest -v tests/test_extract_claims.py\n# Exit code: 0 | Execution wall time: 1.42s",
  },
  {
    step: "04",
    name: "Layer 2 & 3: Rubric Judge & Defend Formulation",
    detail:
      "The calibrated LLM-as-judge inspects your implementation against production rubric criteria, citing exact line numbers and drafting author questions.",
    code: '{\n  "criterion": "schema-constrained-generation",\n  "verdict": "pass",\n  "evidence": "class ExtractionOutput(BaseModel):\\n    claims: list[Claim]"\n}',
  },
];

const TROUBLESHOOTING_GUIDE = [
  {
    title: "Pushed to a feature branch instead of main",
    cause: "The webhook listener only triggers automated grading on pushes to 'refs/heads/main'.",
    fix: "Merge your changes into main and push: `git checkout main && git merge feature-branch && git push origin main`",
  },
  {
    title: "Untracked or gitignored files missing from repository",
    cause: "Clean runner containers clone only what is committed to remote git. Uncommitted local files will cause missing module errors.",
    fix: "Run `git status` locally. Verify that all required source files and test fixtures are tracked in version control.",
  },
  {
    title: "Repository naming mismatch",
    cause: "The repository name must match the unit slug pattern registered in your learner cockpit.",
    fix: "Verify your repo name matches `keel-{unitId}-{suffix}` (e.g. `keel-3.2.1-claims-extraction`).",
  },
  {
    title: "Inference token budget exhausted",
    cause: "Each enrolled unit provisions an isolated token budget for LLM evaluation and practice attempts.",
    fix: "Inspect your token consumption in the Cockpit ledger (`/me`). Request a reset or wait for quota renewal if testing repeatedly.",
  },
];

export default function SubmitPage() {
  const units = listUnits();
  const first = units[0];
  const unitId = first ? first.id : "3.2.1";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <header className="space-y-3 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <Link href="/me" className="hover:text-zinc-300 transition-colors">
            COCKPIT
          </Link>
          <span>/</span>
          <span className="text-zinc-200">SUBMISSION PROTOCOL</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Git Submission Protocol & Verification Pipeline
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          How to push deliverables to GitHub, trigger automated webhook intake, inspect Layer 1–3 verification verdicts, and troubleshoot runner errors.
        </p>
      </header>

      {/* Quick Reference Repo Target */}
      <Card className="border-zinc-800 bg-zinc-950 shadow-md">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-zinc-100">
              Repository Naming Contract
            </CardTitle>
            <Badge variant="info" className="font-mono text-xs">
              Intake Pattern
            </Badge>
          </div>
          <CardDescription className="text-xs text-zinc-400">
            Each deliverable lives in a dedicated GitHub repository linked to your student account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="rounded border border-zinc-800 bg-zinc-900/80 p-4 font-mono text-sm text-emerald-400">
            <code>https://github.com/your-username/keel-{unitId}-your-suffix</code>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            When you push to <code className="text-zinc-300 font-mono">origin main</code>, GitHub fires an authenticated webhook. The runner clones the repository, checks the locked commit SHA, and writes an auditable verdict.
          </p>
        </CardContent>
      </Card>

      {/* Step-by-Step Lifecycle */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            Pipeline Execution Lifecycle
          </h2>
          <p className="text-xs text-zinc-400">
            What happens from the moment you run `git push` to the final verdict ledger entry.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {LIFECYCLE_STEPS.map((step) => (
            <Card key={step.step} className="border-zinc-800 bg-zinc-950/80">
              <CardHeader className="border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-zinc-300">
                    {step.step}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-zinc-200">
                      {step.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {step.detail}
                </p>
                <div className="rounded border border-zinc-800/90 bg-zinc-900/90 p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
                  <pre><code>{step.code}</code></pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Status Taxonomy */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            Submission Status Taxonomy
          </h2>
          <p className="text-xs text-zinc-400">
            Understanding the states of a submission in the real-time telemetry HUD.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATUS_TAXONOMY.map((item) => (
            <div
              key={item.status}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Badge variant={item.variant} className="font-mono text-xs font-bold">
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-zinc-200">{item.summary}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diagnostics & Troubleshooting */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            Diagnostic & Troubleshooting Guide
          </h2>
          <p className="text-xs text-zinc-400">
            Common reasons a push does not trigger grading or results in a runner execution failure.
          </p>
        </div>

        <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/80">
          {TROUBLESHOOTING_GUIDE.map((diag, idx) => (
            <div key={idx} className="p-5 space-y-2">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <span className="text-rose-400 font-mono text-xs">!</span>
                {diag.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300">Root Cause:</strong> {diag.cause}
              </p>
              <p className="text-xs text-zinc-300 bg-zinc-900/80 border border-zinc-800/80 rounded p-2.5 font-mono">
                <span className="text-emerald-400 font-semibold">Resolution: </span>
                {diag.fix}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Actions */}
      <footer className="border-t border-zinc-800 pt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-zinc-500 font-mono">
          Ready to inspect past submissions or verify active deliverables?
        </div>
        <div className="flex items-center gap-3">
          <Button href="/me" variant="primary" size="md">
            Open Cockpit
          </Button>
          <Button href="/curriculum" variant="outline" size="md">
            View Curriculum
          </Button>
        </div>
      </footer>
    </div>
  );
}
