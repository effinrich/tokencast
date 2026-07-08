import { createClient } from "@supabase/supabase-js";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

/**
 * Server-only Supabase client. Uses the anon/publishable key deliberately —
 * every table has RLS enabled with zero direct-access policies; the only way
 * this client can read or write is through the two SECURITY DEFINER RPCs
 * (`create_token_share`, `get_token_share`), so the anon key here carries no
 * more privilege than the RPCs explicitly grant it.
 */
export function getSupabaseClient() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"));
}
