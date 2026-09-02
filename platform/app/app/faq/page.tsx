import type { Metadata } from "next";
import Link from "next/link";
import { listUnits, loadCurriculumMap, loadPlacementDiagnostic } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Straight answers about how Keel Academy works, what is graded, and what exists today.",
};

export default function FaqPage() {
  const units = listUnits();
  const liveList = units.map((u) => u.id).join(", ");

  // Every number below is read from content/ so the answers cannot drift from
  // the curriculum they describe.
  const map = loadCurriculumMap();
  const phaseCount = map.phases.length;
  const totalHours = map.phases.reduce((sum, p) => sum + p.est_hours, 0);
  const monthsAtFifteen = Math.round(totalHours / 15 / 4.33);
  const monthsAtTwelve = Math.round(totalHours / 12 / 4.33);
  const placement = loadPlacementDiagnostic("placement-phase-1");
  const placementLine = placement
    ? `Pass the ${placement.est_minutes}-minute placement check and ${placement.pass_skip_units.length} Phase 1 units open without you working through them.`
    : "";

  const FAQS = [
    {
      question: "What is Keel Academy?",
      answer: `A project-based program for learning applied AI engineering. Instead of watching lessons and taking quizzes, you build one production system end to end: an invoice reconciliation and dispute triage pipeline for OmniSupply Operations, a simulated B2B distribution client. The curriculum is planned as ${phaseCount} phases and ${totalHours} hours of build work.`,
    },
    {
      question: "How does grading actually work?",
      answer:
        "You submit by pushing a git repository. Your code runs first against the unit's automated checks in a clean container, so the result does not depend on what is installed on your machine. Then a language model grades it against the unit's published rubric, and it has to quote the lines of your own code that earned each verdict. You can read the rubric before you start and you see the same verdict text the grader wrote.",
    },
    {
      question: "Can I get through this with another AI tool?",
      answer:
        "You can write code with one. Every working engineer does. What you cannot do is hand in output you do not understand: the rubric review quotes your own code back at you, the automated checks run it rather than read it, and the two capstone defences are conversations you hold live against a technical reviewer and a budget holder. Nobody can promise a bar that is impossible to game. This one is not a quiz you can paste an answer into.",
    },
    {
      question: "How long does it take?",
      answer: `At 12 to 15 hours a week, ${totalHours} hours works out to roughly ${monthsAtFifteen} to ${monthsAtTwelve} months. ${placementLine}`.trim(),
    },
    {
      question: "What exists right now?",
      answer:
        `The platform is built and running: accounts, per-unit enrollment, the whole grading loop, practice drills, the assistant, pods, the gallery, and the practice conversations. Units publish as they finish authoring${liveList ? `; open today: unit ${liveList}` : ""}. The recorded walkthrough stage is not built yet, and no unit asks you for a video. Every unit page states what is graded and what opens next.`,
    },
    {
      question: "What does it cost?",
      answer:
        "You enroll one unit at a time and the price is on the unit before you pay. There is no subscription. There are two milestone gates, one at the Phase 5 integration project and one at the capstone. You commit to a window for a gate up front, and clearing it inside that window returns 15% of what you paid for the unit as a refund to the card you paid with. Clearing the gate records the rebate straight away; the refund itself is issued by a person, not by a script.",
    },
    {
      question: "Who is this for?",
      answer:
        "Engineers who want to do real AI systems work, not prompt tricks: model integration, structured outputs, retrieval, agents, evaluation, governance, and deployment, plus the client conversations that come with shipping for a business. You should be comfortable writing code regularly. Complete beginners should start with a general programming foundation first.",
    },
    {
      question: "What do I leave with?",
      answer:
        "A deployed, documented system that passed a published bar, the verdicts that passed it, two defences held against a technical reviewer and a budget holder, and a proposal you can send to a real client. The portfolio is the credential: every piece of it was checked against a rubric you could read before you started.",
    },
  ];

  return (
    <div>
      <header className="shell pb-12 pt-14">
        <p className="eyebrow">FAQ</p>
        <h1 className="heading-xl mt-4">Straight answers.</h1>
        <p className="lead mt-5">
          If a question you care about is missing, it belongs on this page.
          Everything below describes how the program actually behaves today.
        </p>
      </header>

      <div className="shell pb-24">
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details key={faq.question} className="faq-item card-dark group" id={faq.question
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")}>
              <summary className="flex items-center justify-between gap-6 p-6">
                <h2 className="font-goga text-[17.5px] font-medium text-phosphor-white">
                  {faq.question}
                </h2>
                <svg
                  aria-hidden
                  className="faq-chevron text-[color:var(--text-faint-on-dark)]"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M5 3l4.5 4L5 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-6">
                <p className="max-w-[70ch] text-[15px] leading-relaxed text-[color:var(--text-muted-on-dark)]">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/curriculum" className="btn btn-ghost btn-sm">
            See the curriculum
          </Link>
          <Link href="/pricing" className="btn btn-ghost btn-sm">
            See pricing
          </Link>
          <Link href="/sign-up" className="btn btn-primary btn-sm">
            Start building
          </Link>
        </div>
      </div>
    </div>
  );
}
