import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/AuthContext";
import { getIncomeAccess, requestIncomeAssessment } from "@/lib/income-fns";
import { Button } from "@/components/ui/button";

export default function IncomeAccessPanel() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const load = useServerFn(getIncomeAccess);
  const request = useServerFn(requestIncomeAssessment);
  const [access, setAccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    load()
      .then((result) => {
        if (active) setAccess(result);
      })
      .catch(() => {
        if (active) setAccess(null);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (isLoadingAuth || !isAuthenticated) return null;

  const verified = access?.verified ?? null;

  const runRequest = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await request();
      setMessage("Verification requested.");
    } catch (err) {
      setError(err?.message || "Butter Bank verification could not be requested.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sweet-card mt-6 p-6 sm:p-8">
      <h2 className="font-heading text-xl">Your income-adjusted access</h2>

      {verified ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Butter Bank verified an assessment on {verified.assessed_at ? new Date(verified.assessed_at).toLocaleDateString("en-US", { timeZone: "UTC" }) : "record"}
          {typeof verified.adjustment_percent === "number"
            ? `, authorising a ${verified.adjustment_percent}% adjustment on essentials. It is applied at checkout once payment collection is connected.`
            : ", without a price adjustment."}
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No verified income assessment is on file, so nothing is adjusted. Essentials are shown at the price
          each seller set.
        </p>
      )}

      <Button className="mt-5 rounded-full" onClick={runRequest} disabled={busy}>
        {busy ? "Contacting Butter Bank…" : "Request Butter Bank verification"}
      </Button>

      {message && <p className="mt-4 rounded-xl bg-secondary/60 p-3 text-sm">{message}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Any adjustment comes from Butter Bank's own assessment. This app does not calculate income bands,
        thresholds or percentages.
      </p>
    </div>
  );
}