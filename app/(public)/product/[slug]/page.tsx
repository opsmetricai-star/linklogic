import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { moduleBySlug, modules } from "@/lib/content";

export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = moduleBySlug((await params).slug);
  return { title: m?.name ?? "Product", description: m?.sub };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const m = moduleBySlug((await params).slug);
  if (!m) notFound();
  const others = modules.filter((x) => x.slug !== m.slug);
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <p className="eyebrow mb-4">{m.stage} · {m.name}</p>
        <h1 className="display max-w-3xl text-5xl leading-[1.05] sm:text-6xl">{m.headline}</h1>
        <p className="sub mt-6 max-w-2xl text-xl font-light">{m.sub}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary px-6 py-3">Sign up</Link>
          <Link href="/login" className="btn-ghost px-6 py-3">Sign in</Link>
        </div>
        <div className="mt-14 overflow-hidden rounded-xl border border-line bg-card p-2 shadow-[0_0_100px_-30px_rgba(25,199,204,0.3)]">
          <Image src={m.screen} alt={m.screenAlt} width={1280} height={800} priority className="h-auto w-full rounded-lg" />
        </div>
      </section>

      <section className="border-y border-line bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-px px-4 py-16 sm:px-6 md:grid-cols-3 md:gap-10">
          {m.bullets.map(([lead, rest]) => (
            <div key={lead}>
              <p className="font-mono text-xs uppercase tracking-widest text-lime">{lead}</p>
              <p className="mt-3 text-lg text-display">{rest.charAt(0).toUpperCase() + rest.slice(1)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow mb-4">How it works</p>
        <div className="grid gap-6 md:grid-cols-3">
          {m.how.map(([t, d], k) => (
            <div key={t} className="panel p-6">
              <span className="font-mono text-sm text-lime">0{k + 1}</span>
              <h2 className="mt-3 text-lg font-medium text-display">{t}</h2>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Capabilities</p>
          <ul className="space-y-3">
            {m.details.map((d) => (
              <li key={d} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-lime" aria-hidden />{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Questions</p>
          <div className="divide-y divide-line border-y border-line">
            {m.faq.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-display">{q}<span className="font-mono text-muted transition group-open:rotate-45" aria-hidden>+</span></summary>
                <p className="mt-2 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <p className="eyebrow mb-4">Continue the lifecycle</p>
        <div className="grid gap-4 md:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/product/${o.slug}`} className="panel p-5 transition hover:border-sky">
              <p className="eyebrow">{o.stage}</p>
              <p className="mt-2 text-lg text-display">{o.name}</p>
              <p className="mt-1 text-sm text-muted">{o.headline}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
