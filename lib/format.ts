export const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);
export const fmtMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`);
export const fmtUsd = (n: number) => `$${n < 1 ? n.toFixed(4) : n.toFixed(2)}`;
export const fmtDate = (s: string) =>
  new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
export const asText = (v: unknown) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v, null, 2));
export const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
