import { CompletionsCommand } from "@cliffy/command/completions";
import getGitTagName from "@src/utils/getGitTagName.ts";
import habitCmd from "@src/commands/habit.ts";

await habitCmd
  .name("nik")
  .version(await getGitTagName())
  .command("completions", new CompletionsCommand())
  .parse(Deno.args);
