import { Webhook } from "svix";
import { z } from "zod";

import {
  clerkUserCreated,
  clerkUserCreatedData,
  clerkUserDeleted,
  clerkUserDeletedData,
  clerkUserUpdated,
  inngest,
} from "@/inngest/client";

// Shape of the parts of Clerk's user payloads we actually read. `user.created`
// and `user.updated` share this shape; `user.deleted` only sends `id` (the
// other fields default to empty/absent). Clerk sends much more; we only
// validate what we forward.
const clerkUserEvent = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    email_addresses: z
      .array(z.object({ id: z.string(), email_address: z.string() }))
      .default([]),
    primary_email_address_id: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
  }),
});

export async function POST(request: Request) {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!signingSecret) {
    console.error("CLERK_WEBHOOK_SIGNING_SECRET is not set.");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Verify the svix signature against the raw body. Any tampering, replay, or
  // wrong secret throws, so an unsigned/forged request never reaches the DB.
  const body = await request.text();
  let evt: unknown;
  try {
    evt = new Webhook(signingSecret).verify(body, {
      "svix-id": request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    });
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const parsed = clerkUserEvent.safeParse(evt);
  if (!parsed.success) {
    return Response.json({ error: "Unexpected payload" }, { status: 400 });
  }

  const { type, data } = parsed.data;

  // `user.deleted` only carries the id; forward it and delete in the background.
  if (type === "user.deleted") {
    const eventData = clerkUserDeletedData.parse({ clerkId: data.id });
    await inngest.send(clerkUserDeleted.create(eventData));
    return Response.json({ ok: true });
  }

  // Ignore every other Clerk event; ack with 200 so Clerk doesn't retry.
  if (type !== "user.created" && type !== "user.updated") {
    return Response.json({ ok: true, ignored: type });
  }

  const primaryEmail =
    data.email_addresses.find((e) => e.id === data.primary_email_address_id)
      ?.email_address ?? data.email_addresses[0]?.email_address;

  if (!primaryEmail) {
    return Response.json({ error: "User has no email" }, { status: 400 });
  }

  const name =
    [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || null;

  // Re-validate the narrowed payload before handing it to the background job.
  // `user.created` and `user.updated` forward the same shape.
  const eventData = clerkUserCreatedData.parse({
    clerkId: data.id,
    email: primaryEmail,
    name,
    imageUrl: data.image_url || null,
  });

  // Hand off to Inngest; the DB write happens in the background function so the
  // webhook responds fast and retries are handled by Inngest.
  await inngest.send(
    type === "user.created"
      ? clerkUserCreated.create(eventData)
      : clerkUserUpdated.create(eventData),
  );

  return Response.json({ ok: true });
}
