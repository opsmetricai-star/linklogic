"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Module } from "@/lib/content";

export function Lifecycle({ modules }: { modules: Module[] }) {
  const [i, setI] = useState(0);
  const m = modules[i];
  return (
    <div>
      <div role="tablist" aria-label="Agent reliability lifecycle" className="flex flex-wrap gap-2">
        {modules.map((x, k) => (
          <button
            key={x.slug}
            role="tab"
            id={`tab-${x.slug}`}
            aria-selected={k === i}
            aria-controls={`panel-${x.slug}`}
            onClick={() => setI(k)}
            className={`rounded-md border px-4 py-2 font-mono text-[13px] transition ${k === i ? "border-sky bg-raise text-display" : "border-line text-muted hover:text-ink"}`}
          >
            <span className="mr-2 text-muted">{String(k + 1).padStart(2, "0")}</span>{x.stage}
          </button>
        ))}
      </div>
      <div id={`panel-${m.slug}`} role="tabpanel" aria-labelledby={`tab-${m.slug}`} className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <h3 className="display text-4xl">{m.stage}</h3>
          <p className="sub mt-3 text-xl font-light">{m.headline}</p>
          <ul className="mt-6 space-y-3">
            {m.bullets.map(([lead, rest]) => (
              <li key={lead} className="flex gap-3 text-[15px]">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-lime" />
                <span><strong className="font-medium text-display">{lead}</strong> {rest}</span>
              </li>
            ))}
          </ul>
          <Link href={`/product/${m.slug}`} className="btn-ghost mt-7">
            {m.name} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-line bg-card p-2 shadow-[0_0_80px_-20px_rgba(25,199,204,0.25)]">
          <Image src={m.screen} alt={m.screenAlt} width={1280} height={800} className="h-auto w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
