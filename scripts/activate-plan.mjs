// Trusted manual activation (use after confirming a payment in your Selar dashboard).
// Usage: node --env-file=.env.local scripts/activate-plan.mjs <buyer-email> <plus|scale|free>
import { createClient } from "@supabase/supabase-js";
const [email, plan] = process.argv.slice(2);
if (!email || !["plus", "scale", "free"].includes(plan)) { console.error("usage: activate-plan.mjs <email> <plus|scale|free>"); process.exit(1); }
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: users, error } = await db.auth.admin.listUsers({ perPage: 1000 });
if (error) throw error;
const u = users.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
if (!u) { console.error("No user with that email"); process.exit(1); }
const { data: m } = await db.from("members").select("org_id").eq("user_id", u.id).limit(1).single();
const { error: e2 } = await db.from("organizations").update({ plan, plan_status: plan === "free" ? "inactive" : "active" }).eq("id", m.org_id);
if (e2) throw e2;
await db.from("billing_events").insert({ provider_event_id: `manual_${Date.now()}`, org_id: m.org_id, type: `manual.activate:${plan}`, payload: { by: "admin-script", email } });
console.log(`Set ${email} → ${plan}`);
