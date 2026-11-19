import Link from "next/link";
import type { Metadata } from "next";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = { title: "Documentation" };

const nav = [["quickstart", "Quickstart"], ["api", "Trace API"], ["fields", "Fields"], ["evaluators", "Evaluators"], ["limits", "Plan limits"], ["errors", "Errors"]];

const example = `curl -X POST https://YOUR-DOMAIN/api/v1/traces \\
  -H "Authorization: Bearer ll_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "traces": [{
      "name": "support-agent",
      "model": "your-model",
      "input": "Where is my order?",
      "output": "It ships tomorrow.",
      "latency_ms": 840,
      "prompt_tokens": 212,
      "completion_tokens": 18,
      "cost_usd": 0.002,
      "tags": ["production"],
      "spans": [
        { "id": "a", "name": "lookup_order", "kind": "tool", "latency_ms": 310 },
        { "id": "b", "parent_id": "a", "name": "generate", "kind": "llm", "offset_ms": 310, "latency_ms": 500 }
      ]
    }]
  }'`;

const fields: [string, string, string][] = [
  ["name", "string, required", "Label for the run, up to 200 characters."],
  ["status", "success | error", "Defaults to error when an error message is present, otherwise success."],
  ["input, output", "any JSON", "Request and response of the run."],
  ["error", "string", "Failure message, up to 4,000 characters."],
  ["model", "string", "Model identifier, up to 100 characters."],
  ["started_at", "ISO 8601 datetime", "Defaults to the time of receipt."],
  ["latency_ms", "integer", "Total duration in milliseconds."],
  ["prompt_tokens, completion_tokens", "integer", "Token counts for the run."],
  ["cost_usd", "number", "Cost you calculate and report. LinkLogic totals it and does not estimate prices."],
  ["tags", "string[]", "Up to 20 tags of 50 characters."],
  ["metadata", "object", "Free-form key-value data."],
  ["spans", "array, up to 200", "Steps of the run. Each has name, kind (llm, tool, retriever, chain), optional id and parent_id for nesting, offset_ms, latency_ms, tokens, input, output and error."],
];

const evaluators: [string, string][] = [
  ["exact_match", "Passes when the output equals the expected answer after trimming whitespace and ignoring case."],
  ["contains", "Passes when the output includes the expected text."],
  ["regex", "Passes when the output matches your pattern (case-insensitive, up to 200 characters)."],
  ["json_valid", "Passes when the output parses as JSON."],
  ["max_length", "Passes when the output is no longer than your character limit."],
  ["llm_judge", "An AI judge grades the output against your written criteria and returns a score from 0 to 1 with a short reason."],
];

export default function Docs() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:h-fit">
        <p className="eyebrow mb-4">Documentation</p>
        <nav aria-label="Documentation" className="flex gap-4 overflow-x-auto lg:block lg:space-y-2">
          {nav.map(([id, l]) => <a key={id} href={`#${id}`} className="block whitespace-nowrap font-mono text-[13px] text-muted hover:text-display">{l}</a>)}
        </nav>
      </aside>
      <div className="min-w-0 space-y-16">
        <section id="quickstart">
          <h1 className="display text-4xl sm:text-5xl">Send your first trace in minutes.</h1>
          <ol className="mt-8 space-y-4">
            <li className="flex gap-4"><span className="font-mono text-lime">01</span><span><Link href="/signup" className="underline">Create an account</Link>. A workspace and project are created automatically.</span></li>
            <li className="flex gap-4"><span className="font-mono text-lime">02</span><span>Open Settings and create an API key. Copy it immediately: it is shown once.</span></li>
            <li className="flex gap-4"><span className="font-mono text-lime">03</span><span>POST a batch of traces to the endpoint below.</span></li>
            <li className="flex gap-4"><span className="font-mono text-lime">04</span><span>Open Traces in the dashboard to inspect the run, score it or save it to a dataset.</span></li>
          </ol>
        </section>

        <section id="api">
          <h2 className="display text-3xl">Trace API</h2>
          <p className="mt-3 text-muted"><code className="font-mono text-ink">POST /api/v1/traces</code> accepts 1 to 100 traces per request and returns <code className="font-mono text-ink">201</code> with the accepted count and ids. Authenticate with <code className="font-mono text-ink">Authorization: Bearer ll_...</code>.</p>
          <pre className="mt-5 overflow-x-auto rounded-xl border border-line bg-card p-5 font-mono text-[12.5px] leading-relaxed text-ink"><code>{example}</code></pre>
        </section>

        <section id="fields">
          <h2 className="display text-3xl">Fields</h2>
          <div className="panel mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line"><th className="th">Field</th><th className="th">Type</th><th className="th">Description</th></tr></thead>
              <tbody>{fields.map(([f, t, d]) => (
                <tr key={f} className="border-b border-line last:border-0"><td className="td font-mono text-xs text-display">{f}</td><td className="td font-mono text-xs text-muted">{t}</td><td className="td text-muted">{d}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section id="evaluators">
          <h2 className="display text-3xl">Evaluators</h2>
          <p className="mt-3 text-muted">Combine any of these in an experiment. Deterministic evaluators are free and run as code.</p>
          <div className="panel mt-5 divide-y divide-line">
            {evaluators.map(([k, d]) => <div key={k} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6"><code className="w-32 shrink-0 font-mono text-xs text-display">{k}</code><span className="text-sm text-muted">{d}</span></div>)}
          </div>
        </section>

        <section id="limits">
          <h2 className="display text-3xl">Plan limits</h2>
          <div className="panel mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line"><th className="th">Plan</th><th className="th">Traces / month</th><th className="th">AI-assisted runs / month</th><th className="th">Examples / dataset</th></tr></thead>
              <tbody>{Object.values(PLANS).map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0"><td className="td text-display">{p.name}</td><td className="td font-mono text-xs">{p.traces.toLocaleString("en-US")}</td><td className="td font-mono text-xs">{p.aiCalls.toLocaleString("en-US")}</td><td className="td font-mono text-xs">{p.examplesPerDataset.toLocaleString("en-US")}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section id="errors">
          <h2 className="display text-3xl">Errors</h2>
          <div className="panel mt-5 divide-y divide-line text-sm">
            {[["400", "The body failed validation. The response lists the first issues."], ["401", "The API key is missing, invalid or revoked."], ["413", "The request body is larger than 2 MB."], ["429", "The monthly trace limit for the plan has been reached."]].map(([c, d]) => (
              <div key={c} className="flex gap-6 p-4"><code className="w-10 font-mono text-display">{c}</code><span className="text-muted">{d}</span></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
