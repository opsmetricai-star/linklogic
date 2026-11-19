import Link from "next/link";
import { Activity, FlaskConical, GitBranch, Gauge, ShieldCheck, Layers } from "lucide-react";

const snippet = `curl -X POST https://your-app.vercel.app/api/v1/traces \\
  -H "Authorization: Bearer ll_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{ "traces": [{
    "name": "support-agent",
    "model": "gemini-2.0-flash",
    "input": "Where is my order?",
    "output": "It ships tomorrow.",
    "latency_ms": 840,
    "prompt_tokens": 212,
    "completion_tokens": 18,
    "spans": [
      { "id": "a", "name": "lookup_order", "kind": "tool", "latency_ms": 310 },
      { "id": "b", "parent_id": "a", "name": "generate", "kind": "llm" }
    ]
  }]}'`;

const loop = [
  ["01", "Trace", "Capture every run with nested steps, tokens, cost and latency."],
  ["02", "Curate", "Promote real production runs into datasets with one click."],
  ["03", "Evaluate", "Score prompt versions against those datasets before you ship."],
  ["04", "Monitor", "Watch error rate, latency and quality drift, then repeat."],
];

const features = [
  { icon: Activity, t: "Trace explorer", d: "Inspect each run as a tree of LLM calls, tools and retrievals, with timing and token counts on every step." },
  { icon: FlaskConical, t: "Evaluations", d: "Run experiments over a dataset with exact-match, regex, JSON and length checks, plus an LLM judge for subjective quality." },
  { icon: GitBranch, t: "Prompt versioning", d: "Every edit is a numbered version. Try changes in a playground and compare versions on the same examples." },
  { icon: Gauge, t: "Production monitoring", d: "Daily volume, error rate, p50/p95 latency and spend, computed directly from your stored traces." },
  { icon: Layers, t: "Feedback loops", d: "Attach scores to traces, filter for failures and turn them into regression tests." },
  { icon: ShieldCheck, t: "Tenant isolation", d: "Row Level Security on every table. API keys are hashed and shown once." },
];

export default function Home() {
  return (
    <>
      <section className="grid-bg border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div>
            <p className="eyebrow mb-5">Reliability layer for AI agents</p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Know what your agent did, and whether it got better.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              LinkLogic records every agent run, turns real failures into test cases, and scores each prompt change
              before it reaches your users.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-5 py-3">Create free workspace</Link>
              <Link href="/product" className="btn-ghost px-5 py-3">See how it works</Link>
            </div>
            <p className="mt-4 text-sm text-muted">Free plan includes 5,000 traces a month. No card required.</p>
          </div>
          <div className="self-center">
            <div className="overflow-hidden rounded-lg border border-ink bg-ink text-paper shadow-[6px_6px_0_#C8F560]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-xs text-paper/60">
                <span>Send a trace in one request</span><span>POST</span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed"><code>{snippet}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow mb-3">The loop</p>
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">Four steps from a bad answer to a verified fix.</h2>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {loop.map(([n, t, d]) => (
            <li key={n} className="bg-card p-6">
              <span className="font-mono text-xs text-muted">{n}</span>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-forest text-paper">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow !text-lime">Platform</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Everything the loop needs, in one workspace.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: I, t, d }) => (
              <div key={t} className="rounded-lg border border-white/15 p-6">
                <I className="h-5 w-5 text-lime" aria-hidden />
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-paper/70">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight">Ship the next prompt change with evidence.</h2>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="btn-accent px-5 py-3">Start free</Link>
          <Link href="/pricing" className="btn-ghost px-5 py-3">View pricing</Link>
        </div>
      </section>
    </>
  );
}
