import type { Metadata } from "next";
import { PlanCards } from "@/components/PlanCards";

export const metadata: Metadata = { title: "Pricing" };

const faqs = [
  ["What counts as a trace?", "One recorded agent run, sent to LinkLogic in a single request, including all of its steps."],
  ["What are AI-assisted runs?", "Playground generations, AI judge scores and AI monitoring summaries. Deterministic checks are free and unmetered."],
  ["What happens at a limit?", "Trace ingestion returns a clear error and AI features pause until the month resets or you upgrade. No data is deleted."],
  ["When does a paid plan start?", "After payment is confirmed. Returning from checkout alone does not change your plan."],
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow mb-3">Pricing</p>
      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Pricing that scales with the agents you run.</h1>
      <p className="mt-4 max-w-xl text-muted">Flat monthly plans per workspace with unlimited teammates. Start on the free plan and move up when volume demands it.</p>
      <div className="mt-10"><PlanCards /></div>
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {faqs.map(([q, a]) => (
          <div key={q}><h2 className="font-semibold">{q}</h2><p className="mt-1 text-sm text-muted">{a}</p></div>
        ))}
      </section>
    </div>
  );
}
