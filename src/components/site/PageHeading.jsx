export default function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/60 pb-6">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}