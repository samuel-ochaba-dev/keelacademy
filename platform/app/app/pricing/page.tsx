import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { IconCheckCircle, IconArrowRight, IconAward, IconClock } from "@/components/icons";

export const metadata: Metadata = {
  title: "Pricing & The Completion Rebate",
  description:
    "One-time pricing with no subscription traps, and a 30% completion rebate that returns cash as you clear major integration gates.",
};

const COMMITMENT_FACTS = [
  "700 to 950 hours of deep engineering. At 12 to 15 hours a week, that is 9 to 15 months of steady work.",
  "No video playlists. Lessons are concise written technical specifications, and you build from them.",
  "No human TAs or hand-holding mentors. Feedback is instant, automated, sandboxed, and auditable.",
  "The graduation bar is shipped, defended code, not seat time or video completion percentages.",
  "We do not promise you instant client riches. We guarantee you graduate with verified production systems.",
];

const TIERS = [
  {
    name: "Self-Guided",
    badge: "Most enrolled",
    price: "$1,950",
    cadence: "one-time payment, no subscription",
    intro: "The full curriculum and the complete automated four-layer verification engine.",
    features: [
      "All 13 phases and 150+ units as they ship",
      "Unit 3.2.1 available immediately with live grading",
      "Layer 1 Docker sandbox checks on every git push",
      "Layer 2 calibrated rubric judge with quoted evidence",
      "Layer 3 defend-your-work code interrogation interviews",
      "Layer 4 unscripted capstone video defense",
      "Your own seeded Meridian synthetic data variant",
      "Eligible for the full 30% completion rebate ($585 back)",
      "Permanent Delivery-Ready credential upon graduation",
    ],
    popular: true,
    cta: "Start with Self-Guided",
  },
  {
    name: "Cohort+",
    badge: "Community & pods",
    price: "$2,450",
    cadence: "one-time payment, no subscription",
    intro: "Everything in Self-Guided, plus peer accountability and structured review pods.",
    features: [
      "Everything included in Self-Guided",
      "Weekly start-pod matching with 6 to 10 peers",
      "Required weekly async build logs and milestone check-ins",
      "Structured peer-review rounds using official rubrics",
      "Public build gallery access to showcase live systems",
      "Priority concierge triage and expanded token budget",
      "Eligible for the full 30% completion rebate ($735 back)",
    ],
    popular: false,
    cta: "Join the next cohort pod",
  },
];

const REBATE_MILESTONES = [
  {
    gate: "Phase 5 integration gate",
    rebate: "15% of your enrollment fee",
    selfGuided: "$292.50 refund",
    cohortPlus: "$367.50 refund",
    window: "365 days from enrollment",
    trigger: "Verified passage of the tool-using multi-agent claims orchestrator",
  },
  {
    gate: "Final capstone gate",
    rebate: "15% of your enrollment fee",
    selfGuided: "$292.50 refund",
    cohortPlus: "$367.50 refund",
    window: "365 days from enrollment",
    trigger: "Verified end-to-end Meridian system plus recorded walkthrough and defend defense",
  },
];

export default function PricingPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div>
      {/* Header */}
      <section className="border-b border-line">
        <div className="shell pt-16 pb-14 sm:pt-20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Pay once. Earn 30% back by finishing.
          </h1>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-2 sm:text-lg">
            No recurring monthly subscriptions. Subscriptions quietly incentivize schools to keep
            you enrolled as long as possible. We reward you for completing the work.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="shell section">
        <div className="grid gap-6 lg:grid-cols-2">
          {TIERS.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.08}>
              <div
                className={`panel flex h-full flex-col p-8 ${
                  tier.popular ? "border-accent/40 shadow-[0_0_60px_-24px_rgba(45,212,191,0.35)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-ink">{tier.name}</h2>
                    <p className="mt-1.5 max-w-[40ch] text-sm leading-relaxed text-ink-2">
                      {tier.intro}
                    </p>
                  </div>
                  <span className={tier.popular ? "chip-accent shrink-0" : "chip shrink-0"}>
                    {tier.badge}
                  </span>
                </div>

                <div className="mt-7 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-ink">{tier.price}</span>
                  <span className="font-mono text-xs text-ink-3">USD</span>
                </div>
                <p className="mt-1 font-mono text-xs text-ink-3">{tier.cadence}</p>

                <ul className="mt-7 flex-1 space-y-3 border-t border-line pt-7">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ink-2">
                      <IconCheckCircle size={15} className="mt-0.5 shrink-0 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {first ? (
                  <Link
                    href={`/units/${first.id}`}
                    className={`mt-8 w-full ${tier.popular ? "btn-primary" : "btn-ghost"} py-3`}
                  >
                    {tier.cta}
                    <IconArrowRight size={15} />
                  </Link>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Rebate mechanics */}
      <section className="border-t border-line bg-raised/30">
        <div className="shell section">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
                <IconAward size={19} />
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                How the 30% completion rebate works.
              </h2>
            </div>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              Standard courses offer refunds only when you are unhappy, which protects you from bad
              content but does nothing to prevent you from quitting. Keel rewards verified momentum.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {REBATE_MILESTONES.map((milestone, index) => (
              <Reveal key={milestone.gate} delay={index * 0.08}>
                <div className="panel h-full p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="chip-accent">{milestone.rebate}</span>
                    <span className="font-mono text-[11px] text-ink-3">{milestone.window}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                    {milestone.gate}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{milestone.trigger}</p>
                  <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
                    <div className="bg-inset px-4 py-3">
                      <p className="font-mono text-[10px] tracking-[0.1em] text-ink-3 uppercase">
                        Self-Guided
                      </p>
                      <p className="mt-1 font-mono text-sm text-ink">{milestone.selfGuided}</p>
                    </div>
                    <div className="bg-inset px-4 py-3">
                      <p className="font-mono text-[10px] tracking-[0.1em] text-ink-3 uppercase">
                        Cohort+
                      </p>
                      <p className="mt-1 font-mono text-sm text-ink">{milestone.cohortPlus}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <div className="panel space-y-4 p-7">
              <p className="text-sm leading-relaxed text-ink-2">
                <span className="font-semibold text-ink">Rebate mechanics:</span> your rebate is
                pledged at enrollment at the exact price you paid. When your git submission clears
                the gate rubric with verified verdicts, the ledger marks it earned and the refund is
                initiated to your original payment card via Stripe.
              </p>
              <p className="text-sm leading-relaxed text-ink-2">
                <span className="font-semibold text-ink">Withdrawal window:</span> if the text-first,
                self-driven format is not for you, request a 100% refund within 14 days of
                enrollment, before submitting your first graded deliverable.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Commitment screen */}
      <section id="commitment" className="border-t border-line">
        <div className="shell section">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg border border-line-strong bg-inset text-accent">
                <IconClock size={19} />
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                The commitment screen.
              </h2>
            </div>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-ink-2">
              Every student reads and affirms these five constraints before checking out. It is
              published here openly so you can self-select with full clarity.
            </p>
          </Reveal>

          <ol className="mt-10 divide-y divide-line border-y border-line">
            {COMMITMENT_FACTS.map((fact, index) => (
              <Reveal key={fact.slice(0, 24)} delay={Math.min(index * 0.04, 0.16)}>
                <li className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 py-5">
                  <span className="font-mono text-sm text-accent">{index + 1}</span>
                  <p className="text-sm leading-relaxed text-ink-2 sm:text-[15px]">{fact}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-8">
            <p className="max-w-[72ch] rounded-xl border border-accent/25 bg-accent-soft px-6 py-5 text-sm leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">Our sole guarantee:</span> if you complete
              the 13 phases, you leave with a verified, production-grade claims system, three
              cross-industry portfolio repositories, an auditable verification ledger, and a
              sendable proposal.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden border-t border-line">
        <div className="shell flex flex-col items-start justify-between gap-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Ready to verify your AI engineering?
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Unit 3.2.1 is available to start today with the complete grading loop.
            </p>
          </div>
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary px-5 py-3 text-[15px]">
              Start Unit {first.id}
              <IconArrowRight size={16} />
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
