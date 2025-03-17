interface DateSpec {
  year?: number;
  month?: number;
  date?: number;
}

export const getDateStr = (dateArg?: string) => {
  return dateSpecToStr(strToDateSpec(dateArg));
};

const strToDateSpec = (dateArg?: string): DateSpec => {
  const date = new Date();
  const dateStr = dateArg ? dateArg.trim() : "";

  let dateSpec: DateSpec = {};

  switch (dateStr.toLowerCase()) {
    case "yesterday":
      date.setDate(date.getDate() - 1);
      break;
    case "tomorrow":
      date.setDate(date.getDate() + 1);
      break;
    case "today":
    case "":
      break;
    default:
      return isoStringToDateSpec(dateStr);
  }

  dateSpec = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    date: date.getDate(),
  };
  return dateSpec;
};

const isoStringToDateSpec = (dateStr: string): DateSpec => {
  const fullDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const yearMonthRegex = /^\d{4}-\d{2}$/;
  const yearRegex = /^\d{4}$/;

  if (fullDateRegex.test(dateStr)) {
    const [year, month, date] = dateStr.split("-").map(Number);
    return { year, month, date };
  }

  if (yearMonthRegex.test(dateStr)) {
    const [year, month] = dateStr.split("-").map(Number);
    return { year, month };
  }

  if (yearRegex.test(dateStr)) {
    return { year: Number(dateStr) };
  }

  console.error(
    "Error: Date must be in YYYY-MM-DD format (or 'today'/'yesterday').",
  );

  Deno.exit(1);
};

const addZero = (num: number) => {
  return num < 10 ? `0${num}` : num;
};

const dateSpecToStr = (dateSpec: DateSpec) => {
  const { year, month, date } = dateSpec;

  if (year && month && date) {
    return `${year}-${addZero(month)}-${addZero(date)}`;
  }
  if (year && month) {
    return `${year}-${addZero(month)}`;
  }
  if (year) {
    return `${year}`;
  }

  // TODO: better error handling
  console.error(
    "Error: Date must be in YYYY-MM-DD format (or 'today'/'yesterday').",
  );
  Deno.exit(1);
};
