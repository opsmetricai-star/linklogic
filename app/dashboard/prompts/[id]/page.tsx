import { notFound } from "next/navigation";
import Link from "next/link";
import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { PageHeader } from "@/components/ui";
import { addVersion, runPlayground } from "../../actions";
import { fmtDate } from "@/lib/format";

export default async function PromptDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireContext();
  const [{ data: p }, { data: versions }] = await Promise.all([
    supabase.from("prompts").select("id,name").eq("id", id).maybeSingle(),
    supabase.from("prompt_versions").select("id,version,template,notes,created_at").eq("prompt_id", id).order("version", { ascending: false }),
  ]);
  if (!p || !versions?.length) notFound();
  const latest = versions[0];
  return (
    <>
      <Link href="/dashboard/prompts" className="text-sm text-muted underline">← Prompts</Link>
      <div className="mt-2"><PageHeader title={p.name} sub={`${versions.length} version${versions.length > 1 ? "s" : ""}`} /></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-4">
          <h2 className="mb-3 font-semibold">Save a new version</h2>
          <ActionForm action={addVersion} submit="Save as new version">
            <input type="hidden" name="prompt_id" value={id} />
            <textarea name="template" rows={9} required defaultValue={latest.template} aria-label="Template" className="input font-mono" />
            <input name="notes" maxLength={300} placeholder="What changed? (optional)" aria-label="Notes" className="input" />
          </ActionForm>
        </section>
        <section className="panel p-4">
          <h2 className="mb-3 font-semibold">Playground</h2>
          <ActionForm action={runPlayground} submit="Run" pendingLabel="Generating…">
            <select name="version_id" aria-label="Version" className="input">
              {versions.map((v) => <option key={v.id} value={v.id}>v{v.version}</option>)}
            </select>
            <textarea name="input" rows={3} required maxLength={4000} aria-label="Input" placeholder="Value for {{input}}" className="input" />
          </ActionForm>
        </section>
      </div>
      <h2 className="mb-3 mt-8 font-semibold">History</h2>
      <ul className="space-y-2">
        {versions.map((v) => (
          <li key={v.id}>
            <details className="panel p-4">
              <summary className="cursor-pointer text-sm"><span className="font-mono font-medium">v{v.version}</span> <span className="text-muted">· {fmtDate(v.created_at)}{v.notes ? ` · ${v.notes}` : ""}</span></summary>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs">{v.template}</pre>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
