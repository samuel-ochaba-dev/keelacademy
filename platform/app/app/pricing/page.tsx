import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { IconCheckCircle, IconArrowRight, IconAward, IconClock } from "@/components/icons";

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
    <div className="space-y-0">
      {/* Header */}
      <section className="border-b border-line bg-canvas pt-12 pb-10">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-amber">
            <span className="size-1.5 rounded-full bg-amber" />
            <span>TRANSPARENT TUITION & 30% REBATE CONSOLE</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Pay once. Earn 30% cash back by finishing.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            No recurring monthly subscriptions. Monthly fees quietly reward platforms for learner procrastination.
            We align incentives by refunding $585 to $735 in cash as you ship verified milestones on schedule.
          </p>
        </div>
      </section>

      {/* Tier Comparison Specification */}
      <section className="shell py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg border bg-raised overflow-hidden flex flex-col justify-between ${
                tier.popular ? "border-accent/40 shadow-xl" : "border-line"
              }`}
            >
              <div>
                {/* Tier header */}
                <div className="border-b border-line bg-inset p-6 flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-accent font-semibold uppercase">{tier.name}</span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-mono text-3xl font-bold text-ink tabular-nums">{tier.price}</span>
                      <span className="font-mono text-xs text-ink-3">USD (ONE-TIME)</span>
                    </div>
                    <p className="mt-2 text-xs text-ink-3">{tier.intro}</p>
                  </div>
                  {tier.badge ? (
                    <span className="rounded border border-accent/30 bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent uppercase">
                      {tier.badge}
                    </span>
                  ) : null}
                </div>

                {/* Features table */}
                <div className="p-6">
                  <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider">
                    SPECIFICATION BREAKDOWN
                  </span>
                  <ul className="mt-3 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-ink-2">
                        <IconCheckCircle size={13} className="mt-0.5 shrink-0 text-accent" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action button */}
              <div className="border-t border-line bg-inset/50 p-6">
                {first ? (
                  <Link
                    href={`/units/${first.id}`}
                    className={`w-full ${tier.popular ? "btn-primary" : "btn-ghost"}`}
                  >
                    <span>{tier.cta}</span>
                    <IconArrowRight size={13} />
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rebate Mechanics Table */}
      <section className="border-t border-line bg-raised/30 py-14">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-pass">
            <IconAward size={14} />
            <span>AUTOMATED 30% COMPLETION REBATE</span>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Cash back milestones and refund triggers.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
            Clear passing test runs and code defense gates within 365 days of enrollment, and your refund is
            automatically credited to your original payment method via Stripe.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {REBATE_MILESTONES.map((milestone) => (
              <div key={milestone.gate} className="rounded border border-line bg-raised p-5 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-pass font-semibold">{milestone.rebate}</span>
                  <span className="text-ink-4">{milestone.window}</span>
                </div>
                <h3 className="text-sm font-semibold text-ink">{milestone.gate}</h3>
                <p className="text-xs text-ink-3 leading-relaxed">{milestone.trigger}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line font-mono text-xs">
                  <div className="rounded bg-inset p-2">
                    <span className="block text-[10px] text-ink-4 uppercase">Self-Guided</span>
                    <span className="text-ink font-semibold">{milestone.selfGuided}</span>
                  </div>
                  <div className="rounded bg-inset p-2">
                    <span className="block text-[10px] text-ink-4 uppercase">Cohort+</span>
                    <span className="text-ink font-semibold">{milestone.cohortPlus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded border border-line bg-inset p-4 font-mono text-xs text-ink-3 space-y-1">
            <p><span className="text-ink font-semibold">14-DAY RISK-FREE GUARANTEE:</span> If our text-first engineering format isn&apos;t the right fit, request a 100% full refund within 14 days before submitting your first deliverable.</p>
          </div>
        </div>
      </section>

      {/* Commitment Protocol */}
      <section id="commitment" className="border-t border-line bg-canvas py-14">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-ink-3">
            <IconClock size={14} className="text-accent" />
            <span>LEARNER COMMITMENT PROTOCOL</span>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            The five expectations you agree to before enrolling.
          </h2>

          <div className="mt-8 divide-y divide-line border-y border-line">
            {COMMITMENT_FACTS.map((fact, index) => (
              <div key={fact.slice(0, 24)} className="grid grid-cols-[40px_1fr] items-baseline gap-4 py-4">
                <span className="font-mono text-xs font-semibold text-accent">0{index + 1}</span>
                <p className="text-xs leading-relaxed text-ink-2">{fact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line bg-raised/40 py-12">
        <div className="shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-ink">Ready to verify your AI engineering skills?</h2>
            <p className="text-xs text-ink-3">
              Unit 3.2.1 is available to start today with the complete grading loop.
            </p>
          </div>
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary">
              <span>Start Unit {first.id} [Live Workbench]</span>
              <IconArrowRight size={14} />
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
