import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashKey } from "@/lib/keys";
import { getUsage } from "@/lib/context";
import { planFor } from "@/lib/plans";

export const runtime = "nodejs";

const json = z.any().optional();
const spanSchema = z.object({
  id: z.string().max(64).optional(),
  parent_id: z.string().max(64).optional(),
  name: z.string().min(1).max(200),
  kind: z.enum(["llm", "tool", "retriever", "chain"]).default("chain"),
  input: json,
  output: json,
  error: z.string().max(4000).optional(),
  offset_ms: z.number().int().min(0).max(3_600_000).default(0),
  latency_ms: z.number().int().min(0).max(3_600_000).default(0),
  prompt_tokens: z.number().int().min(0).max(10_000_000).default(0),
  completion_tokens: z.number().int().min(0).max(10_000_000).default(0),
});
const traceSchema = z.object({
  name: z.string().min(1).max(200),
  status: z.enum(["success", "error"]).optional(),
  input: json,
  output: json,
  error: z.string().max(4000).optional(),
  model: z.string().max(100).optional(),
  started_at: z.string().datetime().optional(),
  latency_ms: z.number().int().min(0).max(3_600_000).default(0),
  prompt_tokens: z.number().int().min(0).max(10_000_000).default(0),
  completion_tokens: z.number().int().min(0).max(10_000_000).default(0),
  cost_usd: z.number().min(0).max(100_000).default(0),
  tags: z.array(z.string().max(50)).max(20).default([]),
  metadata: z.record(z.any()).default({}),
  spans: z.array(spanSchema).max(200).default([]),
});
const bodySchema = z.object({ traces: z.array(traceSchema).min(1).max(100) });

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!secret) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const admin = createAdminClient();
  const { data: key } = await admin
    .from("api_keys")
    .select("id, org_id, project_id, revoked_at")
    .eq("key_hash", hashKey(secret))
    .maybeSingle();
  if (!key || key.revoked_at) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  if (Number(req.headers.get("content-length") ?? 0) > 2_000_000)
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  if (!parsed.success)
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });

  // Plan quota (paid limits apply only for verified-active subscriptions)
  const { data: org } = await admin.from("organizations").select("plan, plan_status").eq("id", key.org_id).single();
  const plan = planFor(org?.plan, org?.plan_status);
  const used = (await getUsage(key.org_id)).traces;
  if (used + parsed.data.traces.length > plan.traces)
    return NextResponse.json(
      { error: `Monthly trace limit reached (${plan.traces}). Upgrade at /dashboard/billing.` },
      { status: 429 },
    );

  const traceRows: Record<string, unknown>[] = [];
  const spanRows: Record<string, unknown>[] = [];
  const ids: string[] = [];
  for (const t of parsed.data.traces) {
    const id = randomUUID();
    ids.push(id);
    const { spans, ...rest } = t;
    traceRows.push({
      ...rest,
      id,
      status: t.status ?? (t.error ? "error" : "success"),
      started_at: t.started_at ?? new Date().toISOString(),
      org_id: key.org_id,
      project_id: key.project_id,
    });
    const map = new Map<string, string>();
    spans.forEach((s) => map.set(s.id ?? "", randomUUID()));
    spans.forEach((s, i) => {
      const own = s.id ? map.get(s.id)! : randomUUID();
      spanRows.push({
        id: own,
        trace_id: id,
        org_id: key.org_id,
        parent_id: s.parent_id ? (map.get(s.parent_id) ?? null) : null,
        name: s.name,
        kind: s.kind,
        input: s.input ?? null,
        output: s.output ?? null,
        error: s.error ?? null,
        offset_ms: s.offset_ms,
        latency_ms: s.latency_ms,
        prompt_tokens: s.prompt_tokens,
        completion_tokens: s.completion_tokens,
      });
      void i;
    });
  }

  const { error: e1 } = await admin.from("traces").insert(traceRows);
  if (e1) return NextResponse.json({ error: "Could not store traces" }, { status: 500 });
  if (spanRows.length) {
    const { error: e2 } = await admin.from("spans").insert(spanRows);
    if (e2) return NextResponse.json({ error: "Traces stored but spans failed" }, { status: 500 });
  }
  await admin.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);
  return NextResponse.json({ accepted: ids.length, ids }, { status: 201 });
}
