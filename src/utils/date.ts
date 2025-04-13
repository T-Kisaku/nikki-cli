import { difference, format } from "@std/datetime";
interface DateRange {
  first: Date;
  last: Date;
}

export function getCalendarDates(date: Date, range: "month"): Date[] {
  switch (range) {
    case "month":
      return getDatesInRange(expandMonthRange(getMonthRange(date)));
  }
}

export function divide<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

function getMonthRange(date: Date): DateRange {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  // Setting day 0 of the next month gives the last day of the current month.
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { first, last };
}

function expandMonthRange(range: DateRange): DateRange {
  const expandedFirst = new Date(range.first);
  const expandedLast = new Date(range.last);

  // Adjust the first date backward to the previous Sunday.
  const startDay = expandedFirst.getDay();
  expandedFirst.setDate(expandedFirst.getDate() - startDay);

  // Adjust the last date forward to the next Sunday, if needed.
  const endDay = expandedLast.getDay();
  if (endDay !== 0) {
    expandedLast.setDate(expandedLast.getDate() + (7 - endDay - 1));
  }

  return { first: expandedFirst, last: expandedLast };
}

function getDatesInRange(range: DateRange): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(range.first);
  currentDate.setHours(0, 0, 0, 0);
  const lastDate = new Date(range.last);
  lastDate.setHours(0, 0, 0, 0);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export function countRestartDays(dates: Date[]): number {
  if (dates.length === 0) return 0;

  // Sort dates and remove duplicates (comparing year, month, date)
  const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
  const unique = sorted.filter((d, i) => {
    if (i === 0) return true;
    const prev = sorted[i - 1];
    return difference(d, prev).days;
  });

  let count = 1; // first date always starts a new streak
  for (let i = 1; i < unique.length; i++) {
    const prev = unique[i - 1];
    const curr = unique[i];
    // Calculate difference in whole days
    if (difference(curr, prev).days || 0 > 1) {
      count++;
    }
  }
  return count;
}

export function countUniqueDays(dates: Date[]): number {
  // Use toDateString() to ignore time differences.
  const uniqueDays = new Set(dates.map((date) => date.toDateString()));
  return uniqueDays.size;
}
