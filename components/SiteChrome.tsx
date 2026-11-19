import Link from "next/link";
import { Logo } from "./Logo";

const nav = [
  { href: "/product", label: "Product" },
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "Company" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Main" className="hidden gap-6 text-sm text-muted md:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn-primary">Sign up</Link>
        </div>
      </div>
      <nav aria-label="Mobile" className="flex gap-5 overflow-x-auto border-t border-line px-4 py-2 text-sm text-muted md:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap">{n.label}</Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  const cols = [
    { h: "Product", l: [["Run intelligence", "/product#tracing"], ["AI quality scoring", "/product#evaluations"], ["Release control", "/product#prompts"], ["Spend and reliability", "/product#monitoring"]] },
    { h: "Company", l: [["About", "/about"], ["Solutions", "/solutions"], ["Pricing", "/pricing"]] },
    { h: "Account", l: [["Sign in", "/login"], ["Create account", "/signup"]] },
  ];
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">The AI operations platform for enterprises that run agents in production.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h3 className="eyebrow mb-3">{c.h}</h3>
            <ul className="space-y-2 text-sm">
              {c.l.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-muted hover:text-ink">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} LinkLogic. All rights reserved.
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:bg-card focus:p-2">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
