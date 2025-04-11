import { join } from "@std/path";
import { getDateStr } from "@src/utils/dateSpec.ts";

export default class JournalFile {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  static async create({
    journalDir,
    dateArg,
    template,
  }: {
    journalDir: string;
    dateArg?: string;
    template?: string | false;
  }): Promise<JournalFile> {
    const dateStr = getDateStr(dateArg);
    const filePath = join(journalDir, `${dateStr}.md`);
    try {
      await Deno.stat(filePath);
    } catch {
      // File doesn't exist: generate it
      const content = await this.buildContent({
        journalDir,
        template,
        dateStr,
      });
      await this.saveContent(filePath, content, false);
    }
    return new JournalFile(filePath);
  }

  private static async buildContent({
    journalDir,
    template,
    dateStr,
  }: {
    journalDir: string;
    template?: string | false;
    dateStr: string;
  }): Promise<string> {
    let content = "";
    const templatePath = template === false
      ? null
      : JournalFile.getTemplatePath({
        journalDir,
        template: template ?? "default",
      });
    if (templatePath) {
      try {
        content = await Deno.readTextFile(templatePath);
        content = content.replaceAll("%date", dateStr);
      } catch {
        console.error("Error: Could not read template file:", templatePath);
        Deno.exit(1);
      }
    }
    return content;
  }

  private static async saveContent(
    filePath: string,
    content: string,
    append: boolean,
  ): Promise<void> {
    try {
      if (append) {
        const file = await Deno.open(filePath, {
          append: true,
          create: true,
          write: true,
        });
        await file.write(new TextEncoder().encode(content));
        file.close();
      } else {
        await Deno.writeTextFile(filePath, content);
      }
    } catch (error) {
      console.error("Error: Failed to save journal file:", error);
      Deno.exit(1);
    }
  }

  private static getTemplatePath({
    journalDir,
    template,
  }: {
    journalDir: string;
    template: string;
  }): string {
    return join(journalDir, "template", `${template}.md`);
  }

  async append(content: string): Promise<this> {
    await JournalFile.saveContent(this.filePath, content, true);
    return this;
  }

  async overwrite(content: string): Promise<this> {
    await JournalFile.saveContent(this.filePath, content, false);
    return this;
  }

  async open(editor?: string): Promise<this> {
    const editorCmd = editor ||
      Deno.env.get("EDITOR") ||
      Deno.env.get("VISUAL") ||
      (Deno.build.os === "windows" ? "notepad" : "nano");
    try {
      const cmd = new Deno.Command(editorCmd, {
        args: [this.filePath],
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });
      const { success, code } = await cmd.output();
      if (!success) {
        console.error(`Warning: Editor exited with code ${code}.`);
      }
    } catch {
      console.error("Error: Failed to launch editor. Ensure $EDITOR is set.");
      Deno.exit(1);
    }
    return this;
  }
}
