import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFor } from "@/lib/plans";

export interface Org {
  id: string;
  name: string;
  plan: string;
  plan_status: string;
  plan_renews_at: string | null;
}

/** Authenticated context for server components/actions. Redirects to /login if signed out. */
export async function requireContext() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: m } = await supabase
    .from("members")
    .select("org_id, role, organizations(id,name,plan,plan_status,plan_renews_at)")
    .eq("user_id", data.user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  const org = (m as unknown as { organizations: Org } | null)?.organizations;
  if (!org) redirect("/login?error=no_workspace");
  return { supabase, user: data.user, org, role: (m as { role: string }).role, plan: planFor(org.plan, org.plan_status) };
}

export function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export async function getUsage(orgId: string) {
  const admin = createAdminClient();
  const since = monthStart();
  const [t, a] = await Promise.all([
    admin.from("traces").select("id", { count: "exact", head: true }).eq("org_id", orgId).gte("created_at", since),
    admin.from("ai_calls").select("id", { count: "exact", head: true }).eq("org_id", orgId).gte("created_at", since),
  ]);
  return { traces: t.count ?? 0, aiCalls: a.count ?? 0 };
}

/** Reserve one AI call against the plan quota. Returns an error string if exhausted. */
export async function reserveAi(orgId: string, kind: string, limit: number): Promise<string | null> {
  const used = (await getUsage(orgId)).aiCalls;
  if (used >= limit) return `Monthly AI-assisted run limit reached (${limit}). Upgrade your plan to continue.`;
  return null;
}

/** Record a metered AI call. Call only after the provider returned a result: failed calls are not billed. */
export async function recordAi(orgId: string, kind: string) {
  await createAdminClient().from("ai_calls").insert({ org_id: orgId, kind });
}
