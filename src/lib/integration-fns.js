import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import { serviceConfigStatus } from "@/lib/service-config.server";

export const getIntegrationStatus = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user.role !== "admin") {
      throw Object.assign(new Error("Administrator access is required."), { status: 403 });
    }
    return { statuses: serviceConfigStatus() };
  });

// The consolidated pickup run a driver would hand to UnterSous: the stops they
// selected, in the order the console grouped them. It cannot be dispatched yet.
export const requestUnterSousPickupRun = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      stops: z
        .array(
          z.object({
            pickup_location_key: z.string().min(1).max(400),
            parcel_count: z.number().int().min(1).max(200),
          }),
        )
        .min(1)
        .max(20),
    }),
  )
  .handler(async ({ context }) => {
    if (context.user.role !== "admin" && context.user.role !== "driver") {
      throw Object.assign(new Error("Driver access is required."), { status: 403 });
    }
    const status = serviceConfigStatus().untersous;
    throw Object.assign(
      new Error(
        status.configured
          ? "UnterSous credentials are present, but the dispatch adapter has not been completed against UnterSous's API. The pickup run was not sent — record collection in the console."
          : `UnterSous pickup dispatch is not connected. Required configuration: ${status.missing.join(", ")}. The pickup run was not sent — record collection in the console.`,
      ),
      { status: 503 },
    );
  });