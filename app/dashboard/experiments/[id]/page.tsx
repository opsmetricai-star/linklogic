import { notFound } from "next/navigation";
import Link from "next/link";
import { requireContext } from "@/lib/context";
import { Badge, PageHeader, Stat } from "@/components/ui";
import { fmtMs, pct } from "@/lib/format";

export default async function ExperimentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireContext();
  const [{ data: e }, { data: rows }] = await Promise.all([
    supabase.from("experiments").select("id,name,status,summary,created_at").eq("id", id).maybeSingle(),
    supabase.from("experiment_results").select("*").eq("experiment_id", id).order("input"),
  ]);
  if (!e) notFound();
  const s = e.summary as { examples?: number; errors?: number; judge_failures?: number; averages?: Record<string, number> };
  return (
    <>
      <Link href="/dashboard/experiments" className="text-sm text-muted underline">← Experiments</Link>
      <div className="mt-2"><PageHeader title={e.name} action={<Badge tone={e.status === "completed" ? "ok" : "bad"}>{e.status}</Badge>} /></div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Examples" value={String(s.examples ?? 0)} sub={s.errors ? `${s.errors} failed to generate` : undefined} />
        {Object.entries(s.averages ?? {}).map(([k, v]) => <Stat key={k} label={k.replace("_", " ")} value={pct(v)} />)}
      </div>
      {!!s.judge_failures && <p role="status" className="mt-3 rounded border border-line bg-card p-3 text-sm text-muted">{s.judge_failures} AI call(s) failed. Those scores are missing, not zero, and are excluded from averages.</p>}
      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-line"><th className="th">Input</th><th className="th">Expected</th><th className="th">Output</th><th className="th">Scores</th></tr></thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="td max-w-[200px] whitespace-pre-wrap">{r.input}</td>
                <td className="td max-w-[200px] whitespace-pre-wrap text-muted">{r.expected ?? "–"}</td>
                <td className="td max-w-[280px] whitespace-pre-wrap">{r.error ? <span className="text-danger">{r.error}</span> : r.output}<span className="ml-1 font-mono text-[11px] text-muted">{fmtMs(r.latency_ms)}</span></td>
                <td className="td font-mono text-xs">
                  {Object.entries(r.scores as Record<string, number>).map(([k, v]) => <div key={k}>{k}: <strong>{v}</strong></div>)}
                  {Object.entries(r.reasoning as Record<string, string>).map(([k, v]) => <div key={k} className="mt-1 font-sans text-muted">{k}: {v}</div>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
