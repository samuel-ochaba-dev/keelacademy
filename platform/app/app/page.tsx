import Link from "next/link";
import { listUnits, loadUnit } from "@/lib/content";
import { HeroInspection } from "@/components/hero-inspection";

export const dynamic = "force-dynamic";

const PAIN_POINTS = [
  {
    title: "[Pain Point 1 Title Placeholder]",
    body: "[Pain Point 1 Description: Details on common failure modes or struggles in development.]",
  },
  {
    title: "[Pain Point 2 Title Placeholder]",
    body: "[Pain Point 2 Description: Details on lack of feedback or validation gaps.]",
  },
  {
    title: "[Pain Point 3 Title Placeholder]",
    body: "[Pain Point 3 Description: Details on debugging challenges or edge cases.]",
  },
];

const UNIT_STEPS = [
  {
    num: "01",
    name: "[Step 1 Name]",
    tag: "[Step 1 Tag]",
    body: "[Step 1 Description: Overview of the conceptual and practical lesson content.]",
  },
  {
    num: "02",
    name: "[Step 2 Name]",
    tag: "[Step 2 Tag]",
    body: "[Step 2 Description: Overview of worked examples and practice exercises.]",
  },
  {
    num: "03",
    name: "[Step 3 Name]",
    tag: "[Step 3 Tag]",
    body: "[Step 3 Description: Overview of repository deliverables and published contracts.]",
  },
  {
    num: "04",
    name: "[Step 4 Name]",
    tag: "[Step 4 Tag]",
    body: "[Step 4 Description: Overview of automated test suites and rubric grading.]",
  },
  {
    num: "05",
    name: "[Step 5 Name]",
    tag: "[Step 5 Tag]",
    body: "[Step 5 Description: Overview of troubleshooting guides and FAQs.]",
  },
];

const VERIFICATION_LAYERS = [
  {
    layer: "[Layer 1 Name]",
    name: "[Layer 1 Title Placeholder]",
    detail: "[Layer 1 Scope / Timing]",
    body: "[Layer 1 Description: Automated sandbox execution and test assertions.]",
  },
  {
    layer: "[Layer 2 Name]",
    name: "[Layer 2 Title Placeholder]",
    detail: "[Layer 2 Scope / Timing]",
    body: "[Layer 2 Description: Rubric evaluation with quoted code evidence.]",
  },
  {
    layer: "[Layer 3 Name]",
    name: "[Layer 3 Title Placeholder]",
    detail: "[Layer 3 Scope / Timing]",
    body: "[Layer 3 Description: Code interrogation and defense verification.]",
  },
  {
    layer: "[Layer 4 Name]",
    name: "[Layer 4 Title Placeholder]",
    detail: "[Layer 4 Scope / Timing]",
    body: "[Layer 4 Description: Milestone video walkthrough and defense.]",
  },
];

const PHASES = [
  { id: "0-1", title: "[Phases 0-1 Title Placeholder]", focus: "[Phases 0-1 Focus Areas Placeholder]" },
  { id: "2-3", title: "[Phases 2-3 Title Placeholder]", focus: "[Phases 2-3 Focus Areas Placeholder]" },
  { id: "4-5", title: "[Phases 4-5 Title Placeholder]", focus: "[Phases 4-5 Focus Areas Placeholder]" },
  { id: "6-7", title: "[Phases 6-7 Title Placeholder]", focus: "[Phases 6-7 Focus Areas Placeholder]" },
  { id: "8-9", title: "[Phases 8-9 Title Placeholder]", focus: "[Phases 8-9 Focus Areas Placeholder]" },
  { id: "10-11", title: "[Phases 10-11 Title Placeholder]", focus: "[Phases 10-11 Focus Areas Placeholder]" },
  { id: "12-13", title: "[Phases 12-13 Title Placeholder]", focus: "[Phases 12-13 Focus Areas Placeholder]" },
];

const FAQS = [
  {
    q: "[FAQ Question 1 Placeholder]?",
    a: "[FAQ Answer 1 Placeholder: Clear and concise answer to common learner questions.]",
  },
  {
    q: "[FAQ Question 2 Placeholder]?",
    a: "[FAQ Answer 2 Placeholder: Clear and concise answer to common learner questions.]",
  },
  {
    q: "[FAQ Question 3 Placeholder]?",
    a: "[FAQ Answer 3 Placeholder: Clear and concise answer to common learner questions.]",
  },
  {
    q: "[FAQ Question 4 Placeholder]?",
    a: "[FAQ Answer 4 Placeholder: Clear and concise answer to common learner questions.]",
  },
  {
    q: "[FAQ Question 5 Placeholder]?",
    a: "[FAQ Answer 5 Placeholder: Clear and concise answer to common learner questions.]",
  },
];

export default function LandingPage() {
  const units = listUnits();
  const first = units[0];
  const firstUnit = first ? loadUnit(first.id) : null;
  const checksCount = firstUnit?.checks?.length ?? 0;
  const criteriaCount = firstUnit?.rubric?.criteria.length ?? 0;

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section>
        <p>
          <strong>[Platform Category / Eyebrow Placeholder]</strong>
        </p>
        <h1>[Hero Main Headline Placeholder]</h1>
        <p>
          [Hero Subtitle Placeholder: Short descriptive overview of what the platform teaches and how.]
        </p>
        <p>
          {first ? (
            <Link href={`/units/${first.id}`}>
              [Primary CTA: Start Unit {first.id}]
            </Link>
          ) : null}
          {" | "}
          <a href="#curriculum">
            [Secondary CTA: Explore Syllabus]
          </a>
        </p>

        {firstUnit && (
          <div>
            <hr />
            <p>
              <strong>[Live Unit Banner: Unit {firstUnit.yaml.id}]</strong> ({firstUnit.yaml.est_hours} hours)
            </p>
            <p>{firstUnit.yaml.build.deliverable}</p>
            <p>
              {checksCount} sandbox checks · {criteriaCount} rubric criteria
            </p>
            <hr />
          </div>
        )}

        <div>
          <h3>[Interactive Preview / Demo Section]</h3>
          <HeroInspection />
        </div>
      </section>

      <hr />

      {/* 2. THE CORE STRUGGLE (Learner Pain) */}
      <section>
        <p>
          <strong>[Section Eyebrow Placeholder]</strong>
        </p>
        <h2>[Section 2 Headline Placeholder]</h2>
        <p>
          [Section 2 Description Placeholder: Brief context explaining the developer problem and learning gap.]
        </p>

        <div>
          {PAIN_POINTS.map((point) => (
            <div key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr />

      {/* 3. THE 5-STEP UNIT ENGINE */}
      <section id="how-it-works">
        <p>
          <strong>[Section Eyebrow Placeholder]</strong>
        </p>
        <h2>[Section 3 Headline: Learning Loop]</h2>
        <p>
          [Section 3 Description Placeholder: Explanation of the structured unit steps.]
        </p>

        <ol>
          {UNIT_STEPS.map((step) => (
            <li key={step.name}>
              <strong>{step.name}</strong> ({step.tag}): {step.body}
            </li>
          ))}
        </ol>
      </section>

      <hr />

      {/* 4. THE 4-LAYER VERIFICATION ENGINE */}
      <section id="verification">
        <p>
          <strong>[Section Eyebrow Placeholder]</strong>
        </p>
        <h2>[Section 4 Headline: Verification Engine]</h2>
        <p>
          [Section 4 Description Placeholder: Overview of how code submissions are graded and verified.]
        </p>

        <div>
          {VERIFICATION_LAYERS.map((v) => (
            <div key={v.name}>
              <h3>{v.layer}: {v.name}</h3>
              <p><em>{v.detail}</em></p>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <hr />

      {/* 5. THE 13-PHASE CURRICULUM BLUEPRINT */}
      <section id="curriculum">
        <p>
          <strong>[Section Eyebrow Placeholder]</strong>
        </p>
        <h2>[Section 5 Headline: Curriculum Roadmap]</h2>
        <p>
          [Section 5 Description Placeholder: Overview of the project phases and architecture scope.]
        </p>

        <table border={1}>
          <thead>
            <tr>
              <th>[Phase Column]</th>
              <th>[Topic Column]</th>
              <th>[Focus Column]</th>
            </tr>
          </thead>
          <tbody>
            {PHASES.map((phase) => (
              <tr key={phase.id}>
                <td>Phases {phase.id}</td>
                <td><strong>{phase.title}</strong></td>
                <td>{phase.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr />

      {/* 6. TRANSPARENCY & REBATE MODEL */}
      <section>
        <p>
          <strong>[Section Eyebrow Placeholder]</strong>
        </p>
        <h2>[Section 6 Headline: Pricing & Incentive Model]</h2>
        <p>
          [Section 6 Description Placeholder: Explanation of tuition, commitments, and completion rebates.]
        </p>

        <table border={1}>
          <thead>
            <tr>
              <th>[Milestone Column]</th>
              <th>[Rebate Column]</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>[Milestone 1 Placeholder]</td>
              <td>[Rebate 1 Percentage / Details]</td>
            </tr>
            <tr>
              <td>[Milestone 2 Placeholder]</td>
              <td>[Rebate 2 Percentage / Details]</td>
            </tr>
          </tbody>
        </table>
      </section>

      <hr />

      {/* 7. PLAIN SPOKEN FAQ */}
      <section>
        <p>
          <strong>[Section Eyebrow Placeholder]</strong>
        </p>
        <h2>[Section 7 Headline: Frequently Asked Questions]</h2>

        <dl>
          {FAQS.map((faq) => (
            <div key={faq.q}>
              <dt><strong>{faq.q}</strong></dt>
              <dd><p>{faq.a}</p></dd>
            </div>
          ))}
        </dl>
      </section>

      <hr />

      {/* 8. FINAL CTA */}
      <section>
        <h2>[Final CTA Headline Placeholder]</h2>
        <p>
          [Final CTA Description Placeholder: Call to action inviting learners to start.]
        </p>
        <p>
          {first ? (
            <Link href={`/units/${first.id}`}>
              [Primary CTA: Open Unit {first.id}]
            </Link>
          ) : null}
          {" | "}
          <Link href="/submit">
            [Secondary CTA: Submission Guide]
          </Link>
        </p>
      </section>
    </div>
  );
}
