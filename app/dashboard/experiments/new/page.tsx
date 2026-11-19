import Link from "next/link";
import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { Empty, PageHeader } from "@/components/ui";
import { runExperiment } from "../../actions";

export const metadata = { title: "New experiment" };
export const maxDuration = 60; // experiments run synchronously (max 50 examples per run)

export default async function NewExperiment({ searchParams }: { searchParams: Promise<{ dataset?: string }> }) {
  const { dataset } = await searchParams;
  const { supabase } = await requireContext();
  const [{ data: datasets }, { data: versions }] = await Promise.all([
    supabase.from("datasets").select("id,name").order("name"),
    supabase.from("prompt_versions").select("id,version,prompts(name)").order("created_at", { ascending: false }),
  ]);
  if (!datasets?.length || !versions?.length)
    return (<><PageHeader title="New experiment" /><Empty title="Set up first" body="An experiment needs at least one dataset and one prompt." href={datasets?.length ? "/dashboard/prompts" : "/dashboard/datasets"} cta={datasets?.length ? "Create a prompt" : "Create a dataset"} /></>);

  return (
    <>
      <Link href="/dashboard/experiments" className="text-sm text-muted underline">← Experiments</Link>
      <div className="mt-2"><PageHeader title="New experiment" sub="Runs the prompt on up to the first 50 examples. Each generation (and each LLM-judge score) uses one AI-assisted run." /></div>
      <div className="panel max-w-2xl p-5">
        <ActionForm action={runExperiment} submit="Run experiment" pendingLabel="Running… this can take up to a minute">
          <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required maxLength={100} className="input" placeholder="e.g. concise-tone v2" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="dataset_id">Dataset</label><select id="dataset_id" name="dataset_id" defaultValue={dataset} className="input">{datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="label" htmlFor="version_id">Prompt version</label><select id="version_id" name="version_id" className="input">{versions.map((v) => <option key={v.id} value={v.id}>{(v.prompts as unknown as { name: string }).name} v{v.version}</option>)}</select></div>
          </div>
          <fieldset className="space-y-3 rounded border border-line p-4">
            <legend className="eyebrow px-1">Evaluators</legend>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ev_exact_match" defaultChecked /> Exact match <span className="text-muted">(needs expected output)</span></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ev_contains" /> Output contains expected</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="ev_json_valid" /> Output is valid JSON</label>
            <div className="flex items-center gap-2 text-sm"><input type="checkbox" name="ev_regex" id="ev_regex" /><label htmlFor="ev_regex">Matches regex</label><input name="regex_value" aria-label="Regex" placeholder="^Sorry" className="input max-w-[200px] font-mono" /></div>
            <div className="flex items-center gap-2 text-sm"><input type="checkbox" name="ev_max_length" id="ev_max_length" /><label htmlFor="ev_max_length">Max length</label><input name="max_value" type="number" min={1} aria-label="Max characters" placeholder="300" className="input max-w-[120px]" /></div>
            <div className="text-sm"><label className="flex items-center gap-2"><input type="checkbox" name="ev_llm_judge" /> LLM judge <span className="text-muted">(uses an extra AI run per example)</span></label>
              <input name="judge_value" maxLength={500} aria-label="Judge criteria" placeholder="Criteria, e.g. Is the answer polite and factually consistent with the reference?" className="input mt-2" /></div>
          </fieldset>
        </ActionForm>
      </div>
    </>
  );
}
