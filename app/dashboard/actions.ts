"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireContext, reserveAi, recordAi, getUsage } from "@/lib/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateText, judge, explainStats, AiError, aiConfigured } from "@/lib/ai";
import { generateApiKey } from "@/lib/keys";
import { renderTemplate, runDeterministic, summarize, type EvaluatorConfig } from "@/lib/evaluators";
import { totals } from "@/lib/stats";

export type ActionState = { ok?: boolean; error?: string; message?: string; output?: string; secret?: string } | null;

const uuid = z.string().uuid();
const fail = (error: string): ActionState => ({ error });

// ───────── Datasets ─────────
export async function createDataset(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org } = await requireContext();
  const p = z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(300).optional() })
    .safeParse(Object.fromEntries(fd));
  if (!p.success) return fail("Give the dataset a name (max 80 characters).");
  const { data, error } = await supabase.from("datasets").insert({ org_id: org.id, name: p.data.name, description: p.data.description || null }).select("id").single();
  if (error) return fail("Could not create dataset.");
  redirect(`/dashboard/datasets/${data.id}`);
}

export async function deleteDataset(fd: FormData) {
  const { supabase } = await requireContext();
  const id = uuid.safeParse(fd.get("id"));
  if (id.success) await supabase.from("datasets").delete().eq("id", id.data);
  redirect("/dashboard/datasets");
}

async function exampleRoom(datasetId: string, orgId: string, limit: number) {
  const { count } = await createAdminClient().from("examples").select("id", { count: "exact", head: true }).eq("dataset_id", datasetId).eq("org_id", orgId);
  return limit - (count ?? 0);
}

export async function addExamples(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org, plan } = await requireContext();
  const datasetId = uuid.safeParse(fd.get("dataset_id"));
  const raw = String(fd.get("bulk") ?? "");
  if (!datasetId.success) return fail("Unknown dataset.");
  // One example per line: "input => expected" (expected optional)
  const rows = raw.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 500).map((l) => {
    const [i, ...e] = l.split("=>");
    return { input: i.trim().slice(0, 4000), expected: e.join("=>").trim().slice(0, 4000) || null };
  }).filter((r) => r.input);
  if (!rows.length) return fail("Add at least one line in the form: input => expected output");
  const room = await exampleRoom(datasetId.data, org.id, plan.examplesPerDataset);
  if (rows.length > room) return fail(`Your ${plan.name} plan allows ${plan.examplesPerDataset} examples per dataset (${Math.max(room, 0)} slots left).`);
  const { error } = await supabase.from("examples").insert(rows.map((r) => ({ ...r, dataset_id: datasetId.data, org_id: org.id })));
  if (error) return fail("Could not save examples.");
  revalidatePath(`/dashboard/datasets/${datasetId.data}`);
  return { ok: true, message: `Added ${rows.length} example${rows.length > 1 ? "s" : ""}.` };
}

export async function deleteExample(fd: FormData) {
  const { supabase } = await requireContext();
  const id = uuid.safeParse(fd.get("id"));
  const ds = uuid.safeParse(fd.get("dataset_id"));
  if (id.success) await supabase.from("examples").delete().eq("id", id.data);
  if (ds.success) revalidatePath(`/dashboard/datasets/${ds.data}`);
}

export async function saveTraceToDataset(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org, plan } = await requireContext();
  const traceId = uuid.safeParse(fd.get("trace_id"));
  const datasetId = uuid.safeParse(fd.get("dataset_id"));
  if (!traceId.success || !datasetId.success) return fail("Choose a dataset.");
  const { data: t } = await supabase.from("traces").select("input, output").eq("id", traceId.data).single();
  if (!t) return fail("Trace not found.");
  if ((await exampleRoom(datasetId.data, org.id, plan.examplesPerDataset)) < 1) return fail("That dataset is full for your plan.");
  const str = (v: unknown) => (v == null ? "" : typeof v === "string" ? v : JSON.stringify(v));
  const { error } = await supabase.from("examples").insert({
    dataset_id: datasetId.data, org_id: org.id, input: str(t.input).slice(0, 4000) || "(empty)",
    expected: str(t.output).slice(0, 4000) || null, source_trace_id: traceId.data,
  });
  if (error) return fail("Could not save example.");
  return { ok: true, message: "Saved. The trace output is stored as the expected answer: edit it in the dataset if it was wrong." };
}

export async function scoreTrace(fd: FormData) {
  const { supabase } = await requireContext();
  const id = uuid.safeParse(fd.get("id"));
  const score = z.coerce.number().min(0).max(1).safeParse(fd.get("score"));
  if (!id.success || !score.success) return;
  await supabase.from("traces").update({ feedback_score: score.data }).eq("id", id.data);
  revalidatePath(`/dashboard/traces/${id.data}`);
}

// ───────── Prompts ─────────
export async function createPrompt(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org } = await requireContext();
  const p = z.object({ name: z.string().trim().min(1).max(80), template: z.string().trim().min(1).max(20000) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return fail("A name and a template are required.");
  const { data, error } = await supabase.from("prompts").insert({ org_id: org.id, name: p.data.name }).select("id").single();
  if (error) return fail(error.code === "23505" ? "A prompt with that name already exists." : "Could not create prompt.");
  await supabase.from("prompt_versions").insert({ prompt_id: data.id, org_id: org.id, version: 1, template: p.data.template });
  redirect(`/dashboard/prompts/${data.id}`);
}

export async function addVersion(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org } = await requireContext();
  const p = z.object({ prompt_id: uuid, template: z.string().trim().min(1).max(20000), notes: z.string().trim().max(300).optional() }).safeParse(Object.fromEntries(fd));
  if (!p.success) return fail("Template cannot be empty.");
  const { data: last } = await supabase.from("prompt_versions").select("version").eq("prompt_id", p.data.prompt_id).order("version", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("prompt_versions").insert({ prompt_id: p.data.prompt_id, org_id: org.id, version: (last?.version ?? 0) + 1, template: p.data.template, notes: p.data.notes || null });
  if (error) return fail("Could not save version (try again).");
  revalidatePath(`/dashboard/prompts/${p.data.prompt_id}`);
  return { ok: true, message: `Saved as v${(last?.version ?? 0) + 1}.` };
}

export async function runPlayground(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org, plan } = await requireContext();
  const p = z.object({ version_id: uuid, input: z.string().max(4000) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return fail("Pick a version and enter an input.");
  if (!aiConfigured()) return fail("AI analysis is temporarily unavailable. Please try again shortly.");
  const { data: v } = await supabase.from("prompt_versions").select("template").eq("id", p.data.version_id).single();
  if (!v) return fail("Version not found.");
  const limitErr = await reserveAi(org.id, "playground", plan.aiCalls);
  if (limitErr) return fail(limitErr);
  try {
    const output = await generateText(renderTemplate(v.template, { input: p.data.input }));
    await recordAi(org.id, "playground");
    return { ok: true, output };
  } catch (e) {
    return fail(e instanceof AiError ? e.message : "Generation failed.");
  }
}

// ───────── Experiments ─────────
const MAX_EXAMPLES = 12; // each example takes ~20s with generation + judge; keeps a run inside the 60s function limit
const evaluatorSchema = z.array(z.object({
  type: z.enum(["exact_match", "contains", "regex", "json_valid", "max_length", "llm_judge"]),
  value: z.string().max(500).optional(),
})).min(1).max(6);

export async function runExperiment(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org, plan } = await requireContext();
  const p = z.object({ name: z.string().trim().min(1).max(100), dataset_id: uuid, version_id: uuid }).safeParse(Object.fromEntries(fd));
  if (!p.success) return fail("Name, dataset and prompt version are required.");

  const evaluators: EvaluatorConfig[] = [];
  for (const t of ["exact_match", "contains", "json_valid"] as const) if (fd.get(`ev_${t}`)) evaluators.push({ type: t });
  if (fd.get("ev_regex") && String(fd.get("regex_value") ?? "").trim()) evaluators.push({ type: "regex", value: String(fd.get("regex_value")).trim() });
  if (fd.get("ev_max_length") && String(fd.get("max_value") ?? "").trim()) evaluators.push({ type: "max_length", value: String(fd.get("max_value")).trim() });
  if (fd.get("ev_llm_judge") && String(fd.get("judge_value") ?? "").trim()) evaluators.push({ type: "llm_judge", value: String(fd.get("judge_value")).trim().slice(0, 500) });
  const ev = evaluatorSchema.safeParse(evaluators);
  if (!ev.success) return fail("Choose at least one evaluator (and fill its parameter if it needs one).");
  if (!aiConfigured()) return fail("AI analysis is temporarily unavailable. Please try again shortly.");

  const [{ data: version }, { data: examples }] = await Promise.all([
    supabase.from("prompt_versions").select("id, template").eq("id", p.data.version_id).single(),
    supabase.from("examples").select("id, input, expected").eq("dataset_id", p.data.dataset_id).order("created_at").limit(MAX_EXAMPLES),
  ]);
  if (!version) return fail("Prompt version not found.");
  if (!examples?.length) return fail("That dataset has no examples yet.");

  const evs = ev.data;
  const useJudge = evs.some((e) => e.type === "llm_judge");
  const needed = examples.length * (useJudge ? 2 : 1);
  const used = (await getUsage(org.id)).aiCalls;
  if (used + needed > plan.aiCalls)
    return fail(`This run needs ${needed} AI-assisted calls but only ${Math.max(plan.aiCalls - used, 0)} remain this month on the ${plan.name} plan.`);

  const { data: exp, error } = await supabase.from("experiments").insert({
    org_id: org.id, dataset_id: p.data.dataset_id, prompt_version_id: version.id, name: p.data.name, evaluators: ev.data,
  }).select("id").single();
  if (error || !exp) return fail("Could not start experiment.");
  const expId: string = exp.id;

  const admin = createAdminClient();
  const rows: Record<string, unknown>[] = [];
  let aiFailures = 0;
  const queue = [...examples];
  async function worker() {
    for (let ex = queue.shift(); ex; ex = queue.shift()) {
      const t0 = Date.now();
      const scores: Record<string, number> = {};
      const reasoning: Record<string, string> = {};
      let output = "";
      let err: string | null = null;
      try {
        output = await generateText(renderTemplate(version!.template, { input: ex.input }));
        await recordAi(org.id, "experiment_generate");
        for (const cfg of evs) {
          if (cfg.type === "llm_judge") {
            try {
              const j = await judge({ criteria: cfg.value ?? "", input: ex.input, output, expected: ex.expected });
              await recordAi(org.id, "experiment_judge");
              scores.llm_judge = j.score;
              reasoning.llm_judge = j.reasoning;
            } catch (e) {
              aiFailures++;
              reasoning.llm_judge = e instanceof AiError ? e.message : "Judge failed.";
            }
          } else {
            const s = runDeterministic(cfg, output, ex.expected);
            if (s) { scores[s.key] = s.score; if (s.reasoning) reasoning[s.key] = s.reasoning; }
          }
        }
      } catch (e) {
        err = e instanceof AiError ? e.message : "Generation failed.";
        aiFailures++;
      }
      rows.push({ experiment_id: expId, org_id: org.id, example_id: ex.id, input: ex.input, expected: ex.expected, output, scores, reasoning, error: err, latency_ms: Date.now() - t0 });
    }
  }
  await Promise.all(Array.from({ length: 6 }, () => worker()));
  await admin.from("experiment_results").insert(rows);
  const ok = rows.filter((r) => !r.error) as unknown as { scores: Record<string, number> }[];
  await admin.from("experiments").update({
    status: ok.length ? "completed" : "failed",
    summary: { examples: rows.length, errors: rows.length - ok.length, judge_failures: aiFailures, averages: summarize(ok) },
  }).eq("id", expId);
  redirect(`/dashboard/experiments/${expId}`);
}

// ───────── Monitoring AI summary ─────────
export async function summarizeMonitoring(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org, plan } = await requireContext();
  if (!aiConfigured()) return fail("AI analysis is temporarily unavailable. Please try again shortly.");
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const { data } = await supabase.from("traces").select("started_at, status, latency_ms, cost_usd, prompt_tokens, completion_tokens, error, name").gte("started_at", since).limit(5000);
  if (!data?.length) return fail("No traces in the last 7 days to summarise.");
  const errs = data.filter((t) => t.status === "error");
  const t = totals(data); // same deterministic maths as the monitoring page
  const stats = {
    window: "7 days", traces: t.traces, errors: t.errors,
    error_rate_pct: Math.round(t.errorRate * 1000) / 10,
    p50_ms: t.p50, p95_ms: t.p95, tokens: t.tokens,
    cost_usd: Math.round(t.cost * 10000) / 10000,
  };
  const limitErr = await reserveAi(org.id, "monitoring_summary", plan.aiCalls);
  if (limitErr) return fail(limitErr);
  void fd;
  try {
    const output = await explainStats(stats, errs.slice(0, 15).map((e) => ({ name: e.name, error: (e.error ?? "").slice(0, 200) })));
    await recordAi(org.id, "monitoring_summary");
    return { ok: true, output };
  } catch (e) {
    return fail(e instanceof AiError ? e.message : "Summary failed.");
  }
}

// ───────── Settings / API keys ─────────
export async function createKey(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org } = await requireContext();
  const name = z.string().trim().min(1).max(60).safeParse(fd.get("name"));
  if (!name.success) return fail("Name the key (e.g. “production”).");
  const { data: project } = await supabase.from("projects").select("id").eq("org_id", org.id).order("created_at").limit(1).single();
  if (!project) return fail("No project found.");
  const k = generateApiKey();
  const { error } = await supabase.from("api_keys").insert({ org_id: org.id, project_id: project.id, name: name.data, prefix: k.prefix, key_hash: k.hash });
  if (error) return fail("Could not create key.");
  revalidatePath("/dashboard/settings");
  return { ok: true, secret: k.secret, message: "Copy this key now. It will not be shown again." };
}

export async function revokeKey(fd: FormData) {
  const { supabase } = await requireContext();
  const id = uuid.safeParse(fd.get("id"));
  if (id.success) await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id.data);
  revalidatePath("/dashboard/settings");
}

export async function renameOrg(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, org } = await requireContext();
  const name = z.string().trim().min(1).max(80).safeParse(fd.get("name"));
  if (!name.success) return fail("Name must be 1–80 characters.");
  const { error } = await supabase.from("organizations").update({ name: name.data }).eq("id", org.id);
  if (error) return fail("Could not update workspace.");
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Workspace renamed." };
}
