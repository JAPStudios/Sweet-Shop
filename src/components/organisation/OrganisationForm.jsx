import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { saveOrganisation } from "@/lib/organisation-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrganisationForm({ organisation, onSaved, onCancel }) {
  const save = useServerFn(saveOrganisation);
  const [name, setName] = useState(organisation?.name ?? "");
  const [contactEmail, setContactEmail] = useState(organisation?.contact_email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await save({ data: { name, contact_email: contactEmail } });
      onSaved(result.organisation);
    } catch (err) {
      setError(err?.message || "The organisation account could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="sweet-card mt-6 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="org-name">Organisation name</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={120}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="org-email">Contact email</Label>
          <Input
            id="org-email"
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            required
            className="mt-1.5"
          />
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" className="rounded-full" disabled={busy}>
          {busy ? "Saving…" : organisation ? "Save changes" : "Create organisation account"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" className="rounded-full" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}