import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One-time pricing, no subscription, and a completion rebate that hands money back when you clear the big gates. Plus the commitment screen every student reads before paying.",
};

const COMMITMENT_FACTS = [
  "700 to 950 hours of work. At 12 to 15 hours a week, that is 9 to 15 months.",
  "No videos. Lessons are written, and you read them.",
  "No live instructor and no TA. Help is written worked examples, an always-on concierge, and the unstuck panels.",
  "The finish bar is shipped, defended work, not seat time.",
  "We cannot guarantee you clients. Nobody honestly can.",
];

const COMMITMENT_PROMISE =
  "What we do guarantee: if you finish, you leave with a verified, working, governed system and a sendable proposal, and every gate in between was checked by something that does not know you.";

const TIERS = [
  {
    name: "Self-Guided",
    price: "[NEED: final launch price for Self-Guided]",
    intro: "The full program and the full verification stack.",
    items: [
      "Every unit as it ships, starting with 3.2.1",
      "All four grading layers on every deliverable",
      "Your own seeded Meridian data variant",
      "The full completion rebate (see below)",
      "The Delivery-Ready credential at the Section 14 bar",
    ],
  },
  {
    name: "Cohort+",
    price: "[NEED: final launch price for Cohort+]",
    intro: "Everything in Self-Guided, plus the people.",
    items: [
      "Pod matching: a small group moving through the same phases",
      "The gallery: your shipped work, visible to the cohort",
      "Priority concierge responses",
      "Weekly digest with what your pod shipped",
    ],
  },
];

const REBATE_ROWS = [
  {
    gate: "Phase 5 integration gate",
    amount: "15% of your enrollment price",
    window: "Within 365 days of the pledge",
  },
  {
    gate: "Capstone gate",
    amount: "15% of your enrollment price",
    window: "Within 365 days of the pledge",
  },
];

export default function PricingPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <p className="eyebrow">Pricing</p>
      <h1 className="font-display mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
        Pay once. Get some of it back by finishing.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
        One-time pricing, no subscription. A subscription would quietly reward the
        school for you not finishing, which is the wrong incentive for a place
        whose whole job is getting you to the end.
      </p>

      {/* Commitment screen, verbatim in spirit from school-architecture.md */}
      <section className="card mt-12">
        <p className="eyebrow">Read this before you pay</p>
        <h2 className="font-display mt-3 text-2xl font-semibold">
          The commitment screen
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Every student reads this before checkout. It is here on the public page
          too, because it should cost you nothing to find out.
        </p>
        <ul className="mt-5 space-y-3">
          {COMMITMENT_FACTS.map((fact) => (
            <li key={fact.slice(0, 24)} className="flex gap-3 leading-relaxed">
              <span aria-hidden className="mt-1 text-mark">•</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-line pt-5 leading-relaxed">
          {COMMITMENT_PROMISE}
        </p>
      </section>

      {/* Tiers */}
      <section className="mt-16">
        <div className="grid gap-6 md:grid-cols-2">
          {TIERS.map((tier) => (
            <div key={tier.name} className="card flex flex-col">
              <h2 className="font-display text-2xl font-semibold">{tier.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{tier.intro}</p>
              <p className="mt-4 font-display text-xl font-semibold">
                <span className="need">{tier.price}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm leading-relaxed text-ink-soft">
                {tier.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-0.5 text-school">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
          There is deliberately no tier that buys human review. The design bet of
          the whole school is that the verification stack is sufficient on its own;
          selling a human on top would concede it isn&apos;t. The price sits well
          below bootcamp pricing because there is no teaching staff to feed, and
          well above a video course because the verification is real work.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed">
          <span className="need">[NEED: installment options, if any, and the refund window for students who withdraw early]</span>
        </p>
      </section>

      <hr className="my-16" />

      {/* Rebate mechanics */}
      <section>
        <p className="eyebrow">The completion rebate</p>
        <h2 className="font-display mt-4 text-3xl font-semibold">
          Money back, but only for work.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          Most courses offer a refund if you are unhappy. That protects you from a
          bad course. It does nothing about the bigger risk, which is that you
          quietly stop doing it. Keel&apos;s rebate works the other way: money comes
          back when you clear the two hardest gates, on verified work, inside a
          real deadline.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Gate</th>
                <th>Rebate</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {REBATE_ROWS.map((row) => (
                <tr key={row.gate}>
                  <td className="font-medium">{row.gate}</td>
                  <td>{row.amount}</td>
                  <td className="text-ink-soft">{row.window}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-ink-soft">
          <p>
            The mechanics, exactly as the system runs them: the rebate is pledged
            when you enroll, at the price you paid, so a later price change never
            touches your promise. It is earned automatically when a verified gate
            verdict lands, and it expires if the window closes without one. Your
            rebate ledger, including any deadline, is visible on your progress
            page from day one.
          </p>
          <p>
            One honest wrinkle: the platform never moves money itself. When you
            earn a rebate, a person issues the refund through Stripe within a few
            days, and the ledger shows the status the whole way, from pledged to
            earned to paid. We would rather you know a human presses the button
            than pretend otherwise.
          </p>
          <p>
            Both rebates together return 30% of your enrollment price. The school
            still profits if you finish. It just profits more if you don&apos;t,
            which is exactly backwards from a subscription, and exactly the point.
          </p>
        </div>
      </section>

      <hr className="my-16" />

      {/* What enrollment looks like today */}
      <section>
        <p className="eyebrow">Today&apos;s honest version</p>
        <h2 className="font-display mt-4 text-3xl font-semibold">
          What you can enroll in right now
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          {first
            ? `Unit ${first.id} is open for enrollment today, individually priced, with the full grading pipeline behind it. Full-program enrollment opens as phases ship. Pricing above reflects the program as designed; the architecture targets the $1,500 to $2,500 one-time range for the full program, final numbers pending.`
            : "Enrollment is being wired up right now. Check back shortly."}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary">
              Start Unit {first.id}
            </Link>
          ) : null}
          <Link href="/faq" className="btn-secondary">
            Read the FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
