import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsePlanMap, verifySignature } from "@/lib/webhook";

export const runtime = "nodejs";

// Trusted subscription activation. Only a correctly signed event changes an org's plan.
export async function POST(req: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("stripe-signature"), secret))
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  let event: { id: string; type: string; data: { object: Record<string, any> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  const admin = createAdminClient();
  const obj = event.data?.object ?? {};
  const planMap = parsePlanMap(process.env.PAYMENT_PLAN_MAP);

  let orgId: string | null = null;
  const customer: string | null = typeof obj.customer === "string" ? obj.customer : null;

  if (event.type === "checkout.session.completed") {
    const plan = planMap[obj.payment_link] ?? planMap[obj.metadata?.price_id ?? ""];
    orgId = typeof obj.client_reference_id === "string" ? obj.client_reference_id : null;
    if (obj.payment_status === "paid" || obj.status === "complete") {
      if (!plan || !orgId) {
        await admin.from("billing_events").upsert(
          { provider_event_id: event.id, type: event.type + ":unmapped", payload: obj },
          { onConflict: "provider_event_id", ignoreDuplicates: true },
        );
        return NextResponse.json({ received: true, applied: false });
      }
      const { error: dup } = await admin
        .from("billing_events")
        .insert({ provider_event_id: event.id, org_id: orgId, type: event.type, payload: obj });
      if (dup?.code === "23505") return NextResponse.json({ received: true, duplicate: true });
      const { data: updated, error: upErr } = await admin
        .from("organizations")
        .update({ plan, plan_status: "active", payment_customer_id: customer })
        .eq("id", orgId)
        .select("id");
      if (upErr || !updated?.length) {
        // Roll back the idempotency record so the provider's retry can apply the plan.
        await admin.from("billing_events").delete().eq("provider_event_id", event.id);
        console.error("billing webhook: plan update failed", upErr?.message ?? "unknown org");
        return NextResponse.json({ error: "Could not apply plan" }, { status: 500 });
      }
      return NextResponse.json({ received: true, applied: true });
    }
  } else if (customer && ["customer.subscription.deleted", "invoice.payment_failed"].includes(event.type)) {
    const status = event.type === "customer.subscription.deleted" ? "canceled" : "past_due";
    const { data: org } = await admin
      .from("organizations")
      .update({ plan_status: status })
      .eq("payment_customer_id", customer)
      .select("id")
      .maybeSingle();
    orgId = org?.id ?? null;
  }

  await admin.from("billing_events").upsert(
    { provider_event_id: event.id, org_id: orgId, type: event.type, payload: obj },
    { onConflict: "provider_event_id", ignoreDuplicates: true },
  );
  return NextResponse.json({ received: true });
}
