"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type State = { ok?: boolean; error?: string; message?: string; output?: string; secret?: string } | null;

function Submit({ label, pendingLabel, variant }: { label: string; pendingLabel?: string; variant: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={variant}>
      {pending ? (pendingLabel ?? "Working…") : label}
    </button>
  );
}

export function ActionForm({
  action, children, submit, pendingLabel, variant = "btn-primary", className = "space-y-4",
}: {
  action: (s: State, fd: FormData) => Promise<State>;
  children: React.ReactNode;
  submit: string;
  pendingLabel?: string;
  variant?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      <Submit label={submit} pendingLabel={pendingLabel} variant={variant} />
      <div aria-live="polite">
        {state?.error && <p role="alert" className="rounded border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{state.error}</p>}
        {state?.message && <p role="status" className="rounded border border-ok/40 bg-ok/10 p-3 text-sm text-ok">{state.message}</p>}
        {state?.secret && <pre className="mt-2 overflow-x-auto rounded border border-line bg-paper p-3 font-mono text-xs text-lime">{state.secret}</pre>}
        {state?.output && <pre className="mt-2 whitespace-pre-wrap rounded border border-line bg-paper p-3 text-sm">{state.output}</pre>}
      </div>
    </form>
  );
}
