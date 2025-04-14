import { relations } from "drizzle-orm/relations";
import { exerciseTypes, exerciseLogs } from "./schema";

export const exerciseLogsRelations = relations(exerciseLogs, ({one}) => ({
	exerciseType: one(exerciseTypes, {
		fields: [exerciseLogs.exerciseTypeId],
		references: [exerciseTypes.id]
	}),
}));

export const exerciseTypesRelations = relations(exerciseTypes, ({many}) => ({
	exerciseLogs: many(exerciseLogs),
}));