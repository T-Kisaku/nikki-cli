import {
  bigint,
  check,
  foreignKey,
  numeric,
  pgTable,
  pgView,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const meditationLogs = pgTable("meditation_logs", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "meditation_logs_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
    .defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true, mode: "date" }),
  memo: text(),
});

export const exerciseLogs = pgTable("exercise_logs", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "exercise_logs_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  exerciseTypeId: bigint("exercise_type_id", { mode: "number" }).notNull(),
  datetime: timestamp({ withTimezone: true, mode: "date" }).defaultNow()
    .notNull(),
  intensity: smallint(),
  memo: text(),
}, (table) => [
  foreignKey({
    columns: [table.exerciseTypeId],
    foreignColumns: [exerciseTypes.id],
    name: "exercise_logs_exercise_type_id_fkey",
  }),
  check("intensity_range", sql`(intensity >= 0) AND (intensity <= 5)`),
]);

export const exerciseTypes = pgTable("exercise_types", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "exercise_types_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  name: text().notNull(),
  defaultIntensity: smallint("default_intensity"),
  memo: text(),
}, (table) => [
  check(
    "default_intensity_range",
    sql`(default_intensity >= 0) AND (default_intensity <= 5)`,
  ),
]);
export const vMeditationLogs = pgView("v_meditation_logs", { // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
  endedAt: timestamp("ended_at", { withTimezone: true, mode: "date" }),
  note: text(),
  durationSeconds: numeric("duration_seconds"),
}).as(
  sql`SELECT meditation_logs.id, meditation_logs.started_at, meditation_logs.ended_at, meditation_logs.memo AS note, EXTRACT(epoch FROM meditation_logs.ended_at - meditation_logs.started_at) AS duration_seconds FROM meditation_logs`,
);
