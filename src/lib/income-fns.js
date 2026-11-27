import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { serviceConfigStatus } from "@/lib/service-config.server";

// Income-adjusted essentials depend on a Butter Bank assessment. Until that
// connection exists there is no assessment, so every basket is priced at the
// seller's listed price — the app never invents a band, threshold or discount.
export const getIncomeAccess = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const rows = await context.getBase44().entities.IncomeAssessment.filter(
      { created_by_id: context.user.id },
      "-created_date",
      10,
    );
    return {
      connected: serviceConfigStatus().butter_bank.configured,
      verified: rows.find((row) => row.status === "verified") ?? null,
      latest: rows[0] ?? null,
    };
  });

export const requestIncomeAssessment = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async () => {
    const status = serviceConfigStatus().butter_bank;
    throw Object.assign(
      new Error(
        status.configured
          ? "Butter Bank credentials are present, but the verification adapter has not been completed against the institution's API. No assessment was created and no price adjustment was applied."
          : `Butter Bank income verification is not connected. Required configuration: ${status.missing.join(", ")}. No assessment was created and no price adjustment was applied.`,
      ),
      { status: 503 },
    );
  });