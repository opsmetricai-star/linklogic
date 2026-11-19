import Link from "next/link";
import { requireContext } from "@/lib/context";
import { Badge, Empty, PageHeader } from "@/components/ui";
import { fmtDate, pct } from "@/lib/format";

export const metadata = { title: "Experiments" };

export default async function Experiments() {
  const { supabase } = await requireContext();
  const { data } = await supabase.from("experiments").select("id,name,status,summary,created_at,datasets(name),prompt_versions(version,prompts(name))").order("created_at", { ascending: false }).limit(50);
  return (
    <>
      <PageHeader title="Experiments" sub="Score a prompt version against a dataset." action={<Link href="/dashboard/experiments/new" className="btn-primary">New experiment</Link>} />
      {data?.length ? (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line"><th className="th">Experiment</th><th className="th">Prompt</th><th className="th">Dataset</th><th className="th">Scores</th><th className="th">Status</th><th className="th">Run</th></tr></thead>
            <tbody>
              {data.map((e) => {
                const pv = e.prompt_versions as unknown as { version: number; prompts: { name: string } } | null;
                const avgs = ((e.summary as { averages?: Record<string, number> })?.averages) ?? {};
                return (
                  <tr key={e.id} className="border-b border-line last:border-0">
                    <td className="td"><Link href={`/dashboard/experiments/${e.id}`} className="font-medium underline">{e.name}</Link></td>
                    <td className="td">{pv ? `${pv.prompts.name} v${pv.version}` : "–"}</td>
                    <td className="td">{(e.datasets as unknown as { name: string } | null)?.name ?? "–"}</td>
                    <td className="td font-mono text-xs">{Object.entries(avgs).map(([k, v]) => `${k} ${pct(v)}`).join(" · ") || "–"}</td>
                    <td className="td"><Badge tone={e.status === "completed" ? "ok" : e.status === "failed" ? "bad" : "neutral"}>{e.status}</Badge></td>
                    <td className="td text-muted">{fmtDate(e.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty title="No experiments yet" body="You need a dataset with examples and a prompt. Then run your first experiment." href="/dashboard/experiments/new" cta="New experiment" />}
    </>
  );
}
