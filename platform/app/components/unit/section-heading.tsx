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
    <div className="max-w-[68ch]">
      <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {stepNumber ? (
          <span className="mr-3 font-mono text-base text-accent">{stepNumber}</span>
        ) : null}
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{lead}</p>
    </div>
  );
}
