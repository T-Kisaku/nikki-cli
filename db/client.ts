import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@db/migrations/schema.ts";
import pg from "pg";

// Use pg driver.
const { Pool } = pg;

const connectionString = Deno.env.get("SUPABASE_DB_URL")!;
// Instantiate Drizzle client with pg driver and schema.
export const db = drizzle({
  client: new Pool({
    connectionString,
  }),
  schema,
});
export * from "@db/migrations/schema.ts";
export * from "drizzle-orm";
