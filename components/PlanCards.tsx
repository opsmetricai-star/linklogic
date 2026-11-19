import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, checkoutUrl, type PlanId } from "@/lib/plans";

export function PlanCards({ orgId, current }: { orgId?: string; current?: PlanId }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {(Object.values(PLANS)).map((p) => {
        const highlight = p.id === "plus";
        const isCurrent = current === p.id;
        const url = p.id === "free" ? null : checkoutUrl(p.id, orgId);
        return (
          <div key={p.id} className={`panel flex flex-col p-6 ${highlight ? "border-forest ring-1 ring-forest" : ""}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              {highlight && <span className="rounded bg-lime px-2 py-0.5 font-mono text-[11px] uppercase">Popular</span>}
            </div>
            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {p.price}<span className="text-base font-normal text-muted">{p.id === "free" ? "" : " / month"}</span>
            </p>
            <p className="mt-2 text-sm text-muted">{p.blurb}</p>
            <ul className="mt-6 flex-1 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden />{f}</li>
              ))}
            </ul>
            <div className="mt-6">
              {isCurrent ? (
                <span className="btn-ghost w-full cursor-default">Current plan</span>
              ) : p.id === "free" ? (
                orgId ? <span className="btn-ghost w-full cursor-default text-muted">Included by default</span> : <Link href="/signup" className="btn-ghost w-full">Sign up</Link>
              ) : !orgId ? (
                <Link href={"/signup?plan=" + p.id} className={`${highlight ? "btn-primary" : "btn-ghost"} w-full`}>Sign up</Link>
              ) : url ? (
                <a href={url} className={`${highlight ? "btn-primary" : "btn-ghost"} w-full`} target="_blank" rel="noopener">Upgrade to {p.name}</a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
