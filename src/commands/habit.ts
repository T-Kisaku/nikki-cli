import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import { Input } from "@cliffy/prompt/input";
import {
  db,
  eq,
  exerciseLogs,
  exerciseTypes,
  meditationLogs,
  vMeditationLogs,
} from "@db/client.ts";
import { rootTui, tuiExit } from "@src/tui/index.ts";
import renderHeatmap, { HeatmapElement } from "@src/tui/heatmap.ts";
import renderCountup from "@src/tui/countup.ts";

export default new Command()
  .description("Habit tracking")
  .arguments("[habit:string]")
  .action(async (_options, habitArg) => {
    const habit = await getHabitChoice(habitArg);
    switch (habit) {
      case "meditation":
        return await handleMeditation();
      case "exercise":
        return await handleExercise();
    }
    console.error("Invalid habit choice");
    Deno.exit(1);
  });

async function getHabitChoice(habitArg?: string): Promise<string> {
  if (habitArg && ["meditation", "exercise"].includes(habitArg.toLowerCase())) {
    return habitArg.toLowerCase();
  }
  return await Select.prompt({
    message: "Pick a habit",
    options: [
      { name: "Meditation", value: "meditation" },
      { name: "Exercise", value: "exercise" },
    ],
  });
}

async function handleMeditation() {
  const inserted = (await db.insert(meditationLogs).values({}).returning())[0];
  const logs = await db.select().from(vMeditationLogs);
  const elements: HeatmapElement[] = logs.map((log) => ({
    datetime: log.startedAt as Date,
    level: log.durationSeconds ? 3 : 0,
  }));
  const tui = rootTui();
  await renderHeatmap(tui, elements);
  console.clear();
  await renderCountup(tui, 60 * 60); // 1 hour
  console.clear();
  const memo = await getPrompt("Give me review!! >");
  await db.update(meditationLogs)
    .set({ endedAt: new Date(), memo })
    .where(eq(meditationLogs.id, inserted.id));
  await tuiExit(tui);
}
async function handleExercise() {
  const types = await db.select().from(exerciseTypes);
  const exerciseName = await Input.prompt({
    message: "Choose a exercise",
    suggestions: types.map((t) => t.name),
  });
  const exerciseTypeId = types.find((t) => t.name === exerciseName)?.id;
  if (!exerciseTypeId) {
    console.error("Invalid exercise choice");
    return;
  }
  const memo = await getPrompt("Give me review!! >");
  await db.insert(exerciseLogs).values({
    exerciseTypeId: exerciseTypeId,
    memo,
  });
  const logs = await db.select().from(exerciseLogs);
  const elements: HeatmapElement[] = logs.map((log) => ({
    datetime: log.datetime,
    level: log.intensity as HeatmapElement["level"] || 3,
  }));
  const tui = rootTui();
  await renderHeatmap(tui, elements);
  console.clear();
  await tuiExit(tui);
}

async function getPrompt(message: string) {
  const path = await Deno.makeTempFile();
  await Deno.writeTextFile(path, message);
  const editorEnv = Deno.env.get("EDITOR")!;
  const editor = new Deno.Command(editorEnv, {
    args: [path],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  await editor.output();
  const text = await Deno.readTextFile(path);
  await Deno.remove(path);
  return text;
}
