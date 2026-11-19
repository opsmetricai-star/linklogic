import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Solutions" };

const items = [
  ["Support agents", "Find the conversations where the agent guessed, then lock in the corrected answer as a regression test."],
  ["Retrieval-augmented assistants", "Trace retriever spans next to the generation so you can see whether a bad answer was a retrieval or a prompt problem."],
  ["Workflow & tool-calling agents", "Follow multi-step runs, spot the slow or failing tool, and track error rate per release."],
  ["Prompt-heavy product teams", "Give product and engineering one place to version prompts and compare them on shared examples."],
];

export default function Solutions() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">Solutions</p>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">Built for teams with agents in production.</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map(([t, d]) => (
          <div key={t} className="panel p-6">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
      <Link href="/signup" className="btn-primary mt-10">Start free</Link>
    </div>
  );
}
