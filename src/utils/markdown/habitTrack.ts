import { walk } from "@std/fs";
import { basename, dirname } from "@std/path";

// 指定の見出しを含むかチェック
async function containsHeading(
  filePath: string,
  heading: string,
): Promise<boolean> {
  const content = await Deno.readTextFile(filePath);
  return content.includes(heading);
}

// 見出しを含む日付ファイル名を取得
export async function findDatedFilesWithHeading(
  heading: string,
  directory: string,
): Promise<string[]> {
  const matchedDates: string[] = [];

  for await (
    const entry of walk(directory, { exts: [".md"], includeDirs: false })
  ) {
    if (dirname(entry.path).includes("template")) continue; // templateディレクトリ除外

    const filename = basename(entry.path);
    const datePattern = /^\d{4}-\d{2}-\d{2}\.md$/;

    if (datePattern.test(filename)) {
      const found = await containsHeading(entry.path, heading);
      if (found) {
        matchedDates.push(filename.replace(".md", ""));
      }
    }
  }

  return matchedDates;
}

export function countRestarts(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = dates
    .map((d) => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());

  let restarts = 1; // 最初の日は再開扱い

  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i].getTime() - sorted[i - 1].getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff > 1) restarts++;
  }

  return restarts;
}
