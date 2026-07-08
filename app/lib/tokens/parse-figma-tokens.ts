import { TokenParseError } from "./errors";
import { emptyTokenModel, type TokenModel } from "./model";

const SUPPORTED_TYPES = new Set(["color", "spacing", "typography", "borderRadius", "boxShadow"]);

function flatten(obj: Record<string, unknown>, prefix: string[] = []): Array<{ path: string[]; entry: unknown }> {
  const out: Array<{ path: string[]; entry: unknown }> = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && "value" in value && "type" in value) {
      out.push({ path: [...prefix, key], entry: value });
    } else if (value && typeof value === "object") {
      out.push(...flatten(value as Record<string, unknown>, [...prefix, key]));
    }
  }
  return out;
}

/**
 * Parses a Figma Tokens / Tokens-Studio-style export — the de facto real-world
 * shape for "Figma variables as JSON" (nested groups of {value, type} leaves).
 */
export function parseFigmaTokens(raw: string): TokenModel {
  if (raw.trim() === "") {
    throw new TokenParseError("empty-input", "No token data provided.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new TokenParseError("invalid-json", "That doesn't look like valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new TokenParseError("invalid-json", "Expected a JSON object at the top level.");
  }

  const model = emptyTokenModel();
  const entries = flatten(parsed as Record<string, unknown>);

  for (const { path, entry } of entries) {
    const { value, type } = entry as { value: unknown; type: string };
    const name = path.join("-");

    if (!SUPPORTED_TYPES.has(type)) {
      throw new TokenParseError(
        "unsupported-token-type",
        `Unsupported token type "${type}" on "${name}". Supported: ${[...SUPPORTED_TYPES].join(", ")}.`,
      );
    }

    switch (type) {
      case "color":
        model.colors.push({ name, value: String(value) });
        break;
      case "spacing":
        model.spacing.push({ name, value: String(value) });
        break;
      case "borderRadius":
        model.radius.push({ name, value: String(value) });
        break;
      case "boxShadow":
        model.shadow.push({ name, value: String(value) });
        break;
      case "typography": {
        const t = value as Record<string, unknown>;
        model.typography.push({
          name,
          fontFamily: t.fontFamily as string | undefined,
          fontSize: t.fontSize as string | undefined,
          fontWeight: t.fontWeight as string | number | undefined,
          lineHeight: t.lineHeight as string | undefined,
        });
        break;
      }
    }
  }

  return model;
}
