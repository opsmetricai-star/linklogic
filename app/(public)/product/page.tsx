import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { modules } from "@/lib/content";

export const metadata: Metadata = { title: "Product" };

export default function Product() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow mb-4">Product</p>
      <h1 className="display max-w-3xl text-5xl leading-[1.05] sm:text-6xl">An AI engine that audits every agent your business runs.</h1>
      <p className="sub mt-6 max-w-2xl text-xl font-light">Four connected modules take a team from the first recorded run to a release it can defend.</p>
      <div className="mt-16 space-y-20">
        {modules.map((m, k) => (
          <section key={m.slug} id={m.slug} className="grid items-center gap-10 lg:grid-cols-2">
            <div className={k % 2 ? "lg:order-2" : ""}>
              <p className="eyebrow mb-3">{String(k + 1).padStart(2, "0")} · {m.stage}</p>
              <h2 className="display text-3xl sm:text-4xl">{m.name}</h2>
              <p className="sub mt-3 text-lg font-light">{m.headline}</p>
              <p className="mt-4 text-muted">{m.sub}</p>
              <Link href={`/product/${m.slug}`} className="btn-ghost mt-6">{m.name} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /></Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-line bg-card p-2">
              <Image src={m.screen} alt={m.screenAlt} width={1280} height={800} className="h-auto w-full rounded-lg" />
            </div>
          </section>
        ))}
      </div>
      <div className="mt-24 flex justify-center gap-3">
        <Link href="/signup" className="btn-primary px-6 py-3">Sign up</Link>
        <Link href="/login" className="btn-ghost px-6 py-3">Sign in</Link>
      </div>
    </div>
  );
}
