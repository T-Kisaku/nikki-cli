import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import editCmd from "@src/commands/edit.ts";
import getGitTagName from "@src/utils/getGitTagName.ts";
// import { askCmd } from "./commands/ask.ts";
import habitCmd from "@src/commands/habit.ts";

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
  // .action(async ({ journalDir }) => {
  //   const search: string = await Select.prompt({
  //     message: "Pick a habit",
  //     options: [
  //       { name: "Meditation", value: "## Meditation" },
  //       { name: "Exercise", value: "## Exercise" },
  //     ],
  //   });
  //   if (search == "## Meditation") {
  //     const journalFile = await JournalFile.create({
  //       journalDir,
  //       template: "default",
  //     });
  //     journalFile.append(search);
  //     await startHeatMapTui(search, journalDir);
  //     // countup((current) => {
  //     //   journalFile.append(`time: ${current}s`);
  //     // });
  //   } else {
  //     await startHeatMapTui(search, journalDir);
  //   }
  // })
  .command("edit", editCmd)
  .command("habit", habitCmd)
  .command("completions", new CompletionsCommand())
  .parse(Deno.args);
