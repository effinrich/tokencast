import type { TokenModel } from "./model";

const MAX_PAYLOAD_BYTES = 20_000;

export class ShareValidationError extends Error {
  readonly code: "payload_too_large" | "invalid_json" | "invalid_shape";

  constructor(code: ShareValidationError["code"], message: string) {
    super(message);
    this.name = "ShareValidationError";
    this.code = code;
  }
}

function isStringPair(value: unknown): value is { name: string; value: string } {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).name === "string" &&
    typeof (value as Record<string, unknown>).value === "string"
  );
}

function isTypographyEntry(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.name !== "string") return false;
  for (const key of ["fontFamily", "fontSize", "lineHeight"]) {
    if (key in v && v[key] !== undefined && typeof v[key] !== "string") return false;
  }
  if ("fontWeight" in v && v.fontWeight !== undefined) {
    if (typeof v.fontWeight !== "string" && typeof v.fontWeight !== "number") return false;
  }
  return true;
}

/**
 * Validates that raw, untrusted JSON text is both parseable and shaped
 * exactly like a TokenModel before it's ever passed to the Supabase RPC.
 * The client already parsed and rendered this data — this is a second,
 * independent check server-side, since a request to this action doesn't
 * have to come from the actual UI.
 */
export function parseAndValidateShareRequest(raw: string): TokenModel {
  if (new TextEncoder().encode(raw).length > MAX_PAYLOAD_BYTES) {
    throw new ShareValidationError(
      "payload_too_large",
      `Payload exceeds the ${MAX_PAYLOAD_BYTES}-byte limit.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ShareValidationError("invalid_json", "Share payload was not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new ShareValidationError("invalid_shape", "Expected a token model object.");
  }

  const model = parsed as Record<string, unknown>;
  const arrayFields: Array<keyof TokenModel> = ["colors", "spacing", "radius", "shadow"];

  for (const field of arrayFields) {
    if (!Array.isArray(model[field]) || !(model[field] as unknown[]).every(isStringPair)) {
      throw new ShareValidationError("invalid_shape", `Field "${field}" is missing or malformed.`);
    }
  }

  if (!Array.isArray(model.typography) || !model.typography.every(isTypographyEntry)) {
    throw new ShareValidationError("invalid_shape", `Field "typography" is missing or malformed.`);
  }

  return model as unknown as TokenModel;
}
