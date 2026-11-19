import Link from "next/link";
import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { Empty, PageHeader } from "@/components/ui";
import { createDataset } from "../actions";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Datasets" };

export default async function Datasets() {
  const { supabase } = await requireContext();
  const { data } = await supabase.from("datasets").select("id,name,description,created_at,examples(count)").order("created_at", { ascending: false });
  return (
    <>
      <PageHeader title="Datasets" sub="Collections of inputs (and expected answers) used to test prompt changes." />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {data?.length ? (
            <ul className="space-y-2">
              {data.map((d) => (
                <li key={d.id} className="panel flex items-center justify-between p-4">
                  <div><Link href={`/dashboard/datasets/${d.id}`} className="font-medium underline">{d.name}</Link>{d.description && <p className="text-sm text-muted">{d.description}</p>}</div>
                  <div className="text-right text-xs text-muted"><p className="font-mono">{(d.examples as unknown as { count: number }[])[0]?.count ?? 0} examples</p><p>{fmtDate(d.created_at)}</p></div>
                </li>
              ))}
            </ul>
          ) : <Empty title="No datasets yet" body="Create one, then add examples by hand or save them from real traces." />}
        </div>
        <aside className="panel h-fit p-4">
          <h2 className="mb-3 font-semibold">New dataset</h2>
          <ActionForm action={createDataset} submit="Create dataset">
            <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required maxLength={80} className="input" /></div>
            <div><label className="label" htmlFor="description">Description</label><input id="description" name="description" maxLength={300} className="input" /></div>
          </ActionForm>
        </aside>
      </div>
    </>
  );
}
