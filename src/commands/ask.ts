// import { Command } from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts";
// import { join } from "https://deno.land/std@0.186.0/path/mod.ts";
//
// export const askCmd = new Command()
//   .description("Query journal entries with flexible date filtering")
//   .arguments("[...query:string]")
//   .option("-f, --from <date:string>", "Start date (inclusive) for filtering")
//   .option("-t, --to <date:string>", "End date (inclusive) for filtering")
//   .option(
//     "-o, --on <date:string>",
//     "Filter entries on a specific date (shorthand for --from and --to of the same day)",
//   )
//   .action(async (options, ...queryWords: string[]) => {
//     const query = queryWords.join(" ").toLowerCase(); // search query (case-insensitive)
//     const journalDir = Deno.env.get("NIK_JOURNAL_DIR") || "./journal";
//
//     // Parse date filters
//     let fromDate: Date | undefined;
//     let toDate: Date | undefined;
//     if (options.on) {
//       // If a specific date is given with --on, use it for both from and to
//       try {
//         fromDate = parseDateOption(options.on);
//         toDate = new Date(fromDate.getTime());
//       } catch (err) {
//         console.error(err.message);
//         Deno.exit(1);
//       }
//     } else {
//       if (options.from) {
//         try {
//           fromDate = parseDateOption(options.from);
//         } catch (err) {
//           console.error(err.message);
//           Deno.exit(1);
//         }
//       }
//       if (options.to) {
//         try {
//           toDate = parseDateOption(options.to);
//         } catch (err) {
//           console.error(err.message);
//           Deno.exit(1);
//         }
//       }
//     }
//
//     // Ensure the journal directory exists
//     try {
//       await Deno.stat(journalDir);
//     } catch {
//       console.error("Error: Journal directory not found:", journalDir);
//       Deno.exit(1);
//     }
//
//     // Scan the journal directory for entries within the date range
//     const results: Array<{ date: string; content: string }> = [];
//     for await (const entry of Deno.readDir(journalDir)) {
//       if (!entry.isFile || !entry.name.toLowerCase().endsWith(".md")) continue;
//       // Expect file names starting with YYYY-MM-DD
//       const name = entry.name;
//       const datePart = name.slice(0, name.indexOf(".md")); // strip extension
//       if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) continue; // skip files that don't follow date format
//       const entryDate = new Date(datePart);
//       if (isNaN(entryDate.getTime())) continue; // skip if date is invalid
//
//       // Apply date range filters
//       if (fromDate && entryDate < fromDate) continue;
//       if (toDate && entryDate > toDate) continue;
//
//       // Read file content
//       let content = "";
//       const filePath = join(journalDir, name);
//       try {
//         content = await Deno.readTextFile(filePath);
//       } catch (err) {
//         console.error("Warning: Could not read file:", name, "-", err.message);
//         continue;
//       }
//
//       // If a query string is provided, filter by content
//       if (query && !content.toLowerCase().includes(query)) {
//         continue;
//       }
//
//       results.push({ date: datePart, content });
//     }
//
//     // Sort results by date
//     results.sort((a, b) => a.date.localeCompare(b.date));
//
//     // Output the results
//     if (results.length === 0) {
//       console.log("No journal entries found for the given criteria.");
//     } else {
//       for (const entry of results) {
//         console.log(`\n=== ${entry.date} ===\n${entry.content}\n`);
//       }
//     }
//   });
//
// // Helper to parse a date string or relative term into a Date object
// function parseDateOption(dateStr: string): Date {
//   const ds = dateStr.toLowerCase();
//   if (ds === "today") {
//     return new Date();
//   }
//   if (ds === "yesterday") {
//     return new Date(Date.now() - 24 * 60 * 60 * 1000);
//   }
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
//     throw new Error(
//       "Error: Date must be in YYYY-MM-DD format (or 'today'/'yesterday').",
//     );
//   }
//   const d = new Date(ds);
//   if (isNaN(d.getTime())) {
//     throw new Error("Error: Invalid date provided.");
//   }
//   return d;
// }
