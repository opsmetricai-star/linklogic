import Link from "next/link";
import { Activity, FlaskConical, GitBranch, Gauge, ShieldCheck, Layers } from "lucide-react";

const snippet = `POST /api/v1/traces
Authorization: Bearer ll_••••••••

{ "traces": [{
    "name": "claims-triage-agent",
    "model": "gemini-3.8-flash",
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

const loop = [
  ["01", "Capture", "Every agent run is recorded with its steps, latency, tokens and cost."],
  ["02", "Analyze", "The AI engine reads runs and error patterns, then explains what is failing and why."],
  ["03", "Score", "An AI judge grades outputs against your standards. Deterministic checks back it up."],
  ["04", "Release", "Each prompt change is scored on real cases first, so releases carry evidence."],
];

const features = [
  { icon: Activity, t: "Run intelligence", d: "Cut diagnosis time from hours to minutes. Every run is a step-by-step tree, so operators find the failing tool call or model step immediately." },
  { icon: FlaskConical, t: "AI quality scoring", d: "Reduce the risk of wrong answers reaching customers. An AI judge grades each output against criteria you define and writes the reason for every score." },
  { icon: GitBranch, t: "Release control", d: "Ship prompt changes faster and with proof. Immutable versions are scored against your own cases before they go live." },
  { icon: Gauge, t: "Spend and reliability", d: "Control cost and downtime. Error rate, p50 and p95 latency, tokens and spend are computed from stored runs, then summarised by AI for decision-makers." },
  { icon: Layers, t: "Failure-to-test pipeline", d: "Turn every production failure into a permanent regression case, so the same error does not cost you twice." },
  { icon: ShieldCheck, t: "Enterprise-grade isolation", d: "Pass security review with confidence. Row-level data isolation per workspace, hashed API keys and server-side validation on every write." },
];

export default function Home() {
  return (
    <>
      <section className="grid-bg border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div className="min-w-0">
            <p className="eyebrow mb-5">AI operations platform for enterprises</p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Stop paying for AI errors your customers find first.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              LinkLogic&apos;s AI engine reads every run your agents make, scores quality against your standards and
              flags the failures that cost revenue and add risk. Operators release changes with proof.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-6 py-3">Sign up</Link>
              <Link href="/login" className="btn-ghost px-6 py-3">Sign in</Link>
            </div>
            <p className="mt-4 text-sm text-muted">The free plan includes 5,000 traces per month.</p>
          </div>
          <div className="min-w-0 self-center">
            <div className="overflow-hidden rounded-lg border border-ink bg-ink text-paper shadow-[6px_6px_0_#C8F560]">
              <div className="border-b border-white/10 px-4 py-2 font-mono text-xs text-paper/60">One request records a full agent run</div>
              <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed"><code>{snippet}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight">From raw agent activity to a business decision in four steps.</h2>
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="eyebrow !text-lime">Platform</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Outcomes your operations and risk teams can measure.</h2>
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

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight">Put your agents under measurable control.</h2>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="btn-accent px-6 py-3">Sign up</Link>
          <Link href="/login" className="btn-ghost px-6 py-3">Sign in</Link>
        </div>
      </section>
    </>
  );
}
