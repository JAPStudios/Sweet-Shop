import { Button } from "@/components/ui/button";

const STATUS_TONE = {
  active: "bg-secondary text-secondary-foreground",
  revoked: "bg-destructive/10 text-destructive",
};

export default function WorkerTable({ members, onRevoke, busyId }) {
  if (members.length === 0) {
    return (
      <p className="mt-6 rounded-2xl bg-muted/70 p-5 text-sm text-muted-foreground">
        No workers have been added to this organisation yet.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-border/60">
      {members.map((member) => (
        <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-medium">
              {member.worker_name || member.worker_email}
              {member.role === "owner" && (
                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-accent-foreground">
                  Owner
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{member.worker_email}</p>
            {member.status === "revoked" && member.revoked_at && (
              <p className="mt-1 text-xs text-destructive">
                Access removed{member.revoked_reason ? ` — ${member.revoked_reason}` : ""}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[member.status] ?? "bg-muted text-muted-foreground"}`}
            >
              {member.status === "active" ? "Active" : "Revoked"}
            </span>
            {member.status === "active" && member.role !== "owner" && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={Boolean(busyId)}
                onClick={() => onRevoke(member)}
              >
                {busyId === member.id ? "Removing…" : "Remove access"}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}