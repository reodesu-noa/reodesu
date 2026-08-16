import { Settings, Shift } from "./types";

// 介護保険料率（40歳以上の場合に健康保険料率へ加算）。settingsテーブルに専用カラムが
// 無いため、令和6年度の全国健康保険協会 目安値を固定値として扱う。
export const KAIGO_HOKEN_RATE = 1.6; // %

const NIGHT_START_HOUR = 22; // 22:00
const NIGHT_END_HOUR = 5; // 翌5:00

function toMinutesOfDay(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function dateTimeToMinutes(dateStr: string, time: string): number {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const base = Date.UTC(y, mo - 1, d) / 60000; // minutes since epoch, day-aligned
  return base + toMinutesOfDay(time);
}

// 指定した [start, end) 区間（分, epoch分）のうち 22:00-翌5:00 に含まれる分数を算出
function nightMinutesInRange(startMin: number, endMin: number): number {
  let total = 0;
  const startDay = Math.floor(startMin / 1440) - 1;
  const endDay = Math.floor(endMin / 1440) + 1;
  for (let day = startDay; day <= endDay; day++) {
    const windowStart = day * 1440 + NIGHT_START_HOUR * 60;
    const windowEnd = (day + 1) * 1440 + NIGHT_END_HOUR * 60;
    const overlapStart = Math.max(startMin, windowStart);
    const overlapEnd = Math.min(endMin, windowEnd);
    if (overlapEnd > overlapStart) {
      total += overlapEnd - overlapStart;
    }
  }
  return total;
}

export interface ShiftBreakdown {
  shift: Shift;
  totalMinutes: number; // 休憩控除前の拘束時間
  workedMinutes: number; // 実働時間（休憩控除後）
  nightMinutes: number; // 深夜時間（休憩控除後、実働時間に占める深夜分）
  dayMinutes: number; // 実働時間のうち深夜以外
}

export function computeShiftBreakdown(shift: Shift): ShiftBreakdown {
  const startMin = dateTimeToMinutes(shift.date, shift.start_time);
  let endMin = dateTimeToMinutes(shift.date, shift.end_time);
  if (endMin <= startMin) {
    endMin += 1440; // 日またぎ
  }
  const totalMinutes = endMin - startMin;
  const nightRaw = nightMinutesInRange(startMin, endMin);
  const workedMinutes = Math.max(0, totalMinutes - shift.break_min);

  // 休憩の取得時刻は不明なため、深夜/日中の比率に応じて休憩時間を按分する
  const nightRatio = totalMinutes > 0 ? nightRaw / totalMinutes : 0;
  const nightMinutes = workedMinutes * nightRatio;
  const dayMinutes = workedMinutes - nightMinutes;

  return { shift, totalMinutes, workedMinutes, nightMinutes, dayMinutes };
}

export interface Deductions {
  health: number;
  pension: number;
  koyou: number;
  tax: number;
  total: number;
}

export interface PayrollSummary {
  breakdowns: ShiftBreakdown[];
  totalWorkedMinutes: number;
  totalNightMinutes: number;
  basePay: number; // 基本給
  nightPay: number; // 深夜割増
  grossPay: number; // 総支給額
  deductions: Deductions;
  netPay: number; // 手取り額
}

function calcIncomeTax(grossPay: number, socialInsuranceTotal: number, settings: Settings): number {
  if (settings.tax_override != null) {
    return settings.tax_override;
  }
  const base = Math.max(0, grossPay - socialInsuranceTotal);

  if (settings.tax_type === "otsu") {
    return base * 0.03063;
  }

  // 甲欄
  const threshold = 105000 + settings.dependents * 32000;
  if (base <= threshold) return 0;
  const excess = base - threshold;
  let rate = 0.05;
  if (grossPay > 500000) rate = 0.2;
  else if (grossPay > 300000) rate = 0.1;
  return excess * rate;
}

export function computeMonthlyPayroll(shifts: Shift[], settings: Settings): PayrollSummary {
  const breakdowns = shifts.map(computeShiftBreakdown);

  const totalWorkedMinutes = breakdowns.reduce((sum, b) => sum + b.workedMinutes, 0);
  const totalNightMinutes = breakdowns.reduce((sum, b) => sum + b.nightMinutes, 0);

  const totalWorkedHours = totalWorkedMinutes / 60;
  const totalNightHours = totalNightMinutes / 60;

  const basePay = totalWorkedHours * settings.wage;
  const nightPay = totalNightHours * settings.wage * (settings.night_rate / 100);
  const grossPay = basePay + nightPay;

  let health = 0;
  let pension = 0;
  if (settings.enrolled_shakai_hoken) {
    const healthRate = settings.health_ins_rate + (settings.over40 ? KAIGO_HOKEN_RATE : 0);
    health = (grossPay * (healthRate / 2)) / 100;
    pension = (grossPay * (settings.pension_rate / 2)) / 100;
  }

  const koyou = settings.enrolled_koyou ? (grossPay * settings.koyou_rate) / 100 : 0;

  const socialInsuranceTotal = health + pension + koyou;
  const tax = Math.max(0, calcIncomeTax(grossPay, socialInsuranceTotal, settings));

  const deductions: Deductions = {
    health,
    pension,
    koyou,
    tax,
    total: health + pension + koyou + tax,
  };

  const netPay = grossPay - deductions.total;

  return {
    breakdowns,
    totalWorkedMinutes,
    totalNightMinutes,
    basePay,
    nightPay,
    grossPay,
    deductions,
    netPay,
  };
}
