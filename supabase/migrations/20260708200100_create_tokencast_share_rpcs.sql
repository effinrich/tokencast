-- SECURITY DEFINER RPCs are the ONLY way the anon role touches
-- token_shares / tokencast_share_rate_limit. Both set search_path
-- explicitly (required hardening for SECURITY DEFINER functions in
-- Postgres — an unset search_path is a real privilege-escalation vector if
-- a caller can create objects earlier in the resolution path).

create or replace function public.create_token_share(p_payload jsonb, p_client_ip text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recent_count int;
  v_slug text;
begin
  if p_payload is null or pg_column_size(p_payload) > 20000 then
    raise exception 'payload_too_large' using errcode = '22001';
  end if;

  select count(*) into v_recent_count
  from public.tokencast_share_rate_limit
  where client_ip = p_client_ip
    and created_at > now() - interval '60 seconds';

  if v_recent_count >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.tokencast_share_rate_limit (client_ip) values (p_client_ip);

  v_slug := substr(md5(random()::text || clock_timestamp()::text), 1, 10);

  insert into public.token_shares (slug, payload) values (v_slug, p_payload);

  return v_slug;
end;
$$;

create or replace function public.get_token_share(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select payload from public.token_shares where slug = p_slug limit 1;
$$;

-- Anon may call these two functions and nothing else on these tables.
-- Tokencast has no auth — the `authenticated` role never applies, so grants
-- are scoped to `anon` only (no accidental inheritance if auth is added later).
revoke all on function public.create_token_share(jsonb, text) from public;
revoke all on function public.get_token_share(text) from public;
revoke execute on function public.create_token_share(jsonb, text) from authenticated;
revoke execute on function public.get_token_share(text) from authenticated;
grant execute on function public.create_token_share(jsonb, text) to anon;
grant execute on function public.get_token_share(text) to anon;
