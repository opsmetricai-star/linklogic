import type { Metadata } from "next";
import Link from "next/link";
import { PlanCards } from "@/components/PlanCards";

export const metadata: Metadata = { title: "Pricing" };

const faqs = [
  ["What counts as a trace?", "One top-level agent run sent to the ingestion API, including all of its spans."],
  ["What are AI-assisted runs?", "Playground generations, LLM-judge scores and AI monitoring summaries. Deterministic evaluators are free and unmetered."],
  ["What happens at the limit?", "Ingestion returns a clear 429 error and AI features pause until the month resets or you upgrade. Nothing is deleted."],
  ["When does my plan change?", "Only after the payment provider confirms payment to us. Returning from checkout alone does not activate a plan."],
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">Pricing</p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">Start free. Pay when your traffic grows.</h1>
      <p className="mt-4 max-w-xl text-muted">Flat monthly plans per workspace with unlimited teammates. Need SSO, a custom retention window or a self-hosted setup? <Link href="/contact" className="underline">Talk to us</Link>.</p>
      <div className="mt-10"><PlanCards /></div>
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {faqs.map(([q, a]) => (
          <div key={q}><h2 className="font-semibold">{q}</h2><p className="mt-1 text-sm text-muted">{a}</p></div>
        ))}
      </section>
    </div>
  );
}
