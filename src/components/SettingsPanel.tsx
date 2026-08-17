"use client";

import { useEffect, useState } from "react";
import { Settings, TaxType } from "@/lib/types";

function NumberField({
  label,
  value,
  onChange,
  suffix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-line bg-surface-raised px-2.5 py-2 text-sm tabular text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
        {suffix && <span className="shrink-0 text-xs text-muted">{suffix}</span>}
      </div>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm text-foreground">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
    </label>
  );
}

export function SettingsPanel({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (s: Settings) => Promise<boolean | void>;
}) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [overrideEnabled, setOverrideEnabled] = useState(settings.tax_override != null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync local draft when saved settings reload from server
    setDraft(settings);
    setOverrideEnabled(settings.tax_override != null);
  }, [settings]);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const payload: Settings = {
      ...draft,
      tax_override: overrideEnabled ? draft.tax_override : null,
    };
    const ok = await onSave(payload);
    setSaving(false);
    if (ok !== false) setSaved(true);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium text-foreground sm:px-5"
      >
        <span>⚙ 給与計算の設定</span>
        <span className="text-muted">{open ? "閉じる ▲" : "開く ▼"}</span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-line px-4 py-4 sm:px-5">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="時給" value={draft.wage} onChange={(v) => update("wage", v)} suffix="円" />
            <NumberField
              label="深夜割増率"
              value={draft.night_rate}
              onChange={(v) => update("night_rate", v)}
              suffix="%"
              step={0.1}
            />
          </div>

          <div>
            <Toggle
              label="社会保険に加入している"
              checked={draft.enrolled_shakai_hoken}
              onChange={(v) => update("enrolled_shakai_hoken", v)}
            />
            {draft.enrolled_shakai_hoken && (
              <div className="mt-2 space-y-2 rounded-lg bg-surface-raised p-3">
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="健康保険料率"
                    value={draft.health_ins_rate}
                    onChange={(v) => update("health_ins_rate", v)}
                    suffix="%"
                    step={0.01}
                  />
                  <NumberField
                    label="厚生年金保険料率"
                    value={draft.pension_rate}
                    onChange={(v) => update("pension_rate", v)}
                    suffix="%"
                    step={0.01}
                  />
                </div>
                <Toggle
                  label="40歳以上（介護保険料を加算）"
                  checked={draft.over40}
                  onChange={(v) => update("over40", v)}
                />
                <p className="text-[11px] leading-relaxed text-muted">
                  ※ 子ども・子育て拠出金（{"0.12"}%）も自動的に控除に含まれます
                </p>
              </div>
            )}
          </div>

          <div>
            <Toggle
              label="雇用保険に加入している"
              checked={draft.enrolled_koyou}
              onChange={(v) => update("enrolled_koyou", v)}
            />
            {draft.enrolled_koyou && (
              <div className="mt-2 rounded-lg bg-surface-raised p-3">
                <NumberField
                  label="雇用保険料率"
                  value={draft.koyou_rate}
                  onChange={(v) => update("koyou_rate", v)}
                  suffix="%"
                  step={0.01}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted">所得税（源泉徴収）の概算方法</p>
            <div className="flex gap-2">
              {(["kou", "otsu", "flat"] as TaxType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("tax_type", t)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    draft.tax_type === t
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-muted hover:text-foreground"
                  }`}
                >
                  {t === "kou" ? "甲欄" : t === "otsu" ? "乙欄" : "定率"}
                </button>
              ))}
            </div>
            {draft.tax_type === "kou" && (
              <NumberField
                label="扶養人数"
                value={draft.dependents}
                onChange={(v) => update("dependents", v)}
                suffix="人"
              />
            )}
            {draft.tax_type === "flat" && (
              <p className="text-[11px] leading-relaxed text-muted">
                総支給額の1.3%を所得税として概算します。
              </p>
            )}

            <div className="rounded-lg bg-surface-raised p-3">
              <Toggle
                label="所得税額を手動で入力する"
                checked={overrideEnabled}
                onChange={(v) => {
                  setOverrideEnabled(v);
                  setSaved(false);
                }}
              />
              {overrideEnabled && (
                <div className="mt-2">
                  <NumberField
                    label="所得税額（優先されます）"
                    value={draft.tax_override ?? 0}
                    onChange={(v) => update("tax_override", v)}
                    suffix="円"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "保存中…" : saved ? "保存しました ✓" : "設定を保存"}
          </button>
        </div>
      )}
    </div>
  );
}
