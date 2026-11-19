# LinkLogic

Reliability tooling for AI agents: tracing, datasets, evaluations, prompt versioning and monitoring. Next.js 15 + Supabase + Gemini.

See [docs/AUDIT-AND-ARCHITECTURE.md](docs/AUDIT-AND-ARCHITECTURE.md) for the reference audit and design decisions.

## Setup

1. `npm install`
2. Create a Supabase project. In the SQL editor run [`supabase/schema.sql`](supabase/schema.sql).
3. Supabase → Authentication → URL configuration: set Site URL to your deployed URL and add `<site>/auth/callback` to redirect URLs.
4. `cp .env.example .env.local` and fill it in (see below).
5. `npm run dev` → http://localhost:3000

## Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URL (email links, metadata) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Trace ingestion, usage counting, webhook, contact form |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | server | LLM judge, playground, experiments, monitoring summary |
| `NEXT_PUBLIC_PAYMENT_LINK_PLUS`, `NEXT_PUBLIC_PAYMENT_LINK_SCALE` | public | Hosted checkout URLs |
| `PAYMENT_WEBHOOK_SECRET` | server | Verifies payment webhooks |
| `PAYMENT_PLAN_MAP` | server | `plink_xxx:plus,plink_yyy:scale` |

Without Supabase vars the public site renders and `/dashboard` redirects to `/login?error=config`. Without `GEMINI_API_KEY`, AI features return a clear error; deterministic features still work. Without payment links, plan cards show a contact fallback.

## Payments

The payment links are expected to be Stripe-compatible. The app appends `client_reference_id=<org id>`. Point the provider's webhook at `https://<site>/api/webhooks/billing` (events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`) and set `PAYMENT_WEBHOOK_SECRET`. A plan is activated **only** by a validly signed event; returning from checkout does nothing. Manual alternative: update `organizations.plan`/`plan_status` with the service role.

## Sending traces

```bash
curl -X POST $APP_URL/api/v1/traces \
  -H "Authorization: Bearer ll_..." -H "Content-Type: application/json" \
  -d '{"traces":[{"name":"my-agent","input":"hi","output":"hello","latency_ms":420}]}'
```

## Deploy to Vercel

Import the repo, add the variables above (never commit them), deploy. Experiments need function duration ≥ 60s (Pro plan, or lower the example cap). Then set the Supabase Site URL and the payment webhook to the Vercel domain.

## Scripts

`npm run dev | build | start | typecheck | test`
