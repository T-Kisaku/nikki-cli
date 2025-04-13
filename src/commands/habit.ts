import { Command } from "@cliffy/command";

import { Select } from "@cliffy/prompt/select";
import renderHeatmap, { HeatmapElement } from "@src/tui/heatmap.ts";
import renderCountup from "@src/tui/countup.ts";
import { GlobalOptions } from "@src/main.ts";
import { db, eq, meditationLogs, vMeditationLogs } from "@db/client.ts";
import { rootTui, tuiExit } from "@src/tui/index.ts";

export default new Command<GlobalOptions>()
  .description("Create or update a journal entry with a template")
  .arguments("[habit:string]")
  .action(async (_options, habitArg) => {
    let search: string;
    if (habitArg === undefined) {
      search = await Select.prompt({
        message: "Pick a habit",
        options: [
          { name: "Meditation", value: "Meditation" },
          { name: "Exercise", value: "## Exercise" },
        ],
      });
    } else if (["Meditation"].includes(habitArg)) {
      search = habitArg;
    } else {
      // TODO: ERROR HANDLING
      console.log("error handling");
      Deno.exit(1);
    }
    switch (search) {
      case "Meditation":
        {
          const inserted = (await db.insert(meditationLogs).values({})
            .returning())[0];
          const logs = await db.select().from(vMeditationLogs);
          const elements: HeatmapElement[] = logs.map((log) => ({
            datetime: log.startedAt as Date,
            level: log.durationSeconds ? 3 : 0,
          }));
          const tui = rootTui();
          await renderHeatmap(tui, elements);
          await renderCountup(tui, 10);

          await db.update(meditationLogs)
            .set({ endedAt: new Date() })
            .where(eq(meditationLogs.id, inserted.id));
          await tuiExit(tui);
        }
        break;
      default:
        // startHeatMapTui(search, journalDir);
        break;
    }
  });
