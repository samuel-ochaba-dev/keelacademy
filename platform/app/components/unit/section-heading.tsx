export function SectionHeading({
  title,
  lead,
  stepNumber,
}: {
  title: string;
  lead: string;
  stepNumber?: string;
}) {
  return (
    <div className="max-w-3xl space-y-1.5">
      {stepNumber ? (
        <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider block">
          STAGE {stepNumber}
        </span>
      ) : null}
      <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      <p className="text-xs leading-relaxed text-ink-2 sm:text-sm">{lead}</p>
    </div>
  );
}
