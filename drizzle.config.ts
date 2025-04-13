import { defineConfig } from "drizzle-kit";

const connectionString = Deno.env.get("SUPABASE_DB_URL")!;
export default defineConfig({
  out: "./db/migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
