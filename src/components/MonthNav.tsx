"use client";

import { YearMonth, addMonths, formatYearMonth } from "@/lib/date";

export function MonthNav({
  month,
  onChange,
}: {
  month: YearMonth;
  onChange: (m: YearMonth) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <button
        type="button"
        onClick={() => onChange(addMonths(month, -1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-accent hover:text-accent"
        aria-label="前月"
      >
        ‹
      </button>
      <div className="text-base font-semibold tabular text-foreground">
        {formatYearMonth(month)}
      </div>
      <button
        type="button"
        onClick={() => onChange(addMonths(month, 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition hover:border-accent hover:text-accent"
        aria-label="翌月"
      >
        ›
      </button>
    </div>
  );
}
