import Link from "next/link";
import type { Metadata } from "next";
import { Database, KeyRound, Lock, ScanSearch, ServerCog, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Security" };

const items = [
  { icon: Database, t: "Tenant isolation in the database", d: "Every table carries a workspace identifier and is protected by Row Level Security. Members can only read and write their own workspace's rows, enforced by Postgres rather than application code alone." },
  { icon: KeyRound, t: "Hashed, revocable API keys", d: "Ingestion keys are shown once and stored only as SHA-256 hashes. Revoke any key instantly and see when it was last used." },
  { icon: ShieldCheck, t: "Server-side validation", d: "Every write is validated on the server with strict schemas: sizes, types and ranges. Trace batches are capped in size and count." },
  { icon: Lock, t: "Protected sessions and routes", d: "Authentication is handled by Supabase Auth. Application routes require a valid session, and password recovery links expire." },
  { icon: ScanSearch, t: "Plans cannot be self-granted", d: "A paid plan is applied only by a verified payment confirmation or an administrator. Users cannot change plan fields, even with direct database access under their own session." },
  { icon: ServerCog, t: "Secrets stay on the server", d: "Service credentials and AI provider keys exist only in server environment variables and never reach the browser." },
];

export default function Security() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow mb-4">Security</p>
      <h1 className="display max-w-3xl text-5xl leading-[1.05] sm:text-6xl">Built to pass security review.</h1>
      <p className="sub mt-6 max-w-2xl text-xl font-light">Agent traces contain business data. LinkLogic isolates it by default and keeps the controls simple to audit.</p>
      <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: I, t, d }) => (
          <div key={t} className="bg-paper p-7">
            <I className="h-5 w-5 text-lime" aria-hidden />
            <h2 className="mt-5 text-lg font-medium text-display">{t}</h2>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
      <section className="mt-14 max-w-3xl">
        <h2 className="display text-3xl">AI processing</h2>
        <p className="mt-4 text-muted">When you use the playground, experiments, the AI judge or the monitoring summary, the relevant text is sent to the configured AI provider to produce the result. Nothing is sent unless you start one of these actions. Statistics shown in monitoring are always computed in code before any AI interpretation.</p>
      </section>
      <div className="mt-12 flex gap-3">
        <Link href="/signup" className="btn-primary px-6 py-3">Sign up</Link>
        <Link href="/login" className="btn-ghost px-6 py-3">Sign in</Link>
      </div>
    </div>
  );
}
