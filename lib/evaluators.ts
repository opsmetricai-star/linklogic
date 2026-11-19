// Deterministic evaluators. Pure functions: no AI, fully testable.
export type EvaluatorType = "exact_match" | "contains" | "regex" | "json_valid" | "max_length" | "llm_judge";

export interface EvaluatorConfig {
  type: EvaluatorType;
  /** regex source, max length, or judge criteria */
  value?: string;
}

export interface Score {
  key: string;
  score: number; // 0..1
  reasoning?: string;
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

export function runDeterministic(cfg: EvaluatorConfig, output: string, expected: string | null): Score | null {
  switch (cfg.type) {
    case "exact_match":
      if (expected == null || expected === "") return { key: "exact_match", score: 0, reasoning: "No expected output on this example." };
      return { key: "exact_match", score: norm(output) === norm(expected) ? 1 : 0 };
    case "contains":
      if (expected == null || expected === "") return { key: "contains", score: 0, reasoning: "No expected output on this example." };
      return { key: "contains", score: norm(output).includes(norm(expected)) ? 1 : 0 };
    case "regex": {
      try {
        if (!cfg.value || cfg.value.length > 200) return { key: "regex", score: 0, reasoning: "Invalid pattern." };
        return { key: "regex", score: new RegExp(cfg.value, "i").test(output) ? 1 : 0 };
      } catch {
        return { key: "regex", score: 0, reasoning: "Invalid pattern." };
      }
    }
    case "json_valid":
      try {
        JSON.parse(output);
        return { key: "json_valid", score: 1 };
      } catch {
        return { key: "json_valid", score: 0 };
      }
    case "max_length": {
      const max = Number(cfg.value);
      if (!Number.isFinite(max) || max <= 0) return { key: "max_length", score: 0, reasoning: "Invalid limit." };
      return { key: "max_length", score: output.length <= max ? 1 : 0, reasoning: `${output.length}/${max} chars` };
    }
    default:
      return null; // llm_judge is handled by the AI layer
  }
}

export function summarize(rows: { scores: Record<string, number> }[]): Record<string, number> {
  const sums: Record<string, { t: number; n: number }> = {};
  for (const r of rows)
    for (const [k, v] of Object.entries(r.scores)) {
      sums[k] ??= { t: 0, n: 0 };
      sums[k].t += v;
      sums[k].n += 1;
    }
  return Object.fromEntries(Object.entries(sums).map(([k, s]) => [k, Math.round((s.t / s.n) * 1000) / 1000]));
}

/** Fill {{variables}} in a template. Unknown variables are left visible so mistakes are obvious. */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z_][\w]*)\s*\}\}/g, (m, k) => (k in vars ? vars[k] : m));
}
