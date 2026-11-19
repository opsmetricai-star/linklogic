import { headers } from "next/headers";
import { requireContext } from "@/lib/context";
import { ActionForm } from "@/components/ActionForm";
import { Badge, PageHeader } from "@/components/ui";
import { createKey, renameOrg, revokeKey } from "../actions";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Settings" };

export default async function Settings() {
  const { supabase, org, user } = await requireContext();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const base = `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  const { data: keys } = await supabase.from("api_keys").select("id,name,prefix,created_at,last_used_at,revoked_at").order("created_at", { ascending: false });
  return (
    <>
      <PageHeader title="Settings" />
      <section className="panel mb-6 p-5">
        <h2 className="mb-3 font-semibold">Workspace</h2>
        <ActionForm action={renameOrg} submit="Save" variant="btn-ghost" className="flex flex-wrap items-start gap-3">
          <input name="name" defaultValue={org.name} required maxLength={80} aria-label="Workspace name" className="input max-w-sm" />
        </ActionForm>
        <p className="mt-3 text-sm text-muted">Signed in as {user.email}</p>
      </section>

      <section className="panel mb-6 p-5">
        <h2 className="font-semibold">API keys</h2>
        <p className="mb-4 text-sm text-muted">Keys authenticate trace ingestion. Only a hash is stored, so a key is shown once.</p>
        <ActionForm action={createKey} submit="Create key" className="flex flex-wrap items-start gap-3">
          <input name="name" required maxLength={60} placeholder="e.g. production" aria-label="Key name" className="input max-w-xs" />
        </ActionForm>
        {keys?.length ? (
          <ul className="mt-5 divide-y divide-line text-sm">
            {keys.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div><span className="font-medium">{k.name}</span> <code className="ml-2 font-mono text-xs text-muted">{k.prefix}…</code>
                  <p className="text-xs text-muted">Created {fmtDate(k.created_at)}{k.last_used_at ? ` · last used ${fmtDate(k.last_used_at)}` : " · never used"}</p></div>
                {k.revoked_at ? <Badge tone="bad">revoked</Badge> : <form action={revokeKey}><input type="hidden" name="id" value={k.id} /><button className="btn-danger">Revoke</button></form>}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="panel p-5">
        <h2 className="mb-2 font-semibold">Send a trace</h2>
        <pre className="overflow-x-auto rounded border border-line bg-paper p-4 font-mono text-xs text-ink">{`curl -X POST ${base}/api/v1/traces \\
  -H "Authorization: Bearer <your key>" -H "Content-Type: application/json" \\
  -d '{"traces":[{"name":"my-agent","input":"hi","output":"hello","latency_ms":420,"model":"gemini-3.8-flash"}]}'`}</pre>
      </section>
    </>
  );
}
