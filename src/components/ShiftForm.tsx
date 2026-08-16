"use client";

import { FormEvent, useState } from "react";
import { NewShift } from "@/lib/types";
import { todayStr } from "@/lib/date";

export function ShiftForm({
  onAdd,
  defaultDate,
}: {
  onAdd: (shift: NewShift) => Promise<boolean | void>;
  defaultDate?: string;
}) {
  const [date, setDate] = useState(defaultDate ?? todayStr());
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("06:00");
  const [breakMin, setBreakMin] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date || !startTime || !endTime) return;
    setSubmitting(true);
    await onAdd({ date, start_time: startTime, end_time: endTime, break_min: breakMin });
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-surface p-4 sm:p-5"
    >
      <h2 className="mb-3 text-sm font-semibold text-muted">シフトを追加</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="col-span-2 flex flex-col gap-1 text-xs text-muted sm:col-span-1">
          日付
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-line bg-surface-raised px-2.5 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          開始
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg border border-line bg-surface-raised px-2.5 py-2 text-sm tabular text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          終了
          <input
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-lg border border-line bg-surface-raised px-2.5 py-2 text-sm tabular text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          休憩(分)
          <input
            type="number"
            min={0}
            step={5}
            value={breakMin}
            onChange={(e) => setBreakMin(Number(e.target.value))}
            className="rounded-lg border border-line bg-surface-raised px-2.5 py-2 text-sm tabular text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "追加中…" : "＋ シフトを追加"}
      </button>
    </form>
  );
}
