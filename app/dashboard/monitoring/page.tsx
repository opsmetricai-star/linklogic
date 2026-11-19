import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { Empty, PageHeader, Stat } from "@/components/ui";
import { VolumeChart } from "@/components/VolumeChart";
import { dailySeries, totals } from "@/lib/stats";
import { fmtMs, fmtNum, fmtUsd, pct } from "@/lib/format";
import { summarizeMonitoring } from "../actions";

export const metadata = { title: "Monitoring" };

export default async function Monitoring() {
  const { supabase } = await requireContext();
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const { data } = await supabase.from("traces").select("started_at,status,latency_ms,cost_usd,prompt_tokens,completion_tokens").gte("started_at", since).limit(10000);
  const rows = data ?? [];
  if (!rows.length) return (<><PageHeader title="Monitoring" /><Empty title="Nothing to chart yet" body="Once traces arrive, volume, errors and latency percentiles appear here." href="/dashboard/settings" cta="Get an API key" /></>);
  const t = totals(rows);
  return (
    <>
      <PageHeader title="Monitoring" sub={`Last 14 days · ${fmtNum(rows.length)} traces${rows.length >= 10000 ? " (first 10,000 shown)" : ""}`} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Error rate" value={pct(t.errorRate)} sub={`${t.errors} errors`} />
        <Stat label="p50 latency" value={fmtMs(t.p50)} />
        <Stat label="p95 latency" value={fmtMs(t.p95)} />
        <Stat label="Tokens" value={fmtNum(t.tokens)} />
        <Stat label="Reported cost" value={fmtUsd(t.cost)} />
      </div>
      <div className="mt-6"><VolumeChart data={dailySeries(rows, 14)} /></div>
      <section className="panel mt-6 p-4">
        <h2 className="font-semibold">AI summary</h2>
        <p className="mb-3 text-sm text-muted">Explains the last 7 days using the figures above and recent error messages. Counts as one AI-assisted run.</p>
        <ActionForm action={summarizeMonitoring} submit="Summarise" pendingLabel="Analysing…" variant="btn-ghost"><span /></ActionForm>
      </section>
    </>
  );
}
