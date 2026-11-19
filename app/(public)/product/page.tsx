import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Product" };

const modules = [
  { id: "tracing", t: "Run intelligence", d: "Agents send traces to LinkLogic over a single authenticated request. Each trace carries input, output, model, tokens, cost and nested steps. Operators see where time and money go, and which step failed, without reading logs.", b: ["Revocable, project-scoped API keys", "LLM, tool and retriever steps in one tree", "Filter by status, name or feedback"] },
  { id: "evaluations", t: "AI quality scoring", d: "Build datasets from real production traces, then score every output. The AI judge grades against criteria you write and explains each result. Exact-match, regex, JSON and length checks run as plain code, so precision-critical rules never depend on a model.", b: ["AI judge with written rationale", "Deterministic checks for hard rules", "Per-example results and aggregate scores"] },
  { id: "prompts", t: "Release control", d: "Every prompt edit becomes a numbered, immutable version. Run any version on sample inputs, then score it across a full dataset before it reaches customers. Compare versions on identical cases.", b: ["Numbered, immutable versions", "Variable templating", "Version-to-version score comparison"] },
  { id: "monitoring", t: "Spend and reliability", d: "Daily volume, error rate, p50 and p95 latency, tokens and reported cost are calculated from your stored traces. The AI engine then summarises the week for decision-makers, using only those figures.", b: ["p50 and p95 latency", "Token and cost totals", "AI summary of failure patterns"] },
];

export default function Product() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow mb-3">Product</p>
      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">An AI engine that audits every agent your business runs.</h1>
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
        <h2 className="text-2xl font-semibold">Live in three steps</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
          <li>Create a workspace and generate an API key in Settings.</li>
          <li>Send traces to <code className="font-mono text-ink">/api/v1/traces</code> with the key as a Bearer token.</li>
          <li>Open Traces, save failures to a dataset, then score your first prompt version.</li>
        </ol>
        <div className="mt-6 flex gap-3">
          <Link href="/signup" className="btn-primary">Sign up</Link>
          <Link href="/login" className="btn-ghost">Sign in</Link>
        </div>
      </section>
    </div>
  );
}
