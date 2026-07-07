import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

import {
  clerkUserCreated,
  clerkUserDeleted,
  clerkUserUpdated,
  inngest,
} from "./client";

// Consumes `clerk/user.created` and upserts the user into Neon. Upsert (rather
// than plain insert) keeps the function idempotent: Inngest may retry, and
// Clerk can re-deliver a webhook, so a second run must not fail on the unique
// `clerk_id` constraint.
export const syncUserCreated = inngest.createFunction(
  { id: "sync-user-created", triggers: [{ event: clerkUserCreated }] },
  async ({ event, step }) => {
    const { clerkId, email, name, imageUrl } = event.data;

    await step.run("upsert-user", async () => {
      await db
        .insert(users)
        .values({ clerkId, email, name, imageUrl })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: { email, name, imageUrl },
        });
    });

    return { clerkId };
  },
);

// Consumes `clerk/user.updated` and re-syncs the changed fields into Neon.
// Uses the same upsert as `user.created`: idempotent under retries/re-delivery,
// and self-healing if the `user.created` event was ever missed.
export const syncUserUpdated = inngest.createFunction(
  { id: "sync-user-updated", triggers: [{ event: clerkUserUpdated }] },
  async ({ event, step }) => {
    const { clerkId, email, name, imageUrl } = event.data;

    await step.run("upsert-user", async () => {
      await db
        .insert(users)
        .values({ clerkId, email, name, imageUrl })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: { email, name, imageUrl },
        });
    });

    return { clerkId };
  },
);

// Consumes `clerk/user.deleted` and removes the user from Neon. The `users`
// FKs cascade, so their trips and related rows are cleaned up automatically.
// Deleting a non-existent row is a no-op, so this stays idempotent on retries.
export const syncUserDeleted = inngest.createFunction(
  { id: "sync-user-deleted", triggers: [{ event: clerkUserDeleted }] },
  async ({ event, step }) => {
    const { clerkId } = event.data;

    await step.run("delete-user", async () => {
      await db.delete(users).where(eq(users.clerkId, clerkId));
    });

    return { clerkId };
  },
);

// Registered with the serve handler. Add future Inngest functions here.
export const functions = [syncUserCreated, syncUserUpdated, syncUserDeleted];
