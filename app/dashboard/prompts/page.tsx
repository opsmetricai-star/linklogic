import Link from "next/link";
import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { Empty, PageHeader } from "@/components/ui";
import { createPrompt } from "../actions";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Prompts" };

export default async function Prompts() {
  const { supabase } = await requireContext();
  const { data } = await supabase.from("prompts").select("id,name,created_at,prompt_versions(count)").order("created_at", { ascending: false });
  return (
    <>
      <PageHeader title="Prompts" sub="Versioned templates. Use {{input}} where the example input should go." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {data?.length ? (
            <ul className="space-y-2">
              {data.map((p) => (
                <li key={p.id} className="panel flex items-center justify-between p-4">
                  <Link href={`/dashboard/prompts/${p.id}`} className="font-medium underline">{p.name}</Link>
                  <span className="text-xs text-muted"><span className="font-mono">{(p.prompt_versions as unknown as { count: number }[])[0]?.count ?? 0} versions</span> · {fmtDate(p.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty title="No prompts yet" body="Create your first prompt to start versioning and testing it." />}
        </div>
        <aside className="panel h-fit p-4">
          <h2 className="mb-3 font-semibold">New prompt</h2>
          <ActionForm action={createPrompt} submit="Create prompt">
            <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required maxLength={80} className="input" /></div>
            <div><label className="label" htmlFor="template">Template</label><textarea id="template" name="template" required rows={6} className="input font-mono" defaultValue={"You are a helpful support agent. Answer concisely.\n\nQuestion: {{input}}"} /></div>
          </ActionForm>
        </aside>
      </div>
    </>
  );
}
