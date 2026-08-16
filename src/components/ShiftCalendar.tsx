"use client";

import { Shift } from "@/lib/types";
import { YearMonth, daysInMonth } from "@/lib/date";

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function ShiftCalendar({
  month,
  shifts,
  onDelete,
}: {
  month: YearMonth;
  shifts: Shift[];
  onDelete: (id: string) => Promise<boolean | void>;
}) {
  const total = daysInMonth(month);
  const firstWeekday = new Date(month.year, month.month - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  const shiftsByDay = new Map<number, Shift[]>();
  for (const s of shifts) {
    const day = Number(s.date.split("-")[2]);
    shiftsByDay.set(day, [...(shiftsByDay.get(day) ?? []), s]);
  }

  const todayKey = new Date();
  const isCurrentMonth =
    todayKey.getFullYear() === month.year && todayKey.getMonth() + 1 === month.month;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid grid-cols-7 border-b border-line text-center text-xs text-muted">
        {WEEKDAYS_JA.map((w, i) => (
          <div
            key={w}
            className={`py-2 ${i === 0 ? "text-danger/80" : ""} ${i === 6 ? "text-blue-300/80" : ""}`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const dayShifts = day ? shiftsByDay.get(day) : undefined;
          const isToday = isCurrentMonth && day === todayKey.getDate();
          return (
            <div
              key={idx}
              className={`min-h-20 border-b border-r border-line/60 p-1.5 last:border-r-0 sm:min-h-24 ${
                day ? "" : "bg-black/10"
              }`}
            >
              {day && (
                <>
                  <div
                    className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-xs tabular ${
                      isToday ? "bg-accent text-black" : "text-muted"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayShifts?.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          if (window.confirm(`${s.start_time}–${s.end_time} のシフトを削除しますか？`)) {
                            onDelete(s.id);
                          }
                        }}
                        className="block w-full truncate rounded bg-accent-soft px-1 py-0.5 text-left text-[10px] tabular text-accent transition hover:bg-danger/20 hover:text-danger"
                        title="タップで削除"
                      >
                        {s.start_time}-{s.end_time}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
