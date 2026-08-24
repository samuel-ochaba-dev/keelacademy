import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { IconGitBranch, IconArrowRight } from "@/components/icons";

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
    summary: "Submission received and queued for container allocation.",
    detail:
      "Your commit SHA and unit manifest are validated. An ephemeral Docker sandbox runner is being provisioned.",
  },
  {
    status: "GRADING",
    tone: "chip-accent",
    summary: "Sandbox execution and rubric judgment in flight.",
    detail:
      "Layer 1 pytest checks are executing in the container, followed by Layer 2 LLM-as-judge rubric scoring with quoted evidence.",
  },
  {
    status: "GRADED",
    tone: "chip-pass",
    summary: "Evaluation complete with an auditable verdict.",
    detail:
      "Pass or fail recorded with individual check results, judge reasoning, quoted code references, and ledger updates.",
  },
  {
    status: "ERROR",
    tone: "chip-fail",
    summary: "Pipeline execution failure or environment crash.",
    detail:
      "Container exceeded timeout limits (120s), memory bounds, or crashed during dependency installation. Free retry available.",
  },
];

const LIFECYCLE_STEPS = [
  {
    name: "Git push to main",
    detail: "Push your working code to your linked GitHub repository on the main branch.",
    code: "git add .\ngit commit -m 'feat: complete unit 3.2.1 claim extractor'\ngit push origin main",
  },
  {
    name: "Intake webhook and commit pinning",
    detail:
      "The Keel ingestion service receives the webhook, verifies the HMAC signature, and pins the commit SHA to prevent race conditions.",
    code: "keel: received push for commit 8f9b2d1 on unit 3.2.1",
  },
  {
    name: "Layer 1 isolated sandbox execution",
    detail:
      "Your repository is cloned into a hardened container. Deterministic pytest suites run against the seeded Meridian test corpus.",
    code: "pytest -v --tb=short tests/test_unit_3_2_1.py\n# 8 passed in 2.34s",
  },
  {
    name: "Layer 2 calibrated rubric scoring",
    detail:
      "The calibrated judge model evaluates your implementation against versioned rubric criteria and attaches quoted code lines as proof.",
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
      <section className="border-b border-line">
        <div className="shell pt-16 pb-14 sm:pt-20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            How to push and verify your work.
          </h1>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-2 sm:text-lg">
            No web forms or zip uploads. You push to git, your code runs in an isolated sandbox, and
            an auditable rubric verdict is returned in seconds.
          </p>
        </div>
      </section>

      {/* Repository contract */}
      <section className="shell py-14">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                Repository naming and contract
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                Each unit deliverable lives in a separate GitHub repository named with your unit ID
                and an optional project suffix:
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                Your repository must include the entrypoint specified in the unit&apos;s build
                contract. For Unit 3.2.1, the sandbox looks for <code>extract_claims.py</code>{" "}
                exposing the <code>extract_claim(text: str) =&gt; ClaimExtraction</code> function.
              </p>
              {first ? (
                <Link href={`/units/${first.id}#build`} className="link-arrow mt-5">
                  Inspect the Unit {first.id} contract
                  <IconArrowRight size={13} />
                </Link>
              ) : null}
            </div>
            <div className="panel flex flex-col justify-center gap-4 p-8">
              <div className="flex items-center gap-2 font-mono text-xs text-ink-3">
                <IconGitBranch size={15} />
                REPO NAME PATTERN
              </div>
              <code className="block overflow-x-auto rounded-lg border border-accent/30 bg-inset px-4 py-3.5 font-mono text-sm text-accent-strong">
                keel-{unitId}-claims-extractor
              </code>
              <p className="text-[13px] leading-relaxed text-ink-3">
                Push your repository to GitHub. The intake router resolves unit ID {unitId} from the
                repository name automatically.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Lifecycle */}
      <section className="border-t border-line bg-raised/30">
        <div className="shell section">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              The four-stage grading lifecycle.
            </h2>
          </Reveal>

          <div className="relative mt-12">
            <div className="absolute top-2 bottom-2 left-[13px] w-px bg-line" aria-hidden />
            <ol className="space-y-8">
              {LIFECYCLE_STEPS.map((step, index) => (
                <Reveal key={step.name} delay={Math.min(index * 0.06, 0.2)}>
                  <li className="relative grid gap-4 pl-10 md:grid-cols-[240px_1fr] md:gap-8">
                    <span
                      className="absolute top-1 left-0 grid size-7 place-items-center rounded-full border border-line-strong bg-raised font-mono text-[11px] text-accent"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-ink">{step.name}</h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{step.detail}</p>
                    </div>
                    <pre className="code-block self-start text-xs">
                      <code>{step.code}</code>
                    </pre>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Status taxonomy */}
      <section className="border-t border-line">
        <div className="shell section">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Submission status dictionary.
            </h2>
          </Reveal>

          <Reveal className="mt-10">
            <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
              {STATUS_TAXONOMY.map((item) => (
                <div key={item.status} className="bg-raised p-6">
                  <span className={item.tone}>{item.status}</span>
                  <p className="mt-3 text-sm font-medium text-ink">{item.summary}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{item.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Dashboard link */}
      <section className="border-t border-line bg-raised/30">
        <div className="shell flex flex-col items-start justify-between gap-5 py-12 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              Link your GitHub account and inspect verdicts
            </h3>
            <p className="mt-1.5 text-sm text-ink-2">
              Your learner dashboard tracks your active student ID, enrolled units, and verification
              ledger.
            </p>
          </div>
          <Link href="/me" className="btn-ghost shrink-0">
            Open dashboard
            <IconArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
