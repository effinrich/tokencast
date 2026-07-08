-- Tokencast Save & Share: two tables, zero direct anon table access.
-- All reads/writes for anonymous clients go through SECURITY DEFINER RPCs
-- (see the following migration), so RLS on the tables themselves stays fully
-- locked down (no anon SELECT/INSERT/UPDATE/DELETE policies at all) — this
-- prevents bulk enumeration of other users' saved shares via the anon key,
-- which a naive "USING (true)" SELECT policy would allow.

create table if not exists public.token_shares (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint token_shares_payload_size check (pg_column_size(payload) <= 20000)
);

alter table public.token_shares enable row level security;
-- Intentionally no policies here — access only via the RPCs below.

create table if not exists public.tokencast_share_rate_limit (
  id bigint generated always as identity primary key,
  client_ip text not null,
  created_at timestamptz not null default now()
);

alter table public.tokencast_share_rate_limit enable row level security;
-- Intentionally no policies here either.

create index if not exists tokencast_share_rate_limit_ip_time_idx
  on public.tokencast_share_rate_limit (client_ip, created_at);

-- TTL / cleanup policy (documented, not yet scheduled — see README's
-- "Data retention" section for the plan to automate this via Supabase Cron):
--   delete from public.token_shares where created_at < now() - interval '30 days';
--   delete from public.tokencast_share_rate_limit where created_at < now() - interval '1 day';
