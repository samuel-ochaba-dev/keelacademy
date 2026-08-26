import { IconClock } from "@/components/icons";

export function ContentArriving({ what }: { what: string }) {
  return (
    <div className="flex max-w-xl items-start gap-4 rounded-xl border border-dashed border-line-strong bg-raised/60 px-5 py-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-inset text-ink-3">
        <IconClock size={16} />
      </span>
      <div>
        <p className="font-mono text-[11px] tracking-[0.1em] text-ink-3 uppercase">
          Content arriving
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
          {what} is scheduled on our open curriculum roadmap. As new units pass authoring and
          testing, they unlock here automatically.
        </p>
      </div>
    </div>
  );
}
