import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Server-only module. The Neon HTTP driver is serverless-safe and works inside
// Expo Router API routes (one round-trip per query, no long-lived connections).
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to your server environment.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

export { schema };
