import { TokenParseError } from "./errors";
import { emptyTokenModel, type TokenModel } from "./model";

interface TailwindExtendShape {
  colors?: Record<string, string | Record<string, string>>;
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  boxShadow?: Record<string, string>;
}

function flattenColors(colors: Record<string, string | Record<string, string>>) {
  const out: Array<{ name: string; value: string }> = [];
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      out.push({ name: key, value });
    } else {
      for (const [shade, hex] of Object.entries(value)) {
        out.push({ name: `${key}-${shade}`, value: hex });
      }
    }
  }
  return out;
}

/**
 * Parses a Tailwind config's `theme.extend` block. Accepts a JSON-serializable
 * object (not an arbitrary JS module with functions/imports) — a deliberate v1
 * scope limit, not an oversight.
 */
export function parseTailwindConfig(raw: string): TokenModel {
  if (raw.trim() === "") {
    throw new TokenParseError("empty-input", "No config provided.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new TokenParseError(
      "invalid-json",
      "Expected a JSON object for `theme.extend` (JS config files with functions aren't supported yet — paste the extend object as JSON).",
    );
  }

  const extend = (parsed as { theme?: { extend?: TailwindExtendShape } })?.theme?.extend;
  if (!extend || typeof extend !== "object") {
    throw new TokenParseError(
      "invalid-json",
      "Expected a `{ theme: { extend: { ... } } }` shape.",
    );
  }

  const knownKeys = new Set(["colors", "spacing", "borderRadius", "boxShadow"]);
  for (const key of Object.keys(extend)) {
    if (!knownKeys.has(key)) {
      throw new TokenParseError(
        "unsupported-token-type",
        `Unsupported theme.extend key "${key}". Supported: ${[...knownKeys].join(", ")}.`,
      );
    }
  }

  const model: TokenModel = emptyTokenModel();

  if (extend.colors) model.colors.push(...flattenColors(extend.colors));
  if (extend.spacing) {
    model.spacing.push(...Object.entries(extend.spacing).map(([name, value]) => ({ name, value })));
  }
  if (extend.borderRadius) {
    model.radius.push(...Object.entries(extend.borderRadius).map(([name, value]) => ({ name, value })));
  }
  if (extend.boxShadow) {
    model.shadow.push(...Object.entries(extend.boxShadow).map(([name, value]) => ({ name, value })));
  }

  return model;
}
