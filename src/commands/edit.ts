import { Command } from "@cliffy/command";
import { join } from "@std/path";
import { GlobalOptions } from "@src/main.ts";
import { getDateStr } from "@src/utils/dateSpec.ts";
import JournalFile from "@src/utils/JournalFile.ts";

export default new Command<GlobalOptions>()
  .description("Create or update a journal entry with a template")
  .arguments("[date:string]")
  .option("-t, --template <template:string>", "Template file path")
  .option("--no-template", "Create without a template")
  .option(
    "-e, --editor <editor:string>",
    "Editor command (defaults to $EDITOR or nano/notepad)",
  )
  .option("--no-open", "Do not open the entry in an editor")
  .env("EDITOR=<value:string>", "Editor command", { required: true })
  .action(async ({ editor, journalDir, template, open }, dateArg?: string) => {
    const dateStr = getDateStr(dateArg);
    const filePath = join(journalDir, `${dateStr}.md`);

    const journalFile = await JournalFile.create({
      journalDir,
      dateArg,
      template,
    });

    if (open) await journalFile.open(editor);
    console.log(`Journal entry for ${dateStr} is ready at: ${filePath}`);
  });
