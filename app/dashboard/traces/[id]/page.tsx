import { notFound } from "next/navigation";
import Link from "next/link";
import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { Badge, PageHeader } from "@/components/ui";
import { saveTraceToDataset, scoreTrace } from "../../actions";
import { asText, fmtDate, fmtMs, fmtUsd } from "@/lib/format";

type Span = { id: string; parent_id: string | null; name: string; kind: string; input: unknown; output: unknown; error: string | null; offset_ms: number; latency_ms: number; prompt_tokens: number; completion_tokens: number };

function Tree({ spans, parent, depth, total }: { spans: Span[]; parent: string | null; depth: number; total: number }) {
  return (
    <ul>
      {spans.filter((s) => s.parent_id === parent).map((s) => (
        <li key={s.id}>
          <details className="border-b border-line" open={depth === 0}>
            <summary className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm" style={{ paddingLeft: 16 + depth * 20 }}>
              <Badge>{s.kind}</Badge>
              <span className="font-medium">{s.name}</span>
              {s.error && <Badge tone="bad">error</Badge>}
              <span className="ml-auto font-mono text-xs text-muted">{fmtMs(s.latency_ms)}</span>
              <span className="hidden h-1.5 w-32 rounded bg-line sm:block" aria-hidden>
                <span className="block h-full rounded bg-forest" style={{ marginLeft: `${Math.min(95, (s.offset_ms / Math.max(total, 1)) * 100)}%`, width: `${Math.max(3, Math.min(100, (s.latency_ms / Math.max(total, 1)) * 100))}%` }} />
              </span>
            </summary>
            <div className="grid gap-3 bg-paper px-6 py-3 text-xs md:grid-cols-2" style={{ paddingLeft: 24 + depth * 20 }}>
              <div><p className="eyebrow mb-1">Input</p><pre className="whitespace-pre-wrap break-words font-mono">{asText(s.input) || "–"}</pre></div>
              <div><p className="eyebrow mb-1">Output</p><pre className="whitespace-pre-wrap break-words font-mono">{s.error ?? (asText(s.output) || "–")}</pre></div>
            </div>
          </details>
          <Tree spans={spans} parent={s.id} depth={depth + 1} total={total} />
        </li>
      ))}
    </ul>
  );
}

export default async function TraceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireContext();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data: t }, { data: spans }, { data: datasets }] = await Promise.all([
    supabase.from("traces").select("*").eq("id", id).maybeSingle(),
    supabase.from("spans").select("*").eq("trace_id", id).order("offset_ms"),
    supabase.from("datasets").select("id,name").order("name"),
  ]);
  if (!t) notFound();

  return (
    <>
      <Link href="/dashboard/traces" className="text-sm text-muted underline">← All traces</Link>
      <div className="mt-2"><PageHeader title={t.name} sub={`${fmtDate(t.started_at)} · ${t.model ?? "no model"}`} action={<Badge tone={t.status === "error" ? "bad" : "ok"}>{t.status}</Badge>} /></div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[["Latency", fmtMs(t.latency_ms)], ["Prompt tokens", t.prompt_tokens], ["Completion tokens", t.completion_tokens], ["Cost", fmtUsd(Number(t.cost_usd))]].map(([l, v]) => (
          <div key={String(l)} className="panel p-3"><p className="eyebrow">{l}</p><p className="mt-1 font-semibold">{v}</p></div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="panel p-4"><h2 className="eyebrow mb-2">Input</h2><pre className="whitespace-pre-wrap break-words font-mono text-xs">{asText(t.input) || "–"}</pre></section>
        <section className="panel p-4"><h2 className="eyebrow mb-2">{t.error ? "Error" : "Output"}</h2><pre className="whitespace-pre-wrap break-words font-mono text-xs">{t.error ?? (asText(t.output) || "–")}</pre></section>
      </div>
      {spans && spans.length > 0 && (
        <section className="panel mt-4 overflow-hidden"><h2 className="eyebrow border-b border-line px-4 py-3">Steps</h2><Tree spans={spans as Span[]} parent={null} depth={0} total={t.latency_ms} /></section>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="panel p-4">
          <h2 className="eyebrow mb-3">Feedback {t.feedback_score != null && <span className="text-ink">· {Number(t.feedback_score) * 100}%</span>}</h2>
          <div className="flex gap-2">
            {[["Good", 1], ["Poor", 0]].map(([l, v]) => (
              <form key={String(l)} action={scoreTrace}><input type="hidden" name="id" value={id} /><input type="hidden" name="score" value={String(v)} /><button className="btn-ghost">{l}</button></form>
            ))}
          </div>
        </section>
        <section className="panel p-4">
          <h2 className="eyebrow mb-3">Save to dataset</h2>
          {datasets?.length ? (
            <ActionForm action={saveTraceToDataset} submit="Save as example" variant="btn-ghost" className="space-y-3">
              <input type="hidden" name="trace_id" value={id} />
              <select name="dataset_id" required aria-label="Dataset" className="input">{datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
            </ActionForm>
          ) : <p className="text-sm text-muted">Create a <Link href="/dashboard/datasets" className="underline">dataset</Link> first.</p>}
        </section>
      </div>
    </>
  );
}
