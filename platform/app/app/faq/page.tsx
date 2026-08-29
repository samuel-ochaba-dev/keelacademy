import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Keel Academy",
  description: "Frequently asked questions.",
};

const FAQS = [
  {
    question: "What is Keel Academy?",
    answer: "An engineering platform for learning applied AI.",
  },
  {
    question: "How does grading work?",
    answer: "Code submissions are evaluated against automated test suites and rubrics.",
  },
  {
    question: "How do unit completions work?",
    answer: "Complete drills, implement the unit requirements, and submit code for grading.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <h1>FAQ</h1>
      <dl>
        {FAQS.map((faq, i) => (
          <div key={i}>
            <dt>
              <strong>{faq.question}</strong>
            </dt>
            <dd>{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
