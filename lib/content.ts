export interface Module {
  slug: string;
  name: string;
  stage: string;
  headline: string;
  sub: string;
  bullets: [string, string][];
  how: [string, string][];
  details: string[];
  faq: [string, string][];
  screen: string;
  screenAlt: string;
}

export const modules: Module[] = [
  {
    slug: "tracing",
    name: "Run intelligence",
    stage: "Capture",
    headline: "See every agent run, step by step.",
    sub: "Cut diagnosis time from hours to minutes. Each run is recorded as a tree of model calls, tool calls and retrievals, with latency, tokens and cost on every step.",
    bullets: [
      ["Record", "every agent run with one authenticated request, from any language or framework."],
      ["Locate", "the failing tool call or slow model step without reading logs."],
      ["Reuse", "real failures as test cases with one action."],
    ],
    how: [
      ["Create a key", "Generate a project API key in Settings. Only a hash is stored, so the key is shown once."],
      ["Send traces", "POST runs to /api/v1/traces with input, output, model, tokens, cost, tags and nested steps."],
      ["Investigate", "Filter by status or name, open a run, score it, or save it to a dataset."],
    ],
    details: [
      "Nested LLM, tool, retriever and chain steps with timing bars",
      "Batches of up to 100 traces per request, 200 steps per trace",
      "Per-run feedback score (good or poor)",
      "Search by name and filter by success or error",
      "Revocable keys with last-used timestamps",
    ],
    faq: [
      ["Which models and frameworks does it work with?", "Any. LinkLogic receives plain HTTP requests, so you can send runs from any model provider, framework or language."],
      ["What happens if I exceed my trace limit?", "Ingestion returns a clear 429 error and nothing is deleted. The limit resets monthly, or you can upgrade."],
      ["Who can see my traces?", "Only members of your workspace. Access is enforced in the database with Row Level Security."],
    ],
    screen: "/screens/tracing.png",
    screenAlt: "LinkLogic trace explorer showing a run with nested steps",
  },
  {
    slug: "evaluation",
    name: "AI quality scoring",
    stage: "Score",
    headline: "Know whether outputs are right, before customers do.",
    sub: "An AI judge grades each output against criteria you write and explains every score. Deterministic checks handle hard rules, so precision never depends on a model.",
    bullets: [
      ["Score", "outputs with an AI judge that returns a number and a written reason."],
      ["Enforce", "exact-match, contains, regex, valid-JSON and length rules as plain code."],
      ["Compare", "results across the same dataset to see what a change really did."],
    ],
    how: [
      ["Build a dataset", "Add examples by hand, in bulk, or save them from real production traces."],
      ["Choose evaluators", "Combine deterministic checks with an AI judge and your own criteria."],
      ["Run and review", "Every example gets per-evaluator scores, the model output and the judge's reasoning."],
    ],
    details: [
      "Exact match, contains, regex, JSON validity and max length evaluators",
      "AI judge with validated 0 to 1 score and rationale",
      "Per-example results plus aggregate averages",
      "Failed AI calls are shown as missing, never as zero",
      "Datasets built from traces keep a link to the source run",
    ],
    faq: [
      ["Can the AI judge be trusted?", "It is one signal, not the only one. Hard rules run as deterministic code, and every judge score includes its reasoning so reviewers can audit it."],
      ["How big can an experiment be?", "A run scores the first 12 examples of a dataset. Larger sets can be split across datasets."],
      ["Does scoring use my plan allowance?", "Each model generation and each judge score counts as one AI-assisted run. Deterministic checks are free."],
    ],
    screen: "/screens/evaluation.png",
    screenAlt: "LinkLogic experiment results with exact match and judge scores",
  },
  {
    slug: "prompts",
    name: "Release control",
    stage: "Release",
    headline: "Ship prompt changes with proof, not hope.",
    sub: "Every edit becomes a numbered, immutable version. Run any version in the playground, then score it across a dataset before it reaches production.",
    bullets: [
      ["Version", "every prompt change automatically, with notes on what changed."],
      ["Test", "a version on sample inputs in the playground."],
      ["Gate", "releases on dataset scores instead of spot checks."],
    ],
    how: [
      ["Write a template", "Use {{input}} where the example input belongs."],
      ["Save versions", "Each save creates the next version. Nothing is overwritten."],
      ["Score and compare", "Run experiments on any version and compare scores side by side."],
    ],
    details: [
      "Immutable numbered versions with change notes",
      "Variable templating",
      "Playground generations on any version",
      "Experiments linked to the exact version they scored",
      "Full history per prompt",
    ],
    faq: [
      ["Can I roll back?", "Yes. Older versions are never changed, so you can reuse any of them as the starting point for the next version."],
      ["Which model runs my prompts?", "The playground and experiments run on the AI engine configured for your LinkLogic workspace."],
      ["Are versions shared with my team?", "Yes. Prompts belong to the workspace and are visible to every member."],
    ],
    screen: "/screens/prompts.png",
    screenAlt: "LinkLogic prompt versions and playground",
  },
  {
    slug: "monitoring",
    name: "Spend and reliability",
    stage: "Monitor",
    headline: "Catch regressions the day they start.",
    sub: "Error rate, p50 and p95 latency, tokens and spend are computed from your stored traces. The AI engine then explains the week for decision-makers, using only those figures.",
    bullets: [
      ["Measure", "volume, error rate and latency percentiles per day."],
      ["Control", "cost with token and reported-spend totals."],
      ["Explain", "failure patterns with an AI summary grounded in your data."],
    ],
    how: [
      ["Send traces", "Monitoring needs no extra setup. It reads the traces you already send."],
      ["Watch the trend", "Fourteen days of volume, errors and p95 latency in two charts."],
      ["Ask for a summary", "One click produces a short brief with a suggested next step."],
    ],
    details: [
      "Daily trace and error counts",
      "p50 and p95 latency",
      "Token and reported cost totals",
      "AI summary that never invents numbers: statistics are computed in code first",
      "Usage meters against your plan limits",
    ],
    faq: [
      ["Where do the numbers come from?", "From the traces you send, calculated deterministically. The AI only interprets them."],
      ["Is cost calculated by LinkLogic?", "Cost is the value your application reports on each trace. LinkLogic totals it and does not estimate prices."],
      ["Can I get alerts?", "Alerting is not part of the current release. Monitoring is a dashboard and on-demand summary."],
    ],
    screen: "/screens/monitoring.png",
    screenAlt: "LinkLogic monitoring dashboard with error rate and latency charts",
  },
];

export const moduleBySlug = (s: string) => modules.find((m) => m.slug === s);
