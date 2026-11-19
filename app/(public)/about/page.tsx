import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Company" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow mb-3">Company</p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Agents fail quietly. LinkLogic makes every failure visible and fixable.</h1>
      <div className="mt-6 space-y-4 text-lg text-muted">
        <p>Enterprises now run agents that answer customers, route claims and trigger workflows. When one degrades, the cost shows up in revenue, support load and risk exposure long before anyone reads a log.</p>
        <p>LinkLogic is the AI operations layer for those agents. It records every run, scores quality with an AI judge, and tests each change on real cases before release.</p>
        <p>We hold one principle: numbers come from your data and deterministic code. AI scores, explains and summarises. It never invents the statistics decisions rest on.</p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link href="/signup" className="btn-primary">Sign up</Link>
        <Link href="/login" className="btn-ghost">Sign in</Link>
      </div>
    </div>
  );
}
