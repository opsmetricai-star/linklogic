import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Solutions" };

const items = [
  ["Customer operations", "Lower escalation cost. The AI engine surfaces conversations where the agent guessed, and each one becomes a regression case that protects future releases."],
  ["Knowledge and retrieval systems", "Cut wrong-answer risk. Retriever steps sit beside generation, so teams see whether a bad answer came from the data or the prompt."],
  ["Workflow automation", "Raise completion rates. Multi-step runs expose the slow or failing tool, and error rate is tracked per release."],
  ["Platform and product teams", "Shorten release cycles. Engineering and product share one record of prompt versions, scores and production behaviour."],
];

export default function Solutions() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow mb-3">Solutions</p>
      <h1 className="display max-w-3xl text-4xl sm:text-5xl">Built for operators who answer for what their agents do.</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map(([t, d]) => (
          <div key={t} className="panel p-6">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex gap-3">
        <Link href="/signup" className="btn-primary">Sign up</Link>
        <Link href="/login" className="btn-ghost">Sign in</Link>
      </div>
    </div>
  );
}
