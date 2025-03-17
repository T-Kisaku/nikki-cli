import { Command } from "@cliffy/command";
import { join } from "@std/path";
import { GlobalOptions } from "@src/main.ts";
import { getDateStr } from "@src/utils/dateSpec.ts";

export default new Command<GlobalOptions>()
  .description(
    "Create or modify a journal entry for a specific date with template support",
  )
  .arguments("[date:string]")
  .option(
    "-t, --template <template:string>",
    "Path to a template file for new entries",
  )
  .option(
    "-e, --editor <editor:string>",
    "Editor command to use (defaults to $EDITOR or nano/notepad)",
  )
  .option(
    "-n, --no-open",
    "Create/update the entry without opening it in an editor",
  )
  .env("EDITOR=<value:string>", "Editor command to use", {
    required: true,
  })
  .action(async ({ editor, journalDir, template, open }, dateArg?: string) => {
    const dateStr = getDateStr(dateArg);
    const filePath = join(journalDir, `${dateStr}.md`);

    let isNewFile = false;
    try {
      await Deno.stat(filePath);
    } catch {
      isNewFile = true;
    }
    if (isNewFile) {
      await generateJournalFile({ filePath, template, journalDir });
    }

    if (open) {
      await openWithEditor({ filePath, editor });
    }

    console.log(`Journal entry for ${dateStr} is ready at: ${filePath}`);
  });

// TODO: it's better that user can have access of defining their variable for template
// TODO: error handling
const generateJournalFile = async (
  { filePath, journalDir, template }: {
    filePath: string;
    journalDir: string;
    template?: string;
  },
) => {
  const templatePath = template
    ? join(journalDir, "template", `${template}.md`)
    : "";
  let content = "";
  if (templatePath) {
    try {
      content = await Deno.readTextFile(templatePath);
    } catch {
      console.error(
        "Error: Could not read template file:",
        templatePath,
      );
      Deno.exit(1);
    }
  }
  try {
    await Deno.writeTextFile(filePath, content);
  } catch {
    console.error(
      "Error: Failed to write journal entry file:",
    );
    Deno.exit(1);
  }
};

// TODO: error handling
const openWithEditor = async (
  { filePath, editor }: { filePath: string; editor?: string },
) => {
  // TODO: think about editor config later
  const editorCmd = editor ||
    Deno.env.get("EDITOR") ||
    Deno.env.get("VISUAL") ||
    (Deno.build.os === "windows" ? "notepad" : "nano");
  try {
    const editCmd = new Deno.Command(editorCmd, {
      args: [filePath],
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });
    const { success, code } = await editCmd.output();
    if (success) {
      console.error(`Warning: The editor exited with code ${code}.`);
    }
  } catch {
    console.error(
      "Error: Failed to launch editor. Ensure $EDITOR is set or an editor is available.",
    );
    Deno.exit(1);
  }
};
