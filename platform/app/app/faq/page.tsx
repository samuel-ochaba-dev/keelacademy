import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

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
    <div>
      {/* Header */}
      <section>
        <div>
          <div>
            
            <span>PRODUCTION SPECIFICATION FAQ</span>
          </div>

          <h1>
            Plain answers, including the unflattering ones.
          </h1>

          <p>
            No marketing evasions. If a constraint or limitation exists on our platform, we state it explicitly below.
          </p>
        </div>
      </section>

      {/* FAQ Index & Group Content */}
      <section>
        <div>
          {/* Index rail */}
          <nav aria-label="FAQ categories">
            <span>
              CATEGORIES
            </span>
            <ul>
              {FAQ_GROUPS.map((group) => (
                <li key={group.title}>
                  <a
                    href={`#${slug(group.title)}`}
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Group questions */}
          <div>
            {FAQ_GROUPS.map((group) => (
              <section key={group.title} id={slug(group.title)}>
                <div>
                  <h2>
                    {group.title}
                  </h2>
                </div>

                <div>
                  {group.faqs.map((faq) => (
                    <details key={faq.q}>
                      <summary>
                        <span>{faq.q}</span>
                      </summary>
                      <div>
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
      <section>
        <div>
          <div>
            <h2>Ready to start Unit 3.2.1?</h2>
            <p>
              Build the schema extraction pipeline and get line-by-line feedback today.
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

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
