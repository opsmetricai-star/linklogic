import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { PlanCards } from "@/components/PlanCards";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = { title: "Pricing" };

const faqs = [
  ["What counts as a trace?", "One recorded agent run, sent to LinkLogic in a single request, including all of its steps."],
  ["What are AI-assisted runs?", "Playground generations, AI judge scores and AI monitoring summaries. Deterministic checks are free and unmetered."],
  ["What happens at a limit?", "Trace ingestion returns a clear error and AI features pause until the month resets or you upgrade. No data is deleted."],
  ["When does a paid plan start?", "After payment is confirmed. Returning from checkout alone does not change your plan."],
  ["Do all plans include unlimited teammates?", "Plans are priced per workspace, not per seat."],
];

const P = Object.values(PLANS);
const n = (x: number) => x.toLocaleString("en-US");
const rows: [string, (string | boolean)[]][] = [
  ["Traces per month", P.map((p) => n(p.traces))],
  ["AI-assisted runs per month", P.map((p) => n(p.aiCalls))],
  ["Examples per dataset", P.map((p) => n(p.examplesPerDataset))],
  ["Trace retention", P.map((p) => `${p.retentionDays} days`)],
  ["Run intelligence (trace explorer)", [true, true, true]],
  ["Deterministic evaluators", [true, true, true]],
  ["AI judge and experiments", [true, true, true]],
  ["Prompt versioning and playground", [true, true, true]],
  ["Monitoring and AI summary", [true, true, true]],
  ["Unlimited teammates", [true, true, true]],
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow mb-4">Pricing</p>
      <h1 className="display max-w-3xl text-5xl leading-[1.05] sm:text-6xl">Pricing that scales with the agents you run.</h1>
      <p className="sub mt-6 max-w-2xl text-xl font-light">Flat monthly plans per workspace. Start free and move up when volume demands it.</p>
      <div className="mt-12"><PlanCards /></div>

      <section className="mt-20">
        <h2 className="display text-3xl">Compare plans</h2>
        <div className="panel mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-line"><th className="th">Feature</th>{P.map((p) => <th key={p.id} className="th">{p.name}</th>)}</tr></thead>
            <tbody>
              {rows.map(([label, vals]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <td className="td text-display">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="td">{v === true ? <Check className="h-4 w-4 text-lime" aria-label="Included" /> : v === false ? <Minus className="h-4 w-4 text-muted" aria-label="Not included" /> : <span className="font-mono text-xs">{v}</span>}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="display text-3xl">Pricing questions</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-display">{q}<span className="font-mono text-muted transition group-open:rotate-45" aria-hidden>+</span></summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
