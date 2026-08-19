"use client";

import { useState } from "react";
import { NewShift } from "@/lib/types";

interface DraftShift extends NewShift {
  key: string;
  include: boolean;
}

export function ShiftImageImport({
  onAddShifts,
}: {
  onAddShifts: (shifts: NewShift[]) => Promise<boolean | void>;
}) {
  const [open, setOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftShift[] | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setDrafts(null);
    setError(null);
    setAnalyzing(false);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleFile(file: File) {
    setError(null);
    setAnalyzing(true);
    setDrafts(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/parse-shift-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "解析に失敗しました。");
      }
      const shifts: NewShift[] = data.shifts ?? [];
      if (shifts.length === 0) {
        setError("シフトを読み取れませんでした。別の画像でお試しください。");
      } else {
        setDrafts(
          shifts.map((s, i) => ({
            ...s,
            key: `${i}-${s.date}-${s.start_time}`,
            include: true,
          }))
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析に失敗しました。");
    } finally {
      setAnalyzing(false);
    }
  }

  function updateDraft(key: string, patch: Partial<DraftShift>) {
    setDrafts((prev) => (prev ? prev.map((d) => (d.key === key ? { ...d, ...patch } : d)) : prev));
  }

  function removeDraft(key: string) {
    setDrafts((prev) => (prev ? prev.filter((d) => d.key !== key) : prev));
  }

  async function handleConfirm() {
    if (!drafts) return;
    const selected = drafts.filter((d) => d.include);
    if (selected.length === 0) return;
    setSaving(true);
    const ok = await onAddShifts(
      selected.map(({ date, start_time, end_time, break_min }) => ({
        date,
        start_time,
        end_time,
        break_min,
      }))
    );
    setSaving(false);
    if (ok !== false) close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-line px-4 py-2.5 text-sm text-muted transition hover:border-accent hover:text-accent sm:w-auto"
      >
        📷 画像から読み込む
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">画像からシフトを読み込む</h2>
              <button
                type="button"
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            {!drafts && (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-muted">
                  シフト表の写真やスクリーンショットを選択すると、AIが日付・時刻を読み取って一覧に起こします。内容は追加前に必ず確認・修正できます。
                </p>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface-raised px-4 py-8 text-sm text-muted transition hover:border-accent hover:text-accent">
                  {analyzing ? "解析中…" : "タップして画像を選択"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={analyzing}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
                {error && (
                  <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {error}
                  </p>
                )}
              </div>
            )}

            {drafts && (
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  {drafts.length}件のシフトを検出しました。内容を確認し、不要なものはチェックを外すか削除してください。
                </p>
                <div className="space-y-2">
                  {drafts.map((d) => (
                    <div
                      key={d.key}
                      className="rounded-xl border border-line bg-surface-raised p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-muted">
                          <input
                            type="checkbox"
                            checked={d.include}
                            onChange={(e) => updateDraft(d.key, { include: e.target.checked })}
                            className="h-4 w-4 accent-[var(--color-accent)]"
                          />
                          追加する
                        </label>
                        <button
                          type="button"
                          onClick={() => removeDraft(d.key)}
                          className="text-xs text-muted hover:text-danger"
                        >
                          削除
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <input
                          type="date"
                          value={d.date}
                          onChange={(e) => updateDraft(d.key, { date: e.target.value })}
                          className="col-span-2 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent sm:col-span-1"
                        />
                        <input
                          type="time"
                          value={d.start_time}
                          onChange={(e) => updateDraft(d.key, { start_time: e.target.value })}
                          className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs tabular text-foreground outline-none focus:border-accent"
                        />
                        <input
                          type="time"
                          value={d.end_time}
                          onChange={(e) => updateDraft(d.key, { end_time: e.target.value })}
                          className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs tabular text-foreground outline-none focus:border-accent"
                        />
                        <input
                          type="number"
                          min={0}
                          step={5}
                          value={d.break_min}
                          onChange={(e) => updateDraft(d.key, { break_min: Number(e.target.value) })}
                          className="rounded-lg border border-line bg-surface px-2 py-1.5 text-xs tabular text-foreground outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg border border-line px-4 py-2.5 text-sm text-muted hover:text-foreground"
                  >
                    やり直す
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={saving || drafts.every((d) => !d.include)}
                    className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "追加中…" : `選択した${drafts.filter((d) => d.include).length}件を追加`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
