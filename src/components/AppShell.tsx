"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useShifts } from "@/hooks/useShifts";
import { useSettings } from "@/hooks/useSettings";
import { currentYearMonth } from "@/lib/date";
import { MonthNav } from "./MonthNav";
import { ShiftsTab } from "./ShiftsTab";
import { PayslipTab } from "./PayslipTab";

type Tab = "payslip" | "shifts";

export function AppShell() {
  const { user, signOut } = useAuth();
  const [month, setMonth] = useState(currentYearMonth());
  const [tab, setTab] = useState<Tab>("payslip");

  const {
    shifts,
    loading: shiftsLoading,
    error: shiftsError,
    addShift,
    addShifts,
    deleteShift,
  } = useShifts(user?.id ?? null, month);
  const { settings, loading: settingsLoading, saveSettings } = useSettings(user?.id ?? null);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-3 pb-10 sm:px-6">
      <header className="flex items-center justify-between py-4 sm:py-6">
        <div>
          <h1 className="text-base font-semibold text-foreground">給与シフト管理</h1>
          <p className="mt-0.5 truncate text-xs text-muted">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent"
        >
          ログアウト
        </button>
      </header>

      <nav className="mb-4 flex rounded-xl border border-line bg-surface p-1 text-sm">
        {(
          [
            ["payslip", "給与明細"],
            ["shifts", "シフト表"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 font-medium transition ${
              tab === key ? "bg-accent text-black" : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mb-4">
        <MonthNav month={month} onChange={setMonth} />
      </div>

      <main className="flex-1">
        {tab === "payslip" ? (
          <PayslipTab
            month={month}
            shifts={shifts}
            settings={settings}
            loading={settingsLoading || shiftsLoading}
            onSaveSettings={saveSettings}
          />
        ) : (
          <ShiftsTab
            month={month}
            shifts={shifts}
            loading={shiftsLoading}
            error={shiftsError}
            onAdd={addShift}
            onAddMany={addShifts}
            onDelete={deleteShift}
          />
        )}
      </main>
    </div>
  );
}
