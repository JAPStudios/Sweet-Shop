import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { addWorker } from "@/lib/organisation-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WorkerForm({ onAdded }) {
  const invite = useServerFn(addWorker);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await invite({ data: { worker_email: email, worker_name: name || undefined } });
      setEmail("");
      setName("");
      await onAdded();
    } catch (err) {
      setError(err?.message || "That worker could not be added.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl bg-white/70 p-5">
      <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="worker-email">Worker's account email</Label>
          <Input
            id="worker-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="worker@example.com"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="worker-name">Name (optional)</Label>
          <Input
            id="worker-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" className="rounded-full" disabled={busy}>
          {busy ? "Adding…" : "Add worker"}
        </Button>
      </div>
      {error && <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Each worker keeps their own account. The membership lets that account list goods on behalf of the
        organisation.
      </p>
    </form>
  );
}