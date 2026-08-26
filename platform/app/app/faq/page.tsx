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
    title: "Who this is for & prerequisites",
    faqs: [
      {
        q: "Is Keel Academy right for me?",
        a: [
          "It's built for you if you already know how to write code, have built AI demos that felt fragile under real scrutiny, and want to master the engineering disciplines (evaluation, retrieval, cost controls, security) that turn a weekend demo into a reliable production system.",
          "It is not for you if you want to passively watch video playlists, are searching for a six-week shortcut, or need a teacher to chase you for assignments. Pods and milestones give you structure, but finishing is up to you.",
        ],
      },
      {
        q: "How much coding experience do I need before starting?",
        a: [
          "You should be comfortable with basic programming, installing packages, and using a terminal. Phase 1 covers software engineering foundations from there. If you already program professionally, a 20-minute adaptive diagnostic allows you to skip ahead directly into Phase 2.",
        ],
      },
      {
        q: "I already call LLM APIs in my job. Will I learn anything new?",
        a: [
          "If you already build automated golden test sets, calibrate AI judges with line-by-line evidence, defend systems against indirect prompt injection, and present token cost models to leadership, then no: you don't need this school. If any of those areas make you hesitate, that exact gap is what you'll master here.",
        ],
      },
    ],
  },
  {
    title: "How learning & grading work",
    faqs: [
      {
        q: "Is this self-paced or a live cohort?",
        a: [
          "It is self-paced by design. There are no mandatory live lectures to sit through. If you choose the Cohort+ tier, you're matched with a peer pod for weekly accountability and review, but you set your own build schedule.",
        ],
      },
      {
        q: "How is Keel different from typical AI courses?",
        a: [
          "Three major differences: You build one continuous production system for a real-world anchor client across 13 phases; your code is verified by automated test environments, line-by-line rubric grading, and unscripted code defenses; and there is zero fluff: no passive videos and no vanity participation certificates.",
        ],
      },
      {
        q: "How do I get unblocked when I get stuck?",
        a: [
          "You have three instant support systems: every unit includes an Unstuck guide detailing common failure modes and exact fixes from real developer attempts; an always-on AI assistant grounded in the codebase helps you reason through architectural questions at 2am; and annotated worked examples show you working patterns for parallel problems.",
        ],
      },
      {
        q: "Can students game the grading system with AI copy-pasting?",
        a: [
          "You're encouraged to use AI coding tools as force multipliers, but you can't fake understanding. Milestone gates require you to answer follow-up technical questions explaining the specific decisions in your submitted code. Plus, your dataset is uniquely seeded to your student ID, so copying someone else's code fails on your data.",
        ],
      },
    ],
  },
  {
    title: "Curriculum roadmap & updates",
    faqs: [
      {
        q: "How does the curriculum stay current as AI tools evolve?",
        a: [
          "Lessons are structured in layers: core architectural concepts (which rarely change), applied pipeline design, and fast-moving tool specifics. Tool-specific sections undergo scheduled quarterly audits to ensure all code examples and SDKs match current production standards.",
        ],
      },
      {
        q: "How much of the curriculum is live right now?",
        a: [
          "Unit 3.2.1 is live with full automated grading active today. The remaining twelve phases are published as an open, fully detailed specification that we are building and releasing in sequence. We share this transparently so you know the exact status before enrolling.",
        ],
      },
    ],
  },
  {
    title: "Pricing, rebates & guarantees",
    faqs: [
      {
        q: "What does enrollment cost?",
        a: [
          "We charge a single one-time payment with zero monthly subscriptions: $1,950 for Self-Guided or $2,450 for Cohort+. Individual units can also be enrolled individually during pilot batches.",
        ],
      },
      {
        q: "How does the 30% completion rebate work?",
        a: [
          "When you pass the Phase 5 milestone within 365 days of enrollment, 15% of your tuition is automatically refunded to your card. When you pass the final capstone defense within 365 days, you receive another 15% refund. You earn back 30% total by shipping your work on schedule.",
        ],
      },
      {
        q: "What is your refund policy if I want to withdraw?",
        a: [
          "We offer a 14-day no-questions-asked refund window from enrollment, provided you haven't submitted your first graded deliverable. If the text-first, self-driven building format isn't right for you, you can exit with a full refund.",
        ],
      },
      {
        q: "Do you offer team or company enrollment?",
        a: [
          "Yes. Engineering teams of 5 or more can enroll with shared progress dashboards and private team pod channels. Contact support for team invoices.",
        ],
      },
    ],
  },
  {
    title: "What you don't get (honest expectations)",
    faqs: [
      {
        q: "Do I get a PDF certificate of completion?",
        a: [
          "No. Your proof of skill is the verified work itself: public git repositories, passing test suites, rubric evaluation logs, and recorded walkthroughs. A PDF proving you watched videos means nothing to engineering hiring managers.",
        ],
      },
      {
        q: "Do you guarantee a job after graduation?",
        a: [
          "No, and you should be wary of any program that does. What we guarantee is that if you finish, your work is production-grade, independently verified, and you graduate with a priced client proposal and a real outreach email already sent.",
        ],
      },
      {
        q: "What is the biggest limitation of Keel Academy today?",
        a: [
          "Honest answer: the platform is early. Unit 3.2.1 is live, and the full 13-phase catalog is actively shipping. Enrolling now gives you founding-cohort pricing and direct input into the curriculum. Waiting means enrolling in a more mature catalog later. Both are valid choices.",
        ],
      },
    ],
  },
];

export default function FaqPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div className="space-y-0">
      {/* Header */}
      <section className="border-b border-line bg-canvas pt-12 pb-10">
        <div className="shell">
          <div className="flex items-center gap-2 font-mono text-xs text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            <span>PRODUCTION SPECIFICATION FAQ</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Plain answers, including the unflattering ones.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            No marketing evasions. If a constraint or limitation exists on our platform, we state it explicitly below.
          </p>
        </div>
      </section>

      {/* FAQ Index & Group Content */}
      <section className="shell py-14">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
          {/* Index rail */}
          <nav aria-label="FAQ categories" className="self-start lg:sticky lg:top-20">
            <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider block mb-3">
              CATEGORIES
            </span>
            <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAQ_GROUPS.map((group) => (
                <li key={group.title}>
                  <a
                    href={`#${slug(group.title)}`}
                    className="block shrink-0 rounded border border-line bg-raised px-2.5 py-1.5 font-mono text-xs text-ink-3 transition-colors hover:border-accent hover:text-ink lg:shrink"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Group questions */}
          <div className="space-y-12">
            {FAQ_GROUPS.map((group) => (
              <section key={group.title} id={slug(group.title)} className="scroll-mt-20 space-y-4">
                <div className="border-b border-line pb-2">
                  <h2 className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
                    {group.title}
                  </h2>
                </div>

                <div className="divide-y divide-line border-y border-line">
                  {group.faqs.map((faq) => (
                    <details key={faq.q} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-semibold text-ink transition-colors hover:text-accent">
                        <span>{faq.q}</span>
                        <IconArrowRight size={13} className="shrink-0 text-ink-4 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="mt-3 space-y-2 text-xs leading-relaxed text-ink-2 pl-2 border-l border-line-strong">
                        {faq.a.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Action Bar */}
      <section className="border-t border-line bg-canvas py-12">
        <div className="shell flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-ink">Ready to start Unit 3.2.1?</h2>
            <p className="text-xs text-ink-3">
              Build the schema extraction pipeline and get line-by-line feedback today.
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

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
