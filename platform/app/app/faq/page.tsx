import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";
import { Reveal } from "@/components/reveal";
import { IconArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Plain answers about Keel Academy: student fit, automated grading mechanics, pricing, completion rebates, and what you do not get.",
};

type Faq = { q: string; a: string[] };

const FAQ_GROUPS: { title: string; faqs: Faq[] }[] = [
  {
    title: "Student fit & expectations",
    faqs: [
      {
        q: "Is Keel Academy right for me?",
        a: [
          "It is a strong fit if you already write code, have built weekend AI demos that broke under real questions, and want to master the engineering disciplines (evaluation, retrieval, cost controls, security) that separate a toy from a production system.",
          "It is not for you if you prefer passive video playlists, want a 6-week shortcut, or need a human instructor chasing your homework. Pods and digests provide structure, but nobody will drag you across the finish line.",
        ],
      },
      {
        q: "How much experience do I need before starting?",
        a: [
          "The starting baseline assumes comfortable computer literacy, package installation, and terminal familiarity. Phase 1 covers software engineering foundations from there. If you already program for a living, a 20-minute adaptive diagnostic allows you to place directly into Phase 2.",
        ],
      },
      {
        q: "I already call LLM APIs at work. Will I learn anything new?",
        a: [
          "If you can already construct representative golden evaluation sets, calibrate an LLM judge against human baselines, defend systems against indirect prompt injection, and present a token cost model to a CFO, then no, and you should not enroll. If any of those areas give you pause, that gap is the curriculum.",
        ],
      },
    ],
  },
  {
    title: "How grading & the platform work",
    faqs: [
      {
        q: "Is this self-paced or run as a live cohort?",
        a: [
          "Self-paced by design. There are no mandatory live lectures to attend. The Cohort+ tier adds peer pod matching and gallery access, but the pacing is entirely in your hands. The only milestones with deadlines are the 365-day rebate windows, which exist to provide constructive momentum.",
        ],
      },
      {
        q: "How is Keel different from other AI courses?",
        a: [
          "Three structural differences: one client system, so everything you build across 13 phases connects to a single real-world claims triage architecture; real four-layer grading, where your code is verified by sandboxed tests, calibrated rubric judges, and code interrogation interviews; and radical honesty, with no videos, no vanity certificates, and open documentation of platform limits.",
        ],
      },
      {
        q: "How do I get unblocked when I am stuck?",
        a: [
          "Three mechanisms operate without human delays: every unit page includes an Unstuck panel with common failure modes from real attempts; an always-on AI concierge grounded in the codebase answers architectural questions at 2am; and annotated worked examples explain the exact rationale behind parallel implementations.",
        ],
      },
      {
        q: "Can students game the grading system with AI?",
        a: [
          "You are expected to use AI tools, but Layer 3 prevents outsourcing understanding. Gate units require you to defend the specific architectural decisions in your code. Furthermore, your Meridian synthetic data variant is seeded from your student ID, so copying peer solutions fails on your test suite.",
        ],
      },
    ],
  },
  {
    title: "Content currency & roadmap",
    faqs: [
      {
        q: "How does the curriculum stay up to date as AI tools evolve?",
        a: [
          "Lessons are split into three layers: the concept core (drifts slowly), applied pipeline context, and fast-moving tool specifics. Tool-specific sections undergo scheduled quarterly audits to ensure syntax and SDK versions match current best practices.",
        ],
      },
      {
        q: "How much of the curriculum is live right now?",
        a: [
          "Unit 3.2.1 is live with full automated sandboxed grading today. The remaining twelve phases are a published, fully specified roadmap being built and released in sequence. We publish this openly so every student knows the current state before paying.",
        ],
      },
    ],
  },
  {
    title: "Pricing, rebates & refunds",
    faqs: [
      {
        q: "What does enrollment cost?",
        a: [
          "We charge a one-time fee with no monthly subscriptions: $1,950 for Self-Guided or $2,450 for Cohort+. Individual units like Unit 3.2.1 can also be enrolled individually during pilot batches.",
        ],
      },
      {
        q: "How does the 30% completion rebate work?",
        a: [
          "When you pass the Phase 5 integration gate within 365 days of enrollment, 15% of your tuition is automatically refunded. When you pass the final capstone defense within 365 days, another 15% is refunded. You earn back 30% total by shipping verified work on schedule.",
        ],
      },
      {
        q: "What is the refund policy if I withdraw early?",
        a: [
          "We offer a 14-day no-questions-asked refund window from enrollment, provided you have not yet submitted your first graded deliverable. If the text-first, self-driven format is not for you, you can exit cleanly.",
        ],
      },
      {
        q: "Do you offer team or enterprise licensing?",
        a: [
          "Yes. Engineering teams of 5 or more can license Keel with shared progress dashboards and private team pod channels. Contact support for team billing.",
        ],
      },
    ],
  },
  {
    title: "What you do not get",
    faqs: [
      {
        q: "Do I get a completion certificate PDF?",
        a: [
          "No. The credential is the verified work itself: git repositories, passing test suites, rubric evaluation logs, and recorded walkthroughs. A PDF saying you watched videos proves nothing to serious engineering employers.",
        ],
      },
      {
        q: "Do you guarantee jobs or client placements?",
        a: [
          "No, and you should distrust any program that does. What we guarantee is that if you finish, your work is production-grade, independently verified, and you graduate with a priced proposal and one real outreach email already sent.",
        ],
      },
      {
        q: "What is the biggest limitation of Keel Academy today?",
        a: [
          "Honest answer: the platform is young. Unit 3.2.1 is live, but the full 13-phase catalog is still shipping. Enrolling now gives you founding-cohort pricing and direct access to the team building the grading platform. Waiting means enrolling in a more mature catalog later. Both choices are rational.",
        ],
      },
    ],
  },
];

export default function FaqPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div>
      {/* Header */}
      <section className="border-b border-line">
        <div className="shell pt-16 pb-14 sm:pt-20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Plain answers, including the unflattering ones.
          </h1>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-2 sm:text-lg">
            If your question is not answered here, the honest default applies: assume the
            unglamorous answer is the true one, because it usually is.
          </p>
        </div>
      </section>

      {/* Groups */}
      <section className="shell section">
        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          {/* Group index */}
          <nav aria-label="FAQ groups" className="self-start lg:sticky lg:top-24">
            <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAQ_GROUPS.map((group) => (
                <li key={group.title}>
                  <a
                    href={`#${slug(group.title)}`}
                    className="block shrink-0 rounded-lg px-3 py-2 text-sm text-ink-3 transition-colors hover:bg-raised hover:text-ink lg:shrink"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Groups body */}
          <div className="space-y-14">
            {FAQ_GROUPS.map((group) => (
              <Reveal key={group.title}>
                <section id={slug(group.title)} className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">
                    {group.title}
                  </h2>

                  <div className="mt-6 divide-y divide-line border-y border-line">
                    {group.faqs.map((faq) => (
                      <details key={faq.q} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink transition-colors hover:text-accent-strong">
                          {faq.q}
                          <IconArrowRight
                            size={15}
                            className="shrink-0 text-ink-3 transition-transform group-open:rotate-90"
                          />
                        </summary>
                        <div className="mt-3 space-y-3">
                          {faq.a.map((paragraph, i) => (
                            <p key={i} className="max-w-[68ch] text-sm leading-relaxed text-ink-2">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom conversion */}
      <section className="border-t border-line bg-raised/30">
        <div className="shell flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Still reading? That is the filter working.
            </h2>
            <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-ink-2">
              Engineers who appreciate technical transparency are the exact people Keel is built
              for. Unit 3.2.1 is the fastest way to test whether the loop works for you.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            {first ? (
              <Link href={`/units/${first.id}`} className="btn-primary px-5 py-3 text-[15px]">
                Start Unit {first.id}
                <IconArrowRight size={16} />
              </Link>
            ) : null}
            <Link href="/pricing" className="btn-ghost px-5 py-3 text-[15px]">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
