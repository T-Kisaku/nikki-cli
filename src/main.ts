import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt/select";
import { CompletionsCommand } from "@cliffy/command/completions";
import editCmd from "@src/commands/edit.ts";
import JournalFile from "@src/utils/JournalFile.ts";
import mdToJsonCmd from "@src/commands/md-to-json.ts";
import getGitTagName from "@src/utils/getGitTagName.ts";
// import { askCmd } from "./commands/ask.ts";
import startHeatMapTui from "@src/tui/heatmap.ts";
import countup from "@src/tui/countup.ts";

export type GlobalOptions = {
  journalDir: string;
};

await new Command()
  .name("nik")
  .version(await getGitTagName())
  .description("Nik - A CLI journaling tool")
  // TODO: make middleware to check if the folder exists or permission is fine
  .globalEnv("NIK_JOURNAL_DIR=<path:string>", "Directory for journal entries", {
    required: true,
    prefix: "NIK_",
  })
  .action(async ({ journalDir }) => {
    const search: string = await Select.prompt({
      message: "Pick a habit",
      options: [
        { name: "Meditation", value: "## Meditation" },
        { name: "Exercise", value: "## Exercise" },
      ],
    });
    if (search == "## Meditation") {
      const journalFile = await JournalFile.create({
        journalDir,
        template: "default",
      });
      journalFile.append(search);
      await startHeatMapTui(search, journalDir);
      // countup((current) => {
      //   journalFile.append(`time: ${current}s`);
      // });
    } else {
      await startHeatMapTui(search, journalDir);
    }
  })
  .command("edit", editCmd)
  // .command("habit", habitCmd)
  .command("md-to-json", mdToJsonCmd)
  .command("completions", new CompletionsCommand())
  .parse(Deno.args);
