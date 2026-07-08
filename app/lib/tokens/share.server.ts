import { getSupabaseClient } from "../supabase.server";
import { sanitizeTokenModel } from "./sanitize";
import type { TokenModel } from "./model";

export class ShareRateLimitError extends Error {
  constructor() {
    super("Too many saves from this connection — try again in a minute.");
    this.name = "ShareRateLimitError";
  }
}

export class SharePersistError extends Error {
  constructor(cause: string) {
    super(`Couldn't save that share: ${cause}`);
    this.name = "SharePersistError";
  }
}

export async function createShare(model: TokenModel, clientIp: string): Promise<string> {
  const sanitized = sanitizeTokenModel(model);
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("create_token_share", {
    p_payload: sanitized,
    p_client_ip: clientIp,
  });

  if (error) {
    if (error.message.includes("rate_limited")) throw new ShareRateLimitError();
    throw new SharePersistError(error.message);
  }

  return data as string;
}

export async function loadShare(slug: string): Promise<TokenModel | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_token_share", { p_slug: slug });

  if (error) throw new SharePersistError(error.message);
  return (data as TokenModel | null) ?? null;
}
