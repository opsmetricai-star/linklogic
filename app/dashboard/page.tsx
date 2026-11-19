import Link from "next/link";
import { requireContext, getUsage } from "@/lib/context";
import { Badge, Empty, Meter, PageHeader, Stat } from "@/components/ui";
import { fmtDate, fmtMs, fmtNum } from "@/lib/format";

export const metadata = { title: "Overview" };

export default async function Overview() {
  const { supabase, org, plan } = await requireContext();
  const since = new Date(Date.now() - 864e5).toISOString();
  const [usage, recent, day, keys] = await Promise.all([
    getUsage(org.id),
    supabase.from("traces").select("id,name,status,latency_ms,started_at").order("started_at", { ascending: false }).limit(6),
    supabase.from("traces").select("status,latency_ms").gte("started_at", since).limit(5000),
    supabase.from("api_keys").select("id", { count: "exact", head: true }).is("revoked_at", null),
  ]);
  const d = day.data ?? [];
  const errs = d.filter((t) => t.status === "error").length;
  const avg = d.length ? Math.round(d.reduce((a, t) => a + t.latency_ms, 0) / d.length) : 0;

  return (
    <>
      <PageHeader title="Overview" sub={`${org.name} · last 24 hours`} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Traces (24h)" value={fmtNum(d.length)} />
        <Stat label="Error rate" value={d.length ? `${((errs / d.length) * 100).toFixed(1)}%` : "n/a"} sub={`${errs} failed runs`} />
        <Stat label="Avg latency" value={d.length ? fmtMs(avg) : "n/a"} />
      </div>

      <section className="panel mt-6 space-y-4 p-5">
        <h2 className="font-semibold">Plan usage this month <span className="font-normal text-muted">· {plan.name}</span></h2>
        <Meter label="Traces" used={usage.traces} limit={plan.traces} />
        <Meter label="AI-assisted runs" used={usage.aiCalls} limit={plan.aiCalls} />
        <Link href="/dashboard/billing" className="text-sm underline">Manage plan</Link>
      </section>

      <h2 className="mb-3 mt-8 font-semibold">Recent traces</h2>
      {recent.data?.length ? (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line"><th className="th">Name</th><th className="th">Status</th><th className="th">Latency</th><th className="th">Started</th></tr></thead>
            <tbody>
              {recent.data.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="td"><Link className="underline" href={`/dashboard/traces/${t.id}`}>{t.name}</Link></td>
                  <td className="td"><Badge tone={t.status === "error" ? "bad" : "ok"}>{t.status}</Badge></td>
                  <td className="td font-mono text-xs">{fmtMs(t.latency_ms)}</td>
                  <td className="td text-muted">{fmtDate(t.started_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="No traces yet"
          body={keys.count ? "Your API key is ready. Send your first trace to /api/v1/traces and it will appear here." : "Create an API key in Settings, then send your first trace to /api/v1/traces."}
          href="/dashboard/settings" cta={keys.count ? "View keys & snippet" : "Create an API key"}
        />
      )}
    </>
  );
}
