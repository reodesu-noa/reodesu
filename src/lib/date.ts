// Month is represented as { year, month } where month is 1-12.
export interface YearMonth {
  year: number;
  month: number;
}

export function currentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

export function formatYearMonth({ year, month }: YearMonth): string {
  return `${year}年${month}月`;
}

export function yearMonthKey({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// [start, end) as YYYY-MM-DD strings, end is first day of next month
export function monthRange({ year, month }: YearMonth): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const next = addMonths({ year, month }, 1);
  const end = `${next.year}-${String(next.month).padStart(2, "0")}-01`;
  return { start, end };
}

export function daysInMonth({ year, month }: YearMonth): number {
  return new Date(year, month, 0).getDate();
}

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function weekdayJa(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return WEEKDAYS_JA[new Date(y, m - 1, d).getDay()];
}

export function formatDateJa(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}/${d}(${weekdayJa(dateStr)})`;
}

export function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}
