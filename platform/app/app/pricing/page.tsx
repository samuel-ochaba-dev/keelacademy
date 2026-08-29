import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const metadata: Metadata = {
  title: "Transparent Tuition & Completion Rebates — Keel Academy",
  description:
    "Honest, one-time tuition with up to 30% ($600) cash returned automatically upon verified milestone completions.",
};

export default function PricingPage() {
  const units = listUnits();
  const firstUnit = units[0];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Header */}
      <section className="border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950 px-4 pt-16 pb-16 sm:px-6 sm:pt-20 sm:pb-20 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-medium text-emerald-400">
            <span>Aligned Incentives • Automated Cash Rebates • No Recurring Traps</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl font-mono text-zinc-50">
            Simple, Transparent Tuition
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Pay upfront once. Earn up to $600 (30%) back directly to your payment method when you pass scheduled integration gates.
          </p>
        </div>
      </section>

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-16">
        {/* Main Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Full Program Plan */}
          <div className="lg:col-span-8 rounded-xl border-2 border-emerald-500/50 bg-zinc-900/70 p-6 sm:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 bg-emerald-500 text-zinc-950 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
              Full Program Enrollment
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Self-Operating AI Engineering Track
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-mono text-zinc-50">
                  Full 13-Phase Access + Rebate Eligibility
                </h2>
                <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                  Complete access to all 150+ units, isolated Docker verification environments, private golden test suites, LLM rubric judge evaluations, and defense interview simulations.
                </p>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100">$1,950</span>
                  <span className="text-xs font-mono text-zinc-400">one-time payment</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Net $1,350 after completion rebates
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-800 text-xs font-mono space-y-1.5 text-zinc-300">
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>• Phase 5 Integration Gate Pass:</span>
                    <span className="font-bold">-$300 refund (15%)</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>• Capstone Delivery Verification:</span>
                    <span className="font-bold">-$300 refund (15%)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-zinc-800/60 font-bold">
                    <span>Maximum Guaranteed Rebate:</span>
                    <span className="text-zinc-100">$600 total cash back</span>
                  </div>
                </div>
              </div>

              {/* What's included checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Included in Enrollment:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>13 comprehensive phases (700–950h load)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>1,000,000 Layer 2 rubric judge tokens</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Unlimited Layer 1 deterministic sandbox runs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Meridian Mutual production claims codebase</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Automated defend-your-work voice/text drills</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>365-day access window with no recurring fees</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-4">
              {firstUnit ? (
                <Link
                  href={`/checkout?unit=${firstUnit.id}`}
                  className="w-full sm:w-auto text-center rounded-md bg-emerald-500 px-8 py-3 text-sm font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg active:scale-[0.98]"
                >
                  Enroll Now &rarr;
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto text-center rounded-md bg-emerald-500 px-8 py-3 text-sm font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg active:scale-[0.98]"
                >
                  Create Account &rarr;
                </Link>
              )}
              <span className="text-[11px] font-mono text-zinc-500">
                Processed securely via Stripe with automated rebate refund wiring.
              </span>
            </div>
          </div>

          {/* Unit-by-Unit Option */}
          <div className="lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Modular Option
              </span>
              <h2 className="text-xl font-bold font-mono text-zinc-100">
                Individual Unit Enrollment
              </h2>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Want to test the verification loop first? Enroll unit-by-unit with standalone sandbox access.
              </p>

              <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-1">
                <div className="text-2xl font-mono font-bold text-zinc-100">$25 – $45</div>
                <div className="text-[11px] font-mono text-zinc-500">per authored unit module</div>
              </div>

              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Unit 3.2.1 Pydantic Extraction available immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Full deterministic test harness and rubric grading</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-zinc-500 font-bold">•</span>
                  <span className="text-zinc-500">Note: Milestone rebates require full program enrollment</span>
                </li>
              </ul>
            </div>

            <Link
              href={firstUnit ? `/units/${firstUnit.id}` : "/curriculum"}
              className="w-full text-center rounded-md border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-mono font-semibold text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
            >
              Explore Unit 3.2.1 Workbench &rarr;
            </Link>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Direct Comparison
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">
              Self-Operating Verification vs. Traditional Mentors
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Why objective automated harnesses outperform human TA review at 10% of the cost.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Evaluation Dimension</th>
                  <th className="py-3 px-4 font-semibold text-emerald-400">Keel Academy Platform</th>
                  <th className="py-3 px-4 font-semibold text-zinc-400">Legacy Mentor Bootcamps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-100">Grading Turnaround</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-semibold">&lt; 3 seconds (Automated sandboxes)</td>
                  <td className="py-3.5 px-4 text-zinc-400">3 to 7 business days per review</td>
                </tr>
                <tr className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-100">Evaluation Rigor</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-semibold">Adversarial test cases + calibrated LLM rubric</td>
                  <td className="py-3.5 px-4 text-zinc-400">Surface-level manual skim of notebook</td>
                </tr>
                <tr className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-100">Codebase Cohesion</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-semibold">One 13-phase enterprise system (Meridian)</td>
                  <td className="py-3.5 px-4 text-zinc-400">Disjointed toy exercises and framework wrappers</td>
                </tr>
                <tr className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-100">Total Price & Terms</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-semibold">$1,950 one-time (down to $1,350 with rebates)</td>
                  <td className="py-3.5 px-4 text-zinc-400">$15,000 – $25,000 upfront or predatory ISAs</td>
                </tr>
                <tr className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-100">Incentive Alignment</td>
                  <td className="py-3.5 px-4 text-emerald-300 font-semibold">Up to 30% cash refunded when you pass on schedule</td>
                  <td className="py-3.5 px-4 text-zinc-400">Zero refunds; profit from non-completions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Completion Rebate FAQ Callout */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-mono font-bold text-zinc-100">
            How the 30% Completion Rebate Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-400 font-sans leading-relaxed">
            <div className="space-y-1.5">
              <span className="font-mono font-bold text-emerald-400 text-[11px] uppercase block">1. Clear Gate 5</span>
              <p>
                When you pass the Phase 5 Integration Gate (unit 5.1 ReAct claims router) within your 180-day target window, $300 is automatically credited back to your original payment method.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-mono font-bold text-emerald-400 text-[11px] uppercase block">2. Deliver Capstone</span>
              <p>
                When your Section 14 graduation checks pass (golden test set, defend-your-work interview, CTO/CFO simulated defense), the second $300 rebate is triggered immediately.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-mono font-bold text-emerald-400 text-[11px] uppercase block">3. Zero Paperwork</span>
              <p>
                No forms, no claims to submit. The grading engine verifies git commit cryptographic hashes and automatically posts the refund through the Stripe API.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

