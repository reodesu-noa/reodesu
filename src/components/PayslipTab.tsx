"use client";

import { useMemo } from "react";
import { Settings, Shift } from "@/lib/types";
import { YearMonth } from "@/lib/date";
import { computeMonthlyPayroll } from "@/lib/payroll";
import { PayslipReceipt } from "./PayslipReceipt";
import { SettingsPanel } from "./SettingsPanel";

export function PayslipTab({
  month,
  shifts,
  settings,
  loading,
  onSaveSettings,
}: {
  month: YearMonth;
  shifts: Shift[];
  settings: Settings | null;
  loading: boolean;
  onSaveSettings: (s: Settings) => Promise<boolean | void>;
}) {
  const summary = useMemo(() => {
    if (!settings) return null;
    return computeMonthlyPayroll(shifts, settings);
  }, [shifts, settings]);

  if (loading || !settings || !summary) {
    return <div className="py-10 text-center text-sm text-muted">読み込み中…</div>;
  }

  return (
    <div className="space-y-5">
      <PayslipReceipt month={month} summary={summary} />
      <SettingsPanel settings={settings} onSave={onSaveSettings} />
    </div>
  );
}
