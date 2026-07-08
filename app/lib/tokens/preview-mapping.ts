import type { TokenModel } from "./model";

export interface PreviewTheme {
  primary: string | null;
  accent: string | null;
  spacing: string | null;
  radius: string | null;
  usedTokens: string[];
}

/**
 * Best-effort mapping from an arbitrary parsed token set to a small preview
 * theme. This is a simple heuristic (first color = primary, second = accent,
 * first spacing/radius) — not "smart" semantic detection. The UI says so
 * explicitly rather than pretending it understood intent it didn't.
 */
export function mapToPreviewTheme(model: TokenModel): PreviewTheme {
  const usedTokens: string[] = [];

  const primary = model.colors[0] ?? null;
  const accent = model.colors[1] ?? null;
  const spacing = model.spacing[0] ?? null;
  const radius = model.radius[0] ?? null;

  if (primary) usedTokens.push(primary.name);
  if (accent) usedTokens.push(accent.name);
  if (spacing) usedTokens.push(spacing.name);
  if (radius) usedTokens.push(radius.name);

  return {
    primary: primary?.value ?? null,
    accent: accent?.value ?? null,
    spacing: spacing?.value ?? null,
    radius: radius?.value ?? null,
    usedTokens,
  };
}
