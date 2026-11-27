export default function StatusPill({ status, map }) {
  const meta = map?.[status] ?? { label: status, tone: "bg-muted text-muted-foreground" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${meta.tone}`}
    >
      {meta.label}
    </span>
  );
}