import { Command } from "@cliffy/command";
import { CompletionsCommand } from "@cliffy/command/completions";
import getGitTagName from "@src/utils/getGitTagName.ts";
import habitCmd from "@src/commands/habit.ts";
import updateCmd from "@src/commands/update.ts";

await new Command()
  .name("nik")
  .version(await getGitTagName())
  .command("habit", habitCmd)
  .command("update", updateCmd)
  .command("completions", new CompletionsCommand())
  .parse(Deno.args);
