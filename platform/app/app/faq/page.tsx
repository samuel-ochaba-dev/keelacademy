import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Plain answers about Keel Academy: who it is for, who it is not for, how grading works, pricing, refunds, and what you do not get.",
};

type Faq = { q: string; a: string[] };

const FAQ_GROUPS: { title: string; faqs: Faq[] }[] = [
  {
    title: "Fit",
    faqs: [
      {
        q: "Is this course right for me?",
        a: [
          "It is a good fit if you can already write some code, you have shipped demos that fell apart under real questions, and you want the engineering disciplines (evaluation, retrieval, cost, security) that separate a demo from a system. It is also a fit if you are earlier in the journey but genuinely willing to spend 700 to 950 hours building.",
          "It is probably not for you if you learn best by watching video, if you want a six-week transformation, or if you need a person checking in to keep going. Pods and digests help. Nothing here drags you.",
        ],
      },
      {
        q: "How much experience do I need to start?",
        a: [
          "The starting assumption is that you can use a computer comfortably, install software, and use a terminal. Phase 1 teaches the engineering foundations from there. If you already program, a 20-minute placement diagnostic skips you past the basics so you are not paying to be bored.",
        ],
      },
      {
        q: "I already build with LLM APIs at work. Will I learn anything?",
        a: [
          "If you can already build a golden dataset, calibrate an LLM judge against human grades, model token costs for a CFO, and defend your system against prompt injection, then no, and you should not enroll. If any of those made you pause, that pause is the course.",
        ],
      },
    ],
  },
  {
    title: "How it works",
    faqs: [
      {
        q: "Is this self-paced or a cohort?",
        a: [
          "Self-paced, by design. There are no lectures to attend and no cohort calendar to keep up with. The Cohort+ tier adds pod matching and the gallery, but the pacing is always yours. The only deadlines in the whole program are the two rebate windows, and they exist to put a little useful pressure on you.",
        ],
      },
      {
        q: "How is this different from other AI courses?",
        a: [
          "Three ways. One project: everything you build serves a single running system, so nothing is a throwaway exercise. Real grading: your work is checked by sandboxed tests, a rubric judge calibrated against human grades, and a defend-your-work interview, not a multiple-choice quiz. And honesty about format: no videos, no live classes, no certificate, and a public page listing exactly where the school falls short today.",
        ],
      },
      {
        q: "How do I get help when I am stuck?",
        a: [
          "Three mechanisms, none of which involve waiting for a human. Every unit has an unstuck panel listing the specific ways it usually breaks, written from real student failures. A concierge grounded in the curriculum answers questions at 2am. And the worked example for each unit is annotated with the why behind every decision, which resolves most 'why would you do it this way' moments before they become blockers.",
        ],
      },
      {
        q: "Can I cheat with AI? It is an AI course, after all.",
        a: [
          "You can try, and the course expects you to. Layer 3 exists for exactly this: at gate units you answer questions about the decisions in your submission, and pasted work tends to fall apart there. On top of that, your Meridian data variant is seeded from your student id, so an answer key from another student fails on your data. Using AI well is part of the job; outsourcing the understanding is what gets caught.",
        ],
      },
    ],
  },
  {
    title: "Content and currency",
    faqs: [
      {
        q: "Is the curriculum up to date?",
        a: [
          "Every lesson is written in three layers: the concept core, which changes slowly; the applied context; and the tool specifics, which are isolated and re-audited on a quarterly schedule, because the AI stack moves and most courses rot quietly. What we do not cover: we pick one current stack and teach it deeply rather than surveying every framework, and anything that cannot survive contact with a real deliverable does not get a unit.",
        ],
      },
      {
        q: "How much of the curriculum actually exists today?",
        a: [
          "One unit. 3.2.1, structured outputs, is live with the full grading pipeline behind it. The other twelve phases are a published, fully specified plan being built phase by phase. We tell you this on the pricing page, the landing page, and here, because a school selling verified honesty cannot start by overselling itself.",
        ],
      },
    ],
  },
  {
    title: "Money",
    faqs: [
      {
        q: "What does it cost?",
        a: [
          "One-time pricing, no subscription. The architecture targets $1,500 to $2,500 for the full program, well below bootcamp pricing because there is no teaching staff, and well above a video course because the verification is real work. The pricing page has the current state, including what is actually open for enrollment today.",
          "[NEED: final launch prices for Self-Guided and Cohort+ tiers, and installment options if any]",
        ],
      },
      {
        q: "What is the refund policy?",
        a: [
          "The completion rebate is real and wired: 15% back when you clear the Phase 5 integration gate, 15% at the capstone, each inside a 365-day window, earned automatically on verified gate passage. When you earn one, a person issues the refund through Stripe within a few days; the platform keeps the ledger but never moves money itself.",
          "[NEED: refund window for students who withdraw early, before any gate]",
        ],
      },
      {
        q: "Is there a team or company license?",
        a: [
          "[NEED: team pricing policy, or a plain no]",
        ],
      },
    ],
  },
  {
    title: "What you do not get",
    faqs: [
      {
        q: "Do I get a certificate?",
        a: [
          "No. The credential is the verified work: the repos, the verdicts, the recorded walkthroughs, and a Delivery-Ready mark that exists only because your work passed tests, rubric grading, and a defense. If you need a PDF for a wall or a LinkedIn badge, this school will disappoint you on purpose.",
        ],
      },
      {
        q: "Will you guarantee me a job or clients?",
        a: [
          "No, and distrust anyone who does. What the school guarantees is narrower: if you finish, your work is real, it was verified independently of you, and you leave with a priced, sendable proposal and one real outreach email already sent. That is as close to a client pipeline as honesty allows.",
        ],
      },
      {
        q: "What is the biggest weakness of this program?",
        a: [
          "Honest answer: it is young and thin. One unit is live. There are no alumni yet, no testimonials, no placement statistics, and this FAQ cannot quote a single graduate because none exist. The betting case for enrolling now is that you get founding-cohort attention and pricing. The case for waiting is that the school will be more proven later. Both are rational, and you should pick with open eyes.",
        ],
      },
    ],
  },
];

export default function FaqPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <p className="eyebrow">FAQ</p>
      <h1 className="font-display mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
        Plain answers, including the unflattering ones.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
        If your question is not here, the honest default applies: assume the
        unglamorous answer is the true one, because it usually is.
      </p>

      <div className="mt-14 space-y-14">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="eyebrow">{group.title}</h2>
            <dl className="mt-6 space-y-8">
              {group.faqs.map((faq) => (
                <div key={faq.q} className="reveal border-b border-line pb-8">
                  <dt className="font-display text-xl font-semibold">{faq.q}</dt>
                  <dd className="mt-3 max-w-3xl space-y-3 leading-relaxed text-ink-soft">
                    {faq.a.map((para) => (
                      <p key={para.slice(0, 32)}>
                        {para.startsWith("[NEED:") ? (
                          <span className="need">{para}</span>
                        ) : (
                          para
                        )}
                      </p>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-2xl font-semibold">
          Still here? That is the filter working.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          The people this school works for read the fine print and keep going.
          If that is you, Unit 3.2.1 is the cheapest way to find out whether the
          loop works on you the way it should.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          {first ? (
            <Link href={`/units/${first.id}`} className="btn-primary">
              Start Unit {first.id}
            </Link>
          ) : null}
          <Link href="/pricing" className="btn-secondary">
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
