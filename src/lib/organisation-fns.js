import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const normaliseEmail = (value) => String(value ?? "").trim().toLowerCase();

const withActiveMemberships = (rows) => rows.filter((row) => row.status === "active");

// The memberships a signed-in worker can list under. Used by the listing form so
// a worker can publish on behalf of their employer.
export const getMyMemberships = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const email = normaliseEmail(context.user.email);
    if (!email) return { memberships: [] };
    const rows = await context.getBase44().entities.OrganisationMember.filter(
      { worker_email: email },
      "created_date",
      50,
    );
    return {
      memberships: withActiveMemberships(rows).map((row) => ({
        id: row.id,
        organisation_id: row.organisation_id,
        organisation_name: row.organisation_name,
        role: row.role,
        jamail_verified: !!row.jamail_verified,
      })),
    };
  });

// The organisation account page: an owner sees the worker roster, a worker sees
// only their own membership.
export const getOrganisationAccount = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const asUser = context.getBase44();
    const email = normaliseEmail(context.user.email);
    const owned = await asUser.entities.Organisation.filter({ created_by_id: context.user.id });
    const organisation = owned[0] ?? null;

    if (organisation) {
      const members = await asUser.entities.OrganisationMember.filter(
        { organisation_id: organisation.id },
        "created_date",
        200,
      );
      return {
        organisation,
        members,
        membership: members.find((member) => normaliseEmail(member.worker_email) === email) ?? null,
        revokedMembership: null,
        canManage: true,
      };
    }

    const mine = await asUser.entities.OrganisationMember.filter(
      { worker_email: email },
      "created_date",
      50,
    );
    const membership = withActiveMemberships(mine)[0] ?? null;
    const employer = membership
      ? await asUser.entities.Organisation.get(membership.organisation_id).catch(() => null)
      : null;
    return {
      organisation: employer,
      members: [],
      membership,
      revokedMembership: mine.find((row) => row.status === "revoked") ?? null,
      canManage: false,
    };
  });

export const saveOrganisation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      name: z.string().min(2).max(120),
      contact_email: z.string().email().max(160),
    }),
  )
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const email = normaliseEmail(context.user.email);
    const owned = await asUser.entities.Organisation.filter({ created_by_id: context.user.id });
    const existing = owned[0];

    if (existing) {
      const organisation = await asUser.entities.Organisation.update(existing.id, {
        name: data.name,
        contact_email: data.contact_email,
      });
      const members = await asUser.entities.OrganisationMember.filter({
        organisation_id: existing.id,
      });
      for (const member of members) {
        if (member.organisation_name !== data.name) {
          await asUser.entities.OrganisationMember.update(member.id, { organisation_name: data.name });
        }
      }
      return { organisation };
    }

    const organisation = await asUser.entities.Organisation.create({
      name: data.name,
      contact_email: data.contact_email,
      jamail_org_id: "",
      status: "pending_verification",
      member_emails: email ? [email] : [],
      note: "JaMail organisation verification is not connected, so this account is recorded as pending.",
    });

    await asUser.entities.OrganisationMember.create({
      organisation_id: organisation.id,
      organisation_name: organisation.name,
      worker_email: email,
      worker_name: context.user.full_name ?? "",
      role: "owner",
      status: "active",
      jamail_verified: false,
      revoked_at: "",
      revoked_reason: "",
    });

    return { organisation };
  });

export const addWorker = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      worker_email: z.string().email().max(160),
      worker_name: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const email = normaliseEmail(data.worker_email);
    const owned = await asUser.entities.Organisation.filter({ created_by_id: context.user.id });
    const organisation = owned[0];
    if (!organisation) {
      throw Object.assign(new Error("Create the organisation account before adding workers."), { status: 400 });
    }
    if (email === normaliseEmail(context.user.email)) {
      throw Object.assign(new Error("You already hold the owner membership for this organisation."), { status: 400 });
    }

    const existing = await asUser.entities.OrganisationMember.filter({
      organisation_id: organisation.id,
      worker_email: email,
    });
    const current = existing[0];
    if (current && current.status === "active") {
      throw Object.assign(new Error("That worker already holds an active membership."), { status: 409 });
    }

    const payload = {
      organisation_id: organisation.id,
      organisation_name: organisation.name,
      worker_email: email,
      worker_name: data.worker_name ?? current?.worker_name ?? "",
      role: "worker",
      status: "active",
      jamail_verified: false,
      revoked_at: "",
      revoked_reason: "",
    };

    const member = current
      ? await asUser.entities.OrganisationMember.update(current.id, payload)
      : await asUser.entities.OrganisationMember.create(payload);

    const emails = (organisation.member_emails ?? []).map(normaliseEmail);
    if (!emails.includes(email)) {
      await asUser.entities.Organisation.update(organisation.id, {
        member_emails: [...(organisation.member_emails ?? []), email],
      });
    }

    return { member };
  });

export const revokeWorker = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      member_id: z.string().min(1).max(128),
      reason: z.string().max(200).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const asUser = context.getBase44();
    const svc = asUser.asServiceRole;
    const member = await svc.entities.OrganisationMember.get(data.member_id).catch(() => null);
    if (!member) throw Object.assign(new Error("That membership no longer exists."), { status: 404 });

    const owned = await asUser.entities.Organisation.filter({ created_by_id: context.user.id });
    const isOwner = owned[0]?.id === member.organisation_id;
    if (!isOwner && context.user.role !== "admin") {
      throw Object.assign(new Error("Only the organisation owner or an administrator can revoke a membership."), { status: 403 });
    }
    if (member.role === "owner") {
      throw Object.assign(new Error("The owner's own membership cannot be revoked."), { status: 409 });
    }

    const updated = await svc.entities.OrganisationMember.update(member.id, {
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_reason: data.reason ?? "",
    });

    const organisation = await svc.entities.Organisation.get(member.organisation_id).catch(() => null);
    if (organisation) {
      const email = normaliseEmail(member.worker_email);
      await svc.entities.Organisation.update(organisation.id, {
        member_emails: (organisation.member_emails ?? []).filter((value) => normaliseEmail(value) !== email),
      });
    }

    return { member: updated };
  });