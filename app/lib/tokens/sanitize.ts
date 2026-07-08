import type { TokenModel } from "./model";

/**
 * Strips characters that have no legitimate place in a token name or CSS
 * value (angle brackets, quotes, backticks) so a name or value like
 * `<script>alert(1)</script>` can never survive into storage or any render
 * path — even though React's default JSX escaping already prevents it
 * executing on-page, this is defense in depth: the value should be inert
 * everywhere, including in the generated CSS/JS export strings a user might
 * copy elsewhere. Legitimate token names/CSS values never contain these
 * characters, so this is lossless for real input.
 */
export function sanitizeTokenText(value: string): string {
  return value.replace(/[<>"'`]/g, "").slice(0, 200);
}

export function sanitizeTokenModel(model: TokenModel): TokenModel {
  return {
    colors: model.colors.map((t) => ({
      name: sanitizeTokenText(t.name),
      value: sanitizeTokenText(t.value),
    })),
    spacing: model.spacing.map((t) => ({
      name: sanitizeTokenText(t.name),
      value: sanitizeTokenText(t.value),
    })),
    typography: model.typography.map((t) => ({
      name: sanitizeTokenText(t.name),
      fontFamily: t.fontFamily ? sanitizeTokenText(t.fontFamily) : t.fontFamily,
      fontSize: t.fontSize ? sanitizeTokenText(t.fontSize) : t.fontSize,
      fontWeight: typeof t.fontWeight === "string" ? sanitizeTokenText(t.fontWeight) : t.fontWeight,
      lineHeight: t.lineHeight ? sanitizeTokenText(t.lineHeight) : t.lineHeight,
    })),
    radius: model.radius.map((t) => ({
      name: sanitizeTokenText(t.name),
      value: sanitizeTokenText(t.value),
    })),
    shadow: model.shadow.map((t) => ({
      name: sanitizeTokenText(t.name),
      value: sanitizeTokenText(t.value),
    })),
  };
}
