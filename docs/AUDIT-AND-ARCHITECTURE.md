# Reference audit & architecture

## 1. Reference audit (langchain.com, public pages only)

Inspected: homepage, pricing, LangSmith platform, observability, evaluation, agent server, fleet, engine, sandboxes, LLM gateway, LangGraph, about, customers, and the sign-in entry point.

**Not inspectable** (and therefore not claimed): the logged-in app (client-rendered behind auth, not bypassed), docs site (DNS failure from the audit tool), and the site's CSS. **Colours, fonts and spacing of the reference were not measured.** The visual direction below is an original choice informed only by page structure (mega-menu header, hero with two CTAs, logo strip, alternating feature blocks, three-tier pricing table, FAQ, multi-column footer).

**Concept observed:** an "agent engineering platform": tracing/observability, offline + online evaluation, datasets and annotation, prompt iteration/playground, deployment runtime, no-code agent builder, gateway/governance. Customers: AI/agent engineers and product teams; tiers: free developer, per-seat team plan, enterprise. Metering by traces and compute units.

## 2. What LinkLogic adapts (and what it deliberately doesn't)

| Reference capability | LinkLogic v0.1 |
|---|---|
| Observability / traces | Implemented: API-key ingestion, nested spans, trace explorer, feedback |
| Evaluation (datasets, experiments, evaluators) | Implemented: datasets, 5 deterministic evaluators + LLM judge, experiments |
| Prompt engineering / playground | Implemented: versioned prompts, playground |
| Monitoring dashboards | Implemented: volume, error rate, p50/p95, tokens, cost, AI summary |
| Pricing / usage metering | Implemented: 3 plans, trace + AI quotas, billing page, webhook activation |
| Agent Server (deployment), Sandboxes, Fleet, Gateway, Engine, Insights clustering, annotation queues, SSO/RBAC | **Not built.** Out of scope for a first version |

## 3. Design system

Original palette: paper `#F5F3EC`, ink `#0E1B17`, forest `#12372C`, lime accent `#C8F560`, hairline `#DAD6C8`. Inter + JetBrains Mono. Grid-paper hero, hard offset shadow on the code block, no gradients or glass. The hero shows a real ingestion request rather than a fake product screenshot.

## 4. Architecture

- Next.js 15 App Router, React 19, TypeScript, Tailwind 3. Server components + server actions (Zod-validated).
- Supabase: Auth, Postgres, RLS (`supabase/schema.sql`). Every tenant table carries `org_id`; policies use `is_member(org_id)`. A signup trigger creates workspace, membership and default project.
- Ingestion (`/api/v1/traces`) authenticates by SHA-256-hashed API key, then writes with the service role scoped to the key's org. Quota enforced against the plan.
- AI (`lib/ai.ts`, Gemini REST): judge output is schema-validated; monitoring summary receives precomputed statistics only. Deterministic maths lives in `lib/evaluators.ts` and `lib/stats.ts`.
- Billing: payment links carry `client_reference_id=<org id>`; `/api/webhooks/billing` verifies a Stripe-style HMAC signature, is idempotent, and is the only path that sets a paid plan. Paid limits apply only while `plan_status = 'active'`.

## 5. Known limits

Experiments run synchronously (max 50 examples/run, 60s function limit). Retention windows are advertised per plan but no purge job exists yet. Cost is whatever the client reports. Single workspace per user in the UI; no invites yet.
