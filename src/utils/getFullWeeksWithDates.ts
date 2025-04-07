/**
 * @arg yearMonth: string YYYY-MM
 */
export default (yearMonth?: string): string[][] => {
  const now = yearMonth ? new Date(yearMonth) : new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 曜日（0:日〜6:土）

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  // 前月の日付を補完
  if (firstDayOfWeek !== 0) {
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(prevYear, prevMonth, prevMonthLastDate - i);
      currentWeek.push(date.toISOString().slice(0, 10));
    }
  }

  // 今月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    currentWeek.push(date.toISOString().slice(0, 10));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // 翌月で埋める
  if (currentWeek.length > 0) {
    const nextMonth = (month + 1) % 12;
    const nextYear = month === 11 ? year + 1 : year;
    let nextDay = 1;

    while (currentWeek.length < 7) {
      const date = new Date(nextYear, nextMonth, nextDay++);
      currentWeek.push(date.toISOString().slice(0, 10));
    }

    weeks.push(currentWeek);
  }

  return weeks;
};
