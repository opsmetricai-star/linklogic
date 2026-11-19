import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Product" };

const modules = [
  { id: "tracing", t: "Tracing", d: "Send traces over HTTP with an API key. Each trace carries input, output, model, tokens, cost, tags and nested spans. The explorer shows the run as a tree with per-step timing, and lets you score it or save it as a dataset example.", b: ["Project-scoped, revocable API keys", "Nested LLM / tool / retriever spans", "Filter by status, tag or text"] },
  { id: "evaluations", t: "Datasets & evaluations", d: "Build datasets by hand, in bulk, or from production traces. Run an experiment against a prompt version and score every example. Deterministic checks are computed in code; the optional LLM judge adds a score and a written rationale.", b: ["Exact match, contains, regex, JSON validity, length", "LLM-as-judge with your own criteria", "Per-example results and aggregate scores"] },
  { id: "prompts", t: "Prompts & playground", d: "Store prompts with {{variables}}, save each change as a new version, and run a version against sample inputs in the playground before it goes into an experiment.", b: ["Numbered, immutable versions", "Variable templating", "Playground runs counted against your plan"] },
  { id: "monitoring", t: "Monitoring", d: "Daily trace volume, error rate, latency percentiles and spend, calculated from stored traces. An AI summary can explain the figures, but never replaces them.", b: ["p50 / p95 latency", "Token and cost totals", "AI summary of error patterns"] },
];

export default function Product() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">Product</p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">One workspace for tracing, testing and improving agents.</h1>
      <div className="mt-12 space-y-6">
        {modules.map((m) => (
          <section key={m.id} id={m.id} className="panel grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
            <div>
              <h2 className="text-xl font-semibold">{m.t}</h2>
              <p className="mt-3 text-muted">{m.d}</p>
            </div>
            <ul className="space-y-2 text-sm">
              {m.b.map((x) => (
                <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />{x}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section id="quickstart" className="mt-12">
        <h2 className="text-2xl font-semibold">Quickstart</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
          <li>Create a workspace and open Settings to generate an API key.</li>
          <li>POST traces to <code className="font-mono text-ink">/api/v1/traces</code> with the key as a Bearer token.</li>
          <li>Open Traces, save interesting runs to a dataset, then run your first experiment.</li>
        </ol>
        <Link href="/signup" className="btn-primary mt-6">Create workspace</Link>
      </section>
    </div>
  );
}
