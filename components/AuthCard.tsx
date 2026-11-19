import { Logo } from "./Logo";

export function AuthCard({ title, error, notice, children, footer }: {
  title: string; error?: string; notice?: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="panel p-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          {error === "config" ? (
            <p role="alert" className="mt-4 rounded border border-danger/40 bg-danger/10 p-3 text-sm text-danger">This deployment has no Supabase configuration yet. See the README.</p>
          ) : error ? (
            <p role="alert" className="mt-4 rounded border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>
          ) : null}
          {notice && <p role="status" className="mt-4 rounded border border-ok/40 bg-ok/10 p-3 text-sm text-ok">{notice}</p>}
          <div className="mt-5">{children}</div>
        </div>
        {footer && <p className="mt-4 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}
