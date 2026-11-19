export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[idx];
}

export interface TraceLite { started_at: string; status: string; latency_ms: number; cost_usd: number | string; prompt_tokens: number; completion_tokens: number }

export function dailySeries(rows: TraceLite[], days: number, now = new Date()) {
  const buckets = new Map<string, { traces: number; errors: number; lat: number[] }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    buckets.set(d.toISOString().slice(0, 10), { traces: 0, errors: 0, lat: [] });
  }
  for (const r of rows) {
    const b = buckets.get(r.started_at.slice(0, 10));
    if (!b) continue;
    b.traces++;
    if (r.status === "error") b.errors++;
    b.lat.push(r.latency_ms);
  }
  return [...buckets].map(([day, b]) => ({
    day: day.slice(5), traces: b.traces, errors: b.errors, p95: percentile([...b.lat].sort((a, c) => a - c), 0.95),
  }));
}

export function totals(rows: TraceLite[]) {
  const lat = rows.map((r) => r.latency_ms).sort((a, b) => a - b);
  const errors = rows.filter((r) => r.status === "error").length;
  return {
    traces: rows.length,
    errors,
    errorRate: rows.length ? errors / rows.length : 0,
    p50: percentile(lat, 0.5),
    p95: percentile(lat, 0.95),
    cost: rows.reduce((a, r) => a + Number(r.cost_usd), 0),
    tokens: rows.reduce((a, r) => a + r.prompt_tokens + r.completion_tokens, 0),
  };
}
