import { TokenParseError } from "./errors";
import { emptyTokenModel, type TokenModel } from "./model";

const CATEGORY_PREFIXES: Array<{ prefix: string; category: keyof TokenModel }> = [
  { prefix: "color-", category: "colors" },
  { prefix: "spacing-", category: "spacing" },
  { prefix: "radius-", category: "radius" },
  { prefix: "shadow-", category: "shadow" },
  { prefix: "font-size-", category: "typography" },
];

/**
 * Parses raw CSS custom properties declared in a `:root { ... }` block, using
 * a `--<category>-<name>: <value>;` naming convention.
 */
export function parseCssVars(raw: string): TokenModel {
  if (raw.trim() === "") {
    throw new TokenParseError("empty-input", "No CSS provided.");
  }

  const rootMatch = raw.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) {
    throw new TokenParseError(
      "invalid-json",
      "No `:root { ... }` block found — expected CSS custom properties.",
    );
  }

  const declarations = rootMatch[1]
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean);

  if (declarations.length === 0) {
    throw new TokenParseError("empty-input", "The `:root` block has no declarations.");
  }

  const model = emptyTokenModel();

  for (const decl of declarations) {
    const match = decl.match(/^--([a-zA-Z0-9-]+)\s*:\s*(.+)$/);
    if (!match) {
      throw new TokenParseError("invalid-json", `Couldn't parse declaration: "${decl}"`);
    }
    const [, rawName, value] = match;

    const matchedPrefix = CATEGORY_PREFIXES.find(({ prefix }) => rawName.startsWith(prefix));
    if (!matchedPrefix) {
      throw new TokenParseError(
        "unsupported-token-type",
        `Unrecognized custom property "--${rawName}" — expected one of: ${CATEGORY_PREFIXES.map((c) => `--${c.prefix}*`).join(", ")}.`,
      );
    }

    const name = rawName.slice(matchedPrefix.prefix.length);

    if (matchedPrefix.category === "typography") {
      model.typography.push({ name, fontSize: value });
    } else {
      (model[matchedPrefix.category] as Array<{ name: string; value: string }>).push({
        name,
        value,
      });
    }
  }

  return model;
}
