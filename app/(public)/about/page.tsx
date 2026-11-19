import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Company" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">Company</p>
      <h1 className="text-4xl font-semibold tracking-tight">Agents fail quietly. We make that visible.</h1>
      <div className="mt-6 space-y-4 text-lg text-muted">
        <p>Shipping an AI agent is easy. Knowing whether last week&apos;s prompt change made it better or worse is the hard part.</p>
        <p>LinkLogic exists to close that gap: record what happened, test changes against real examples, and keep watching once the change is live.</p>
        <p>We keep the numbers honest. Counts, latencies and scores come from your data and deterministic code. AI is used to judge and explain, never to invent statistics.</p>
      </div>
      <Link href="/contact" className="btn-primary mt-8">Get in touch</Link>
    </div>
  );
}
