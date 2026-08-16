"use client";

import { useState } from "react";
import { Shift } from "@/lib/types";
import { formatDateJa } from "@/lib/date";
import { computeShiftBreakdown } from "@/lib/payroll";

export function ShiftList({
  shifts,
  onDelete,
}: {
  shifts: Shift[];
  onDelete: (id: string) => Promise<boolean | void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (shifts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center text-sm text-muted">
        この月のシフトはまだありません
      </div>
    );
  }

  async function handleDelete(id: string) {
    if (!window.confirm("このシフトを削除しますか？")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  return (
    <ul className="space-y-2">
      {shifts.map((shift) => {
        const { workedMinutes, nightMinutes } = computeShiftBreakdown(shift);
        const workedHours = (workedMinutes / 60).toFixed(1);
        const nightHours = nightMinutes / 60;
        return (
          <li
            key={shift.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {formatDateJa(shift.date)}
                </span>
                <span className="tabular text-sm text-muted">
                  {shift.start_time}–{shift.end_time}
                </span>
                {shift.break_min > 0 && (
                  <span className="text-xs text-muted">休憩{shift.break_min}分</span>
                )}
              </div>
              <div className="mt-1 text-xs tabular text-muted">
                実働 {workedHours}h
                {nightHours > 0.01 && (
                  <span className="text-accent"> ・深夜 {nightHours.toFixed(1)}h</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(shift.id)}
              disabled={deletingId === shift.id}
              className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
            >
              {deletingId === shift.id ? "削除中…" : "削除"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
