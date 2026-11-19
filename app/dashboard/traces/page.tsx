import Link from "next/link";
import { requireContext } from "@/lib/context";
import { Badge, Empty, PageHeader } from "@/components/ui";
import { fmtDate, fmtMs, fmtUsd, asText } from "@/lib/format";

export const metadata = { title: "Traces" };

export default async function Traces({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const { supabase } = await requireContext();
  let query = supabase.from("traces").select("id,name,status,model,latency_ms,prompt_tokens,completion_tokens,cost_usd,started_at,input,feedback_score").order("started_at", { ascending: false }).limit(100);
  if (status === "error" || status === "success") query = query.eq("status", status);
  if (q) query = query.ilike("name", `%${q.replace(/[%,]/g, "")}%`);
  const { data } = await query;
  const filtered = Boolean(status || q);

  return (
    <>
      <PageHeader title="Traces" sub="Most recent 100 runs" />
      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search by name" aria-label="Search by name" className="input max-w-xs" />
        <select name="status" defaultValue={status ?? ""} aria-label="Status" className="input w-auto">
          <option value="">All statuses</option><option value="success">Success</option><option value="error">Error</option>
        </select>
        <button className="btn-ghost">Filter</button>
      </form>
      {data?.length ? (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line"><th className="th">Run</th><th className="th">Status</th><th className="th">Model</th><th className="th">Latency</th><th className="th">Tokens</th><th className="th">Cost</th><th className="th">Started</th></tr></thead>
            <tbody>
              {data.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="td max-w-[280px]">
                    <Link className="font-medium underline" href={`/dashboard/traces/${t.id}`}>{t.name}</Link>
                    <p className="truncate text-xs text-muted">{asText(t.input).slice(0, 80)}</p>
                  </td>
                  <td className="td"><Badge tone={t.status === "error" ? "bad" : "ok"}>{t.status}</Badge></td>
                  <td className="td font-mono text-xs">{t.model ?? "–"}</td>
                  <td className="td font-mono text-xs">{fmtMs(t.latency_ms)}</td>
                  <td className="td font-mono text-xs">{t.prompt_tokens + t.completion_tokens}</td>
                  <td className="td font-mono text-xs">{fmtUsd(Number(t.cost_usd))}</td>
                  <td className="td whitespace-nowrap text-muted">{fmtDate(t.started_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered ? (
        <Empty title="No matching traces" body="Try clearing the filters." href="/dashboard/traces" cta="Clear filters" />
      ) : (
        <Empty title="No traces yet" body="Send traces with an API key to see them here." href="/dashboard/settings" cta="Get an API key" />
      )}
    </>
  );
}
