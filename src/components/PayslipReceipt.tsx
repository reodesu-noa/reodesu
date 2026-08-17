import { PayrollSummary } from "@/lib/payroll";
import { formatYen } from "@/lib/format";
import { YearMonth, formatYearMonth } from "@/lib/date";

function Row({
  label,
  value,
  sub,
  emphasis,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className={`shrink-0 text-sm ${emphasis ? "text-foreground" : "text-muted"}`}>
        {label}
        {sub && <span className="ml-1 text-xs text-muted/70">{sub}</span>}
      </span>
      <span className="flex-1 border-b border-dotted border-line/80 translate-y-[-3px]" />
      <span
        className={`shrink-0 tabular text-sm ${
          emphasis ? "font-semibold text-foreground" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="my-3 h-px w-full"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to right, var(--color-line) 0 6px, transparent 6px 12px)",
      }}
    />
  );
}

export function PayslipReceipt({
  month,
  summary,
}: {
  month: YearMonth;
  summary: PayrollSummary;
}) {
  const workedHours = summary.totalWorkedMinutes / 60;
  const nightHours = summary.totalNightMinutes / 60;
  const shiftCount = summary.breakdowns.length;

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-line bg-surface px-5 py-6 shadow-lg shadow-black/20 sm:px-7 sm:py-8">
      <div className="text-center">
        <p className="text-xs tracking-widest text-muted">PAYSLIP</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">給与明細</h2>
        <p className="mt-1 text-sm tabular text-muted">{formatYearMonth(month)}分</p>
      </div>

      <Divider />

      <div className="space-y-0.5">
        <Row label="出勤日数" value={`${shiftCount}日`} />
        <Row label="実働時間" value={`${workedHours.toFixed(1)}h`} />
        <Row label="深夜時間" value={`${nightHours.toFixed(1)}h`} sub="22:00-5:00" />
      </div>

      <Divider />

      <div className="space-y-0.5">
        <Row label="基本給" value={formatYen(summary.basePay)} />
        <Row label="深夜割増" value={formatYen(summary.nightPay)} />
        <Row label="総支給額" value={formatYen(summary.grossPay)} emphasis />
      </div>

      <Divider />

      <div className="space-y-0.5">
        <p className="mb-1 text-xs text-muted">控除</p>
        <Row label="健康保険料" value={`-${formatYen(summary.deductions.health)}`} />
        <Row label="厚生年金保険料" value={`-${formatYen(summary.deductions.pension)}`} />
        <Row label="雇用保険料" value={`-${formatYen(summary.deductions.koyou)}`} />
        <Row label="子育て支援金" value={`-${formatYen(summary.deductions.kosodate)}`} />
        <Row label="所得税" value={`-${formatYen(summary.deductions.tax)}`} sub="概算" />
        <Row label="控除合計" value={`-${formatYen(summary.deductions.total)}`} emphasis />
      </div>

      <Divider />

      <div className="flex items-baseline justify-between rounded-xl bg-accent-soft px-4 py-3">
        <span className="text-sm font-medium text-accent">手取り額</span>
        <span className="tabular text-2xl font-bold text-accent">
          {formatYen(summary.netPay)}
        </span>
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
        ※ 所得税額は源泉徴収税額表に基づく概算です。実際の税額・控除額とは異なる場合があります。
      </p>
    </div>
  );
}
