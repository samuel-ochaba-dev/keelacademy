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
    <div>
      {stepNumber ? (
        <span>
          STAGE {stepNumber}
        </span>
      ) : null}
      <h2>
        {title}
      </h2>
      <p>{lead}</p>
    </div>
  );
}
