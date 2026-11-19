import { requireContext, getUsage } from "@/lib/context";
import { PlanCards } from "@/components/PlanCards";
import { Badge, Meter, PageHeader } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import type { PlanId } from "@/lib/plans";

export const metadata = { title: "Billing" };

export default async function Billing() {
  const { supabase, org, plan } = await requireContext();
  const [usage, { data: events }] = await Promise.all([
    getUsage(org.id),
    supabase.from("billing_events").select("id,type,created_at").order("created_at", { ascending: false }).limit(10),
  ]);
  const tone = org.plan_status === "active" ? "ok" : org.plan_status === "inactive" ? "neutral" : "bad";
  return (
    <>
      <PageHeader title="Billing" sub="Plans are activated only after your payment is confirmed by our payment provider." />
      <section className="panel mb-6 grid gap-6 p-5 md:grid-cols-2">
        <div>
          <p className="eyebrow">Current plan</p>
          <p className="mt-1 text-2xl font-semibold">{plan.name}</p>
          <p className="mt-1 text-sm">Subscription: <Badge tone={tone}>{org.plan === "free" ? "free tier" : org.plan_status}</Badge></p>
          {org.plan !== "free" && org.plan_status !== "active" && (
            <p className="mt-2 text-sm text-danger">Your {org.plan} subscription is {org.plan_status}, so free-tier limits apply until payment is confirmed again.</p>
          )}
          <p className="mt-3 text-sm text-muted">To downgrade or cancel, manage the subscription from your payment provider receipt. We downgrade automatically when the cancellation is confirmed.</p>
        </div>
        <div className="space-y-4">
          <Meter label="Traces this month" used={usage.traces} limit={plan.traces} />
          <Meter label="AI-assisted runs this month" used={usage.aiCalls} limit={plan.aiCalls} />
          <p className="text-xs text-muted">Retention: {plan.retentionDays} days · Examples per dataset: {plan.examplesPerDataset}</p>
        </div>
      </section>
      <PlanCards orgId={org.id} current={(org.plan_status === "active" ? org.plan : "free") as PlanId} />
      <p className="mt-3 text-xs text-muted">After paying, it can take a minute for confirmation to arrive. Refresh this page to see the change.</p>
      {events && events.length > 0 && (
        <section className="mt-8"><h2 className="mb-2 font-semibold">Payment events</h2>
          <ul className="panel divide-y divide-line text-sm">{events.map((e) => <li key={e.id} className="flex justify-between px-4 py-2"><span className="font-mono text-xs">{e.type}</span><span className="text-muted">{fmtDate(e.created_at)}</span></li>)}</ul>
        </section>
      )}
    </>
  );
}
