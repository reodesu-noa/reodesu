"use client";

import { useState } from "react";
import { NewShift, Shift } from "@/lib/types";
import { YearMonth } from "@/lib/date";
import { ShiftForm } from "./ShiftForm";
import { ShiftList } from "./ShiftList";
import { ShiftCalendar } from "./ShiftCalendar";

type ViewMode = "list" | "calendar";

export function ShiftsTab({
  month,
  shifts,
  loading,
  error,
  onAdd,
  onDelete,
}: {
  month: YearMonth;
  shifts: Shift[];
  loading: boolean;
  error: string | null;
  onAdd: (shift: NewShift) => Promise<boolean | void>;
  onDelete: (id: string) => Promise<boolean | void>;
}) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="space-y-4">
      <ShiftForm onAdd={onAdd} />

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted">シフト一覧</h2>
        <div className="flex rounded-lg border border-line bg-surface p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-md px-3 py-1.5 transition ${
              view === "list" ? "bg-accent text-black" : "text-muted hover:text-foreground"
            }`}
          >
            リスト
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-md px-3 py-1.5 transition ${
              view === "calendar" ? "bg-accent text-black" : "text-muted hover:text-foreground"
            }`}
          >
            カレンダー
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-muted">読み込み中…</div>
      ) : view === "list" ? (
        <ShiftList shifts={shifts} onDelete={onDelete} />
      ) : (
        <ShiftCalendar month={month} shifts={shifts} onDelete={onDelete} />
      )}
    </div>
  );
}
