import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Transparent Pricing & 30% Completion Rebate",
  description:
    "Pay once with no subscription traps. Earn 30% of your tuition back in cash as you hit verified milestones and finish on schedule.",
};

const COMMITMENT_FACTS = [
  "700 to 950 hours of deep, hands-on building. At 12 to 15 hours a week, expect 9 to 15 months of consistent progress.",
  "No video playlists to passively watch. Lessons are concise written technical specifications that you implement in code.",
  "Instant, objective feedback on every git push. No waiting days for human TAs to review your pull requests.",
  "You graduate based on shipped, defended code, not time spent browsing or video completion counters.",
  "No fake promises of overnight riches. We guarantee you graduate with a verified production portfolio you can defend.",
];

const TIERS = [
  {
    name: "Self-Guided",
    badge: "Most popular",
    price: "$1,950",
    cadence: "one-time payment, zero subscriptions",
    intro: "Complete access to all 13 phases, the real-world claims dataset, and the automated grading engine.",
    features: [
      "All 13 phases and 150+ units as they release",
      "Unit 3.2.1 ready to build and grade immediately",
      "Automated test environment checks on every git push",
      "Objective rubric grading with exact quotes from your code",
      "Defend-your-work code interrogation interviews",
      "Unscripted final capstone walkthrough defense",
      "Your own unique dataset variant (prevents answer-copying)",
      "Eligible for the full 30% completion rebate ($585 back)",
      "Permanent Delivery-Ready public credential upon graduation",
    ],
    popular: true,
    cta: "Start with Self-Guided",
  },
  {
    name: "Cohort+",
    badge: "Community & accountability",
    price: "$2,450",
    cadence: "one-time payment, zero subscriptions",
    intro: "Everything in Self-Guided, plus a dedicated peer pod and structured weekly momentum check-ins.",
    features: [
      "Everything included in Self-Guided",
      "Matched into a pod of 6 to 10 peers starting at the same time",
      "Weekly async build logs and milestones to keep you accountable",
      "Structured peer-review rounds using official production rubrics",
      "Access to the public build gallery to share your working systems",
      "Priority concierge response and expanded grading token budget",
      "Eligible for the full 30% completion rebate ($735 back)",
    ],
    popular: false,
    cta: "Join a Cohort Pod",
  },
];

const REBATE_MILESTONES = [
  {
    gate: "Phase 5 Integration Gate",
    rebate: "15% of your tuition refunded",
    selfGuided: "$292.50 cash back",
    cohortPlus: "$367.50 cash back",
    window: "365 days from enrollment",
    trigger: "Verified passage of the multi-agent claims triage orchestrator",
  },
  {
    gate: "Final Capstone Gate",
    rebate: "15% of your tuition refunded",
    selfGuided: "$292.50 cash back",
    cohortPlus: "$367.50 cash back",
    window: "365 days from enrollment",
    trigger: "Verified end-to-end Meridian system plus recorded walkthrough and code defense",
  },
];

export default function PricingPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div>
      {/* Header */}
      <section>
        <div>
          <div>
            
            <span>TRANSPARENT TUITION & 30% REBATE CONSOLE</span>
          </div>

          <h1>
            Pay once. Earn 30% cash back by finishing.
          </h1>

          <p>
            No recurring monthly subscriptions. Monthly fees quietly reward platforms for learner procrastination.
            We align incentives by refunding $585 to $735 in cash as you ship verified milestones on schedule.
          </p>
        </div>
      </section>

      {/* Tier Comparison Specification */}
      <section>
        <div>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
            >
              <div>
                {/* Tier header */}
                <div>
                  <div>
                    <span>{tier.name}</span>
                    <div>
                      <span>{tier.price}</span>
                      <span>USD (ONE-TIME)</span>
                    </div>
                    <p>{tier.intro}</p>
                  </div>
                  {tier.badge ? (
                    <span>
                      {tier.badge}
                    </span>
                  ) : null}
                </div>

                {/* Features table */}
                <div>
                  <span>
                    SPECIFICATION BREAKDOWN
                  </span>
                  <ul>
                    {tier.features.map((feature) => (
                      <li key={feature}>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action button */}
              <div>
                {first ? (
                  <Link
                    href={`/units/${first.id}`}
                  >
                    <span>{tier.cta}</span>
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rebate Mechanics Table */}
      <section>
        <div>
          <div>
            <span>AUTOMATED 30% COMPLETION REBATE</span>
          </div>

          <h2>
            Cash back milestones and refund triggers.
          </h2>

          <p>
            Clear passing test runs and code defense gates within 365 days of enrollment, and your refund is
            automatically credited to your original payment method via Stripe.
          </p>

          <div>
            {REBATE_MILESTONES.map((milestone) => (
              <div key={milestone.gate}>
                <div>
                  <span>{milestone.rebate}</span>
                  <span>{milestone.window}</span>
                </div>
                <h3>{milestone.gate}</h3>
                <p>{milestone.trigger}</p>
                <div>
                  <div>
                    <span>Self-Guided</span>
                    <span>{milestone.selfGuided}</span>
                  </div>
                  <div>
                    <span>Cohort+</span>
                    <span>{milestone.cohortPlus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p><span>14-DAY RISK-FREE GUARANTEE:</span> If our text-first engineering format isn&apos;t the right fit, request a 100% full refund within 14 days before submitting your first deliverable.</p>
          </div>
        </div>
      </section>

      {/* Commitment Protocol */}
      <section id="commitment">
        <div>
          <div>
            <span>LEARNER COMMITMENT PROTOCOL</span>
          </div>

          <h2>
            The five expectations you agree to before enrolling.
          </h2>

          <div>
            {COMMITMENT_FACTS.map((fact, index) => (
              <div key={fact.slice(0, 24)}>
                <span>0{index + 1}</span>
                <p>{fact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section>
        <div>
          <div>
            <h2>Ready to verify your AI engineering skills?</h2>
            <p>
              Unit 3.2.1 is available to start today with the complete grading loop.
            </p>
          </div>
          {first ? (
            <Link href={`/units/${first.id}`}>
              <span>Start Unit {first.id} [Live Workbench]</span>
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
