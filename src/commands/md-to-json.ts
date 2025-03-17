import { Command } from "@cliffy/command";
import { parse } from "@std/path";
import { GlobalOptions } from "@src/main.ts";
import markdownParser from "@src/utils/markdownParser.ts";

export default new Command<GlobalOptions>()
  .description("Convert Markdown journal files into JSON format")
  .option(
    "-i, --input <path:string>",
    "Markdown file or directory to convert (default: journal directory)",
  )
  .option(
    "-o, --output <path:string>",
    "Output JSON file (if not provided, prints JSON to stdout)",
  )
  .action(async ({ input, output, journalDir }) => {
    const inputPath = input || journalDir;
    const stat = await Deno.stat(inputPath);
    const data: OutputData = {};
    if (stat.isDirectory) {
      await processDirectory(inputPath, data);
    } else {
      await processFile(inputPath, data);
    }
    outputJson({ data: data, output });
  });

interface OutputData {
  [year: number]: {
    "last-edited": Date;
    content: ReturnType<typeof markdownParser> | null;
    [month: number]: {
      "last-edited": Date;
      content: ReturnType<typeof markdownParser> | null;
      [date: number]: {
        "last-edited": Date;
        content: ReturnType<typeof markdownParser> | null;
      };
    };
  };
}

async function processFile(filePath: string, data: OutputData) {
  const stat = await Deno.stat(filePath);
  if (!stat.isFile) return;

  const content = await Deno.readTextFile(filePath);
  const parsedContent = markdownParser(content);
  const lastEdited = stat.mtime ?? new Date();

  const { name } = parse(filePath);
  const dateParts = name.split("-").map(Number);

  if (dateParts.includes(NaN)) {
    return;
  } else if (dateParts.length === 1) { // YYYY
    const [year] = dateParts;
    data[year] ??= { "last-edited": lastEdited, content: parsedContent };
    data[year]["last-edited"] ??= lastEdited;
    data[year]["content"] ??= parsedContent;
  } else if (dateParts.length === 2) { // YYYY-MM
    const [year, month] = dateParts;
    data[year] ??= { "last-edited": lastEdited, content: null };
    data[year][month]["last-edited"] ??= lastEdited;
    data[year][month]["content"] ??= parsedContent;
  } else if (dateParts.length === 3) { // YYYY-MM-DD
    const [year, month, day] = dateParts;
    data[year] ??= { "last-edited": lastEdited, content: null };
    data[year][month] ??= { "last-edited": lastEdited, content: null };
    data[year][month][day] = {
      "last-edited": lastEdited,
      content: parsedContent,
    };
  }
}

async function processDirectory(dirPath: string, data: OutputData) {
  for await (const entry of Deno.readDir(dirPath)) {
    const fullPath = `${dirPath}/${entry.name}`;
    if (entry.isFile) {
      await processFile(fullPath, data);
    } else if (entry.isDirectory) {
      await processDirectory(fullPath, data);
    }
  }
}

const outputJson = async (
  { data, output }: { data: OutputData; output?: string },
) => {
  const jsonString = JSON.stringify(data, null, 2);
  if (output) {
    try {
      await Deno.writeTextFile(output, jsonString);
      console.log("JSON output written to", output);
    } catch {
      console.error("Error: Failed to write output file:", output);
      Deno.exit(1);
    }
  } else {
    console.log(jsonString);
  }
};
