import { eventType, Inngest } from "inngest";
import { z } from "zod";

// The payload the Clerk webhook forwards into Inngest. We deliberately narrow
// the (large) Clerk user object down to just the fields we persist.
export const clerkUserCreatedData = z.object({
  clerkId: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
});

export type ClerkUserCreatedData = z.infer<typeof clerkUserCreatedData>;

// Typed event definition (Inngest v4 `eventType`). A Zod schema is a Standard
// Schema, so this gives both compile-time types and runtime validation. Use
// `clerkUserCreated.create(data)` when sending and as a function trigger.
export const clerkUserCreated = eventType("clerk/user.created", {
  schema: clerkUserCreatedData,
});

// `user.updated` carries the same narrowed shape as `user.created` — Clerk
// resends the full user object, and we persist the same fields.
export const clerkUserUpdatedData = clerkUserCreatedData;
export type ClerkUserUpdatedData = z.infer<typeof clerkUserUpdatedData>;

export const clerkUserUpdated = eventType("clerk/user.updated", {
  schema: clerkUserUpdatedData,
});

// `user.deleted` only carries the Clerk id; that's all we need to find the row.
export const clerkUserDeletedData = z.object({
  clerkId: z.string().min(1),
});

export type ClerkUserDeletedData = z.infer<typeof clerkUserDeletedData>;

export const clerkUserDeleted = eventType("clerk/user.deleted", {
  schema: clerkUserDeletedData,
});

// Dev-only setup: with no INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY in the
// environment, the SDK runs in dev mode and talks to the local Inngest dev
// server (http://localhost:8288). Nothing else to configure for now.
export const inngest = new Inngest({ id: "tripai" });
