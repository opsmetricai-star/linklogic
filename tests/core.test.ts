import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { runDeterministic, summarize, renderTemplate } from "../lib/evaluators.ts";
import { verifySignature, parsePlanMap } from "../lib/webhook.ts";
import { percentile, totals, dailySeries } from "../lib/stats.ts";

test("exact_match normalises case and whitespace", () => {
  assert.equal(runDeterministic({ type: "exact_match" }, "  Paris \n", "paris")?.score, 1);
  assert.equal(runDeterministic({ type: "exact_match" }, "Lyon", "paris")?.score, 0);
  assert.equal(runDeterministic({ type: "exact_match" }, "x", null)?.score, 0);
});
test("contains / json / regex / length", () => {
  assert.equal(runDeterministic({ type: "contains" }, "The capital is Paris.", "paris")?.score, 1);
  assert.equal(runDeterministic({ type: "json_valid" }, '{"a":1}', null)?.score, 1);
  assert.equal(runDeterministic({ type: "json_valid" }, "{a", null)?.score, 0);
  assert.equal(runDeterministic({ type: "regex", value: "^sorry" }, "Sorry, no", null)?.score, 1);
  assert.equal(runDeterministic({ type: "regex", value: "(" }, "x", null)?.score, 0);
  assert.equal(runDeterministic({ type: "max_length", value: "5" }, "abcdef", null)?.score, 0);
  assert.equal(runDeterministic({ type: "llm_judge", value: "x" }, "a", null), null);
});
test("summarize averages per key", () => {
  assert.deepEqual(summarize([{ scores: { a: 1 } }, { scores: { a: 0, b: 1 } }]), { a: 0.5, b: 1 });
});
test("renderTemplate leaves unknown vars visible", () => {
  assert.equal(renderTemplate("Q: {{input}} {{other}}", { input: "hi" }), "Q: hi {{other}}");
});
test("webhook signature verification", () => {
  const secret = "whsec_test", body = '{"id":"evt_1"}', now = 1_700_000_000_000, t = now / 1000;
  const sig = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  assert.equal(verifySignature(body, `t=${t},v1=${sig}`, secret, 300, now), true);
  assert.equal(verifySignature(body + " ", `t=${t},v1=${sig}`, secret, 300, now), false);
  assert.equal(verifySignature(body, `t=${t},v1=${sig}`, "other", 300, now), false);
  assert.equal(verifySignature(body, `t=${t - 1000},v1=${sig}`, secret, 300, now), false);
  assert.equal(verifySignature(body, null, secret), false);
});
test("plan map parsing ignores junk", () => {
  assert.deepEqual(parsePlanMap("plink_1:plus, price_2:scale,bad:enterprise,"), { plink_1: "plus", price_2: "scale" });
});
test("stats", () => {
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.95), 10);
  const now = new Date("2026-11-19T12:00:00Z");
  const rows = [
    { started_at: "2026-11-19T01:00:00Z", status: "error", latency_ms: 100, cost_usd: "0.5", prompt_tokens: 1, completion_tokens: 2 },
    { started_at: "2026-11-18T01:00:00Z", status: "success", latency_ms: 300, cost_usd: 0.25, prompt_tokens: 1, completion_tokens: 1 },
  ];
  const t = totals(rows);
  assert.equal(t.errorRate, 0.5); assert.equal(t.cost, 0.75); assert.equal(t.tokens, 5);
  const s = dailySeries(rows, 3, now);
  assert.deepEqual(s.map((d) => d.traces), [0, 1, 1]);
  assert.equal(s[2].errors, 1);
});
