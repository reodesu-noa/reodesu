export function formatYen(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

export function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1);
}
