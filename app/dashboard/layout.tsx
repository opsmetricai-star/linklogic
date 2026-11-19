import Link from "next/link";
import { Activity, BarChart3, CreditCard, Database, FlaskConical, GitBranch, LayoutDashboard, Settings } from "lucide-react";
import { requireContext } from "@/lib/context";
import { Logo } from "@/components/Logo";
import { logout } from "../(auth)/actions";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/traces", label: "Traces", icon: Activity },
  { href: "/dashboard/datasets", label: "Datasets", icon: Database },
  { href: "/dashboard/prompts", label: "Prompts", icon: GitBranch },
  { href: "/dashboard/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { org, user, plan } = await requireContext();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="border-b border-line bg-card md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Logo href="/dashboard" />
          <div className="hidden md:mt-5 md:block">
            <p className="truncate text-sm font-medium">{org.name}</p>
            <p className="font-mono text-[11px] uppercase text-muted">{plan.name} plan</p>
          </div>
        </div>
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-2 pb-2 md:block md:space-y-0.5 md:px-3">
          {nav.map(({ href, label, icon: I }) => (
            <Link key={href} href={href} className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted hover:bg-paper hover:text-ink">
              <I className="h-4 w-4" aria-hidden />{label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-4 py-4 md:absolute md:bottom-0 md:block md:w-full">
          <p className="truncate text-xs text-muted">{user.email}</p>
          <form action={logout}><button className="mt-2 text-sm underline">Sign out</button></form>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
