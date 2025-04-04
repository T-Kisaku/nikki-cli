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
    "Path to a template file for new entries, in default NIK_JOURNAL_DIR/default.md",
  )
  .option(
    "--no-template",
    "Create the entry without a template",
  )
  .option(
    "-e, --editor <editor:string>",
    "Editor command to use (defaults to $EDITOR or nano/notepad)",
  )
  .option(
    "--no-open",
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
      await generateJournalFile({ filePath, template, journalDir, dateStr });
    }

    if (open) {
      await openWithEditor({ filePath, editor });
    }

    console.log(`Journal entry for ${dateStr} is ready at: ${filePath}`);
  });

// TODO: it's better that user can have access of defining their variable for template
// TODO: error handling
const generateJournalFile = async (
  { filePath, journalDir, template, dateStr }: {
    filePath: string;
    journalDir: string;
    template?: string | false;
    dateStr: string;
  },
) => {
  let content = "";
  let templatePath: string | null;

  if (template == false) {
    templatePath = null;
  } else if (template == undefined) {
    templatePath = getTemplatePath({ journalDir, template: "default" });
  } else {
    templatePath = getTemplatePath({ journalDir, template });
  }
  if (templatePath) {
    try {
      content = await Deno.readTextFile(templatePath);
      content = content.replaceAll("%date", dateStr);
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

const getTemplatePath = (
  { journalDir, template }: { journalDir: string; template: string },
) => join(journalDir, "template", `${template}.md`);

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
