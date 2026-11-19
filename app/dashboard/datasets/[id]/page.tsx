import { notFound } from "next/navigation";
import Link from "next/link";
import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { Empty, PageHeader } from "@/components/ui";
import { addExamples, deleteDataset, deleteExample } from "../../actions";

export default async function DatasetDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, plan } = await requireContext();
  const [{ data: ds }, { data: ex }] = await Promise.all([
    supabase.from("datasets").select("id,name,description").eq("id", id).maybeSingle(),
    supabase.from("examples").select("id,input,expected").eq("dataset_id", id).order("created_at"),
  ]);
  if (!ds) notFound();
  return (
    <>
      <Link href="/dashboard/datasets" className="text-sm text-muted underline">← Datasets</Link>
      <div className="mt-2">
        <PageHeader title={ds.name} sub={`${ex?.length ?? 0} of ${plan.examplesPerDataset} examples`} action={
          <div className="flex gap-2">
            <Link href={`/dashboard/experiments/new?dataset=${id}`} className="btn-primary">Run experiment</Link>
            <form action={deleteDataset}><input type="hidden" name="id" value={id} /><button className="btn-danger">Delete</button></form>
          </div>} />
      </div>
      <section className="panel mb-6 p-4">
        <h2 className="mb-1 font-semibold">Add examples</h2>
        <p className="mb-3 text-sm text-muted">One per line: <code className="font-mono">input =&gt; expected output</code>. The expected part is optional.</p>
        <ActionForm action={addExamples} submit="Add examples">
          <input type="hidden" name="dataset_id" value={id} />
          <textarea name="bulk" rows={4} required aria-label="Examples" className="input font-mono" placeholder={"What is 2+2? => 4\nCapital of France? => Paris"} />
        </ActionForm>
      </section>
      {ex?.length ? (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line"><th className="th">Input</th><th className="th">Expected</th><th className="th" /></tr></thead>
            <tbody>
              {ex.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="td whitespace-pre-wrap">{e.input}</td>
                  <td className="td whitespace-pre-wrap text-muted">{e.expected ?? "–"}</td>
                  <td className="td text-right"><form action={deleteExample}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="dataset_id" value={id} /><button className="text-xs text-danger underline">Remove</button></form></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title="No examples yet" body="Add some above, or save a trace from the trace explorer." />}
    </>
  );
}
