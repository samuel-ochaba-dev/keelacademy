"use client";

import { useState } from "react";
import type { CommitmentDeclaration } from "@/lib/content";

type Props = {
  commitment: CommitmentDeclaration;
  selectedUnitId: string;
  unitPrice: string;
  formAction: (formData: FormData) => Promise<void>;
};

export function CommitmentForm({
  commitment,
  selectedUnitId,
  unitPrice,
  formAction,
}: Props) {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allRequiredChecked = commitment.acknowledgments
    .filter((a) => a.required)
    .every((a) => checkedState[a.id]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="unit_id" value={selectedUnitId} />

      {/* Honesty & Workload Cards */}
      <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
            Honest Workload & Expectations Gate
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="rounded bg-zinc-950/80 p-3 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">TOTAL WORKLOAD</span>
            <span className="text-zinc-100 font-bold">
              {commitment.workload.total_hours_min}–{commitment.workload.total_hours_max} Hours
            </span>
          </div>
          <div className="rounded bg-zinc-950/80 p-3 border border-zinc-800">
            <span className="text-zinc-500 block text-[10px]">PACING ESTIMATE</span>
            <span className="text-zinc-100 font-bold">
              {commitment.workload.months_min}–{commitment.workload.months_max} Months @ {commitment.workload.hours_per_week_min}–{commitment.workload.hours_per_week_max} hrs/wk
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
          {commitment.format.summary}
        </p>

        {/* Guarantees honesty banner */}
        <div className="rounded border border-amber-500/30 bg-amber-950/30 p-3.5 space-y-1.5 text-xs">
          <span className="font-mono font-bold text-amber-300 block text-[11px]">
            HONESTY POLICY (NO CLIENT GUARANTEES)
          </span>
          <p className="text-amber-200/90 font-sans leading-relaxed">
            {commitment.guarantees.client_guarantee} {commitment.guarantees.what_we_guarantee}
          </p>
        </div>
      </div>

      {/* Mandatory Acknowledgment Checkboxes */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
          Required Onboarding Acknowledgments:
        </h4>
        <div className="space-y-2.5">
          {commitment.acknowledgments.map((ack) => {
            const isChecked = !!checkedState[ack.id];
            return (
              <label
                key={ack.id}
                onClick={() => toggleCheck(ack.id)}
                className={`flex items-start gap-3 p-3 rounded-md border text-xs cursor-pointer transition-colors ${
                  isChecked
                    ? "border-emerald-500/50 bg-emerald-950/20 text-zinc-200"
                    : "border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <input
                  type="checkbox"
                  name={`ack_${ack.id}`}
                  checked={isChecked}
                  onChange={() => {}} // handled by label
                  required={ack.required}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
                />
                <span className="font-sans leading-normal select-none">{ack.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Proceed Button */}
      <button
        type="submit"
        disabled={!allRequiredChecked}
        className={`w-full rounded-md py-3 text-sm font-mono font-bold transition-all shadow-lg active:scale-[0.98] ${
          allRequiredChecked
            ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer"
            : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
        }`}
      >
        {allRequiredChecked
          ? `I Agree — Proceed to Payment (${unitPrice}) →`
          : "Acknowledge All Statements Above to Proceed"}
      </button>
    </form>
  );
}
