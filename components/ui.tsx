import Link from "next/link";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) {
  return (
    <div className="panel px-6 py-12 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{body}</p>
      {href && cta && <Link href={href} className="btn-primary mt-5">{cta}</Link>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="panel p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const p = Math.min(100, (used / limit) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="font-mono text-xs text-muted">{used.toLocaleString()} / {limit.toLocaleString()}</span></div>
      <div className="mt-1.5 h-2 overflow-hidden rounded bg-line" role="progressbar" aria-valuenow={used} aria-valuemax={limit} aria-label={label}>
        <div className={`h-full ${p >= 90 ? "bg-danger" : "bg-forest"}`} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "ok" | "bad" }) {
  const c = tone === "ok" ? "bg-ok/10 text-ok" : tone === "bad" ? "bg-danger/10 text-danger" : "bg-line/60 text-muted";
  return <span className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] uppercase ${c}`}>{children}</span>;
}
