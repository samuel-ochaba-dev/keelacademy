export function SectionHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{lead}</p>
    </div>
  );
}
