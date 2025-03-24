import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import editCmd from "@src/commands/edit.ts";
import mdToJsonCmd from "@src/commands/md-to-json.ts";
import getGitTagName from "@src/utils/getGitTagName.ts";
// import { askCmd } from "./commands/ask.ts";
// import { helpCmd } from "./commands/help.ts";

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
  .command("completions", new CompletionsCommand())
  .command("edit", editCmd)
  .command("md-to-json", mdToJsonCmd)
  .parse(Deno.args);
