import Link from "next/link";
import { Activity, FlaskConical, GitBranch, Gauge, Layers, ShieldCheck } from "lucide-react";
import { DotField } from "@/components/DotField";
import { Lifecycle } from "@/components/Lifecycle";
import { modules } from "@/lib/content";

const snippet = `POST /api/v1/traces
Authorization: Bearer ll_••••••••

{ "traces": [{
    "name": "claims-triage-agent",
    "model": "your-model",
    "input": "Water damage claim, policy 4471",
    "output": "Route to senior adjuster",
    "latency_ms": 840,
    "prompt_tokens": 212,
    "completion_tokens": 18,
    "spans": [
      { "id": "a", "name": "policy_lookup", "kind": "tool" },
      { "id": "b", "parent_id": "a", "name": "decide", "kind": "llm" }
    ]
}]}`;

const features = [
  { icon: Activity, t: "Run intelligence", d: "Cut diagnosis time from hours to minutes. Every run is a step-by-step tree, so operators find the failing tool call or model step immediately." },
  { icon: FlaskConical, t: "AI quality scoring", d: "Reduce the risk of wrong answers reaching customers. An AI judge grades outputs against your criteria and writes the reason for every score." },
  { icon: GitBranch, t: "Release control", d: "Ship prompt changes faster and with proof. Immutable versions are scored against your own cases before they go live." },
  { icon: Gauge, t: "Spend and reliability", d: "Control cost and downtime. Error rate, latency percentiles, tokens and spend are computed from stored runs, then summarised by AI." },
  { icon: Layers, t: "Failure-to-test pipeline", d: "Turn every production failure into a permanent regression case, so the same error does not cost you twice." },
  { icon: ShieldCheck, t: "Enterprise-grade isolation", d: "Pass security review with confidence. Row-level data isolation per workspace, hashed API keys and server-side validation on every write." },
];

const faqs = [
  ["What is LinkLogic?", "An AI operations platform. It records every run your agents make, scores quality with an AI judge and deterministic checks, versions your prompts and monitors reliability and spend."],
  ["Which models and frameworks does it support?", "Any. Runs are sent as plain HTTP requests, so LinkLogic works with every model provider, framework and language."],
  ["How long does setup take?", "Create a workspace, generate an API key and send your first trace. Most teams can see their first run in the explorer within minutes."],
  ["Is there a free plan?", "Yes. The Developer plan is free and includes 5,000 traces per month. Paid plans start at $47 per month."],
  ["How is customer data protected?", "Every table is protected by Row Level Security, API keys are stored as hashes, and all writes are validated on the server."],
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[56%] opacity-70 [mask-image:linear-gradient(to_right,transparent,black_45%)] lg:block"><DotField /></div>
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-32">
          <p className="eyebrow mb-6">AI operations platform for enterprises</p>
          <h1 className="display max-w-3xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">Stop paying for AI errors your customers find first.</h1>
          <p className="sub mt-6 max-w-2xl text-xl font-light leading-snug sm:text-2xl">
            Run, score and govern every agent in your business with an AI engine that flags the failures that cost revenue and add risk.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3">Sign up</Link>
            <Link href="/login" className="btn-ghost px-6 py-3">Sign in</Link>
          </div>
          <p className="mt-5 font-mono text-xs text-muted">Free plan includes 5,000 traces per month</p>
        </div>
        <div className="border-y border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-5 font-mono text-xs uppercase tracking-widest text-muted sm:px-6">
            <span>Any model</span><span>Any framework</span><span>Any language</span><span>One HTTP request</span><span>Workspace-level isolation</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="eyebrow mb-4">The reliability lifecycle</p>
        <h2 className="display max-w-3xl text-4xl sm:text-5xl">Accelerate every stage, from first trace to confident release.</h2>
        <div className="mt-12"><Lifecycle modules={modules} /></div>
      </section>

      <section className="border-y border-line bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="eyebrow mb-4">Platform</p>
          <h2 className="display max-w-3xl text-4xl">Outcomes your operations and risk teams can measure.</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: I, t, d }) => (
              <div key={t} className="bg-paper p-7">
                <I className="h-5 w-5 text-lime" aria-hidden />
                <h3 className="mt-5 text-lg font-medium text-display">{t}</h3>
                <p className="mt-2 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Integration</p>
          <h2 className="display text-4xl">One request records a full agent run.</h2>
          <p className="sub mt-4 text-lg font-light">No SDK to adopt and no framework to migrate to. Send the run, with its steps, from the code you already have.</p>
          <ol className="mt-8 space-y-4">
            {["Generate an API key in Settings.", "POST runs to the trace endpoint.", "Open the explorer and start scoring."].map((s, k) => (
              <li key={s} className="flex gap-4"><span className="font-mono text-sm text-lime">0{k + 1}</span><span>{s}</span></li>
            ))}
          </ol>
          <Link href="/docs" className="btn-ghost mt-8">Documentation</Link>
        </div>
        <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-card">
          <div className="border-b border-line px-4 py-2.5 font-mono text-xs text-muted">POST /api/v1/traces</div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-ink"><code>{snippet}</code></pre>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <p className="eyebrow mb-4">Questions</p>
        <h2 className="display text-4xl">Answers for evaluation teams.</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg text-display">
                {q}<span className="font-mono text-muted transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h2 className="display mx-auto max-w-2xl text-4xl sm:text-5xl">Put your agents under measurable control.</h2>
        <div className="mt-9 flex justify-center gap-3">
          <Link href="/signup" className="btn-primary px-6 py-3">Sign up</Link>
          <Link href="/login" className="btn-ghost px-6 py-3">Sign in</Link>
        </div>
      </section>
    </>
  );
}
