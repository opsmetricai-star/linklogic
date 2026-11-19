import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { modules } from "@/lib/content";

const links = [
  { href: "/solutions", label: "Solutions" },
  { href: "/docs", label: "Docs" },
  { href: "/security", label: "Security" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-lg border border-line bg-paper/85 px-4 backdrop-blur">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-6 font-mono text-[13px] text-ink md:flex">
            <div className="group relative">
              <Link href="/product" className="flex items-center gap-1 py-4 hover:text-display">
                Products <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <div className="invisible absolute left-0 top-full w-80 rounded-lg border border-line bg-card p-2 opacity-0 shadow-2xl transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {modules.map((m) => (
                  <Link key={m.slug} href={`/product/${m.slug}`} className="block rounded-md p-3 hover:bg-raise">
                    <span className="block text-display">{m.name}</span>
                    <span className="mt-0.5 block font-sans text-xs text-muted">{m.stage}: {m.bullets[0][0].toLowerCase()} {m.bullets[0][1].split(",")[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
            {links.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-display">{n.label}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn-primary">Sign up</Link>
        </div>
      </div>
      <nav aria-label="Mobile" className="mx-auto mt-2 flex max-w-6xl gap-5 overflow-x-auto px-1 font-mono text-[13px] text-muted md:hidden">
        <Link href="/product" className="whitespace-nowrap py-1">Products</Link>
        {links.map((n) => <Link key={n.href} href={n.href} className="whitespace-nowrap py-1">{n.label}</Link>)}
      </nav>
    </header>
  );
}

export function Footer() {
  const cols: { h: string; l: [string, string][] }[] = [
    { h: "Products", l: modules.map((m) => [m.name, `/product/${m.slug}`]) },
    { h: "Company", l: [["About", "/about"], ["Solutions", "/solutions"], ["Pricing", "/pricing"], ["Security", "/security"]] },
    { h: "Developers", l: [["Documentation", "/docs"], ["API reference", "/docs#api"], ["Evaluators", "/docs#evaluators"], ["Plan limits", "/docs#limits"]] },
    { h: "Account", l: [["Sign in", "/login"], ["Create account", "/signup"], ["Reset password", "/forgot-password"]] },
  ];
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">The AI operations platform for enterprises that run agents in production.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h3 className="eyebrow mb-4">{c.h}</h3>
            <ul className="space-y-2.5 text-sm">
              {c.l.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-ink hover:text-display">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-5 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} LinkLogic. All rights reserved.
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:bg-card focus:p-2">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
