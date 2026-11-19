-- LinkLogic schema. Run in the Supabase SQL editor (or `supabase db push`).
-- Idempotent where practical.

create extension if not exists pgcrypto;

-- ───────────── Core tenancy ─────────────
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  plan text not null default 'free' check (plan in ('free','plus','scale')),
  plan_status text not null default 'inactive' check (plan_status in ('inactive','active','past_due','canceled')),
  payment_customer_id text,
  plan_renews_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists members (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index if not exists members_user_idx on members(user_id);

create or replace function is_member(org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members m where m.org_id = org and m.user_id = auth.uid());
$$;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (org_id, name)
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  prefix text not null,
  key_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists api_keys_org_idx on api_keys(org_id);

-- ───────────── Observability ─────────────
create table if not exists traces (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  status text not null default 'success' check (status in ('success','error')),
  input jsonb,
  output jsonb,
  error text,
  model text,
  started_at timestamptz not null default now(),
  latency_ms integer not null default 0 check (latency_ms >= 0),
  prompt_tokens integer not null default 0 check (prompt_tokens >= 0),
  completion_tokens integer not null default 0 check (completion_tokens >= 0),
  cost_usd numeric(12,6) not null default 0 check (cost_usd >= 0),
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  feedback_score numeric(4,3) check (feedback_score between 0 and 1),
  feedback_note text,
  created_at timestamptz not null default now()
);
create index if not exists traces_org_time_idx on traces(org_id, started_at desc);
create index if not exists traces_project_idx on traces(project_id, started_at desc);

create table if not exists spans (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid not null references traces(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  parent_id uuid references spans(id) on delete cascade,
  name text not null,
  kind text not null default 'chain' check (kind in ('llm','tool','retriever','chain')),
  input jsonb,
  output jsonb,
  error text,
  offset_ms integer not null default 0,
  latency_ms integer not null default 0,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0
);
create index if not exists spans_trace_idx on spans(trace_id);

-- ───────────── Datasets & experiments ─────────────
create table if not exists datasets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists examples (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references datasets(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  input text not null,
  expected text,
  source_trace_id uuid references traces(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists examples_dataset_idx on examples(dataset_id);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (org_id, name)
);

create table if not exists prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  version integer not null,
  template text not null check (char_length(template) <= 20000),
  notes text,
  created_at timestamptz not null default now(),
  unique (prompt_id, version)
);

create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  dataset_id uuid not null references datasets(id) on delete cascade,
  prompt_version_id uuid references prompt_versions(id) on delete set null,
  name text not null,
  evaluators jsonb not null default '[]'::jsonb,
  status text not null default 'running' check (status in ('running','completed','failed')),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists experiment_results (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references experiments(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  example_id uuid references examples(id) on delete set null,
  input text not null,
  expected text,
  output text,
  scores jsonb not null default '{}'::jsonb,
  reasoning jsonb not null default '{}'::jsonb,
  error text,
  latency_ms integer not null default 0
);
create index if not exists exp_results_idx on experiment_results(experiment_id);

-- ───────────── Usage, billing, contact ─────────────
create table if not exists ai_calls (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_calls_org_idx on ai_calls(org_id, created_at desc);

create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  org_id uuid references organizations(id) on delete set null,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ───────────── Signup bootstrap ─────────────
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare new_org uuid;
begin
  insert into organizations(name)
    values (coalesce(nullif(split_part(new.email,'@',1),''),'My') || '''s workspace')
    returning id into new_org;
  insert into members(org_id, user_id, role) values (new_org, new.id, 'owner');
  insert into projects(org_id, name) values (new_org, 'default');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ───────────── Row Level Security ─────────────
alter table organizations enable row level security;
alter table members enable row level security;
alter table projects enable row level security;
alter table api_keys enable row level security;
alter table traces enable row level security;
alter table spans enable row level security;
alter table datasets enable row level security;
alter table examples enable row level security;
alter table prompts enable row level security;
alter table prompt_versions enable row level security;
alter table experiments enable row level security;
alter table experiment_results enable row level security;
alter table ai_calls enable row level security;
alter table billing_events enable row level security;
alter table contact_messages enable row level security;

-- organizations: members read; may rename only (plan columns are not updatable by users)
drop policy if exists org_select on organizations;
create policy org_select on organizations for select using (is_member(id));
drop policy if exists org_update on organizations;
create policy org_update on organizations for update using (is_member(id)) with check (is_member(id));
revoke update on organizations from authenticated, anon;
grant update (name) on organizations to authenticated;

drop policy if exists members_select on members;
create policy members_select on members for select using (is_member(org_id));

-- Generic member-scoped policies for tenant tables
do $$
declare t text;
begin
  foreach t in array array['projects','datasets','examples','prompts','prompt_versions','experiments','experiment_results']
  loop
    execute format('drop policy if exists %I on %I', t||'_all', t);
    execute format('create policy %I on %I for all using (is_member(org_id)) with check (is_member(org_id))', t||'_all', t);
  end loop;
end $$;

-- api_keys: members can see/create/revoke their org's keys
drop policy if exists api_keys_all on api_keys;
create policy api_keys_all on api_keys for all using (is_member(org_id)) with check (is_member(org_id));

-- traces/spans: members read, update feedback, delete. Inserts happen server-side (service role) after key auth.
drop policy if exists traces_select on traces;
create policy traces_select on traces for select using (is_member(org_id));
drop policy if exists traces_update on traces;
create policy traces_update on traces for update using (is_member(org_id)) with check (is_member(org_id));
drop policy if exists traces_delete on traces;
create policy traces_delete on traces for delete using (is_member(org_id));
drop policy if exists spans_select on spans;
create policy spans_select on spans for select using (is_member(org_id));

-- Read-only for members; written only by the service role
drop policy if exists ai_calls_select on ai_calls;
create policy ai_calls_select on ai_calls for select using (is_member(org_id));
drop policy if exists billing_select on billing_events;
create policy billing_select on billing_events for select using (org_id is not null and is_member(org_id));
-- contact_messages: no policies → only service role can access

-- Users may not mutate trace identity columns
revoke update on traces from authenticated, anon;
grant update (feedback_score, feedback_note, tags) on traces to authenticated;
