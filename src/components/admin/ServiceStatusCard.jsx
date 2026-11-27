export default function ServiceStatusCard({ service, status }) {
  const configured = Boolean(status?.configured);
  const missing = status?.missing ?? service.requires;

  return (
    <section className="sweet-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl">{service.name}</h2>
        <span
          className={
            configured
              ? "rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
              : "rounded-full bg-[hsl(38_92%_88%)] px-3 py-1 text-xs font-semibold text-[hsl(28_45%_28%)]"
          }
        >
          {configured ? "Credentials present" : "Not connected"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.role}</p>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">
        Required configuration
      </h3>
      <ul className="mt-2 space-y-1">
        {service.requires.map((name) => (
          <li key={name} className="flex items-center justify-between gap-3 font-mono text-xs">
            <span>{name}</span>
            <span className={missing.includes(name) ? "text-destructive" : "text-muted-foreground"}>
              {missing.includes(name) ? "missing" : "set"}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">
        Required endpoints
      </h3>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
        {service.endpoints.map((endpoint) => (
          <li key={endpoint}>· {endpoint}</li>
        ))}
      </ul>

      <p className="mt-5 rounded-xl bg-muted/70 p-4 text-xs leading-relaxed text-muted-foreground">
        {service.meanwhile}
      </p>
    </section>
  );
}