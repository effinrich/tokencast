import type { TokenModel } from "./model";

function nest(entries: Array<{ name: string; value: string }>): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const { name, value } of entries) {
    const parts = name.split("-");
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (typeof cursor[key] !== "object" || cursor[key] === null) cursor[key] = {};
      cursor = cursor[key] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return root;
}

/** Generates a Chakra UI theme object (colors/space/radii/shadows). */
export function generateChakraTheme(model: TokenModel): string {
  const theme = {
    colors: nest(model.colors),
    space: nest(model.spacing),
    radii: nest(model.radius),
    shadows: nest(model.shadow),
  };

  return `export const theme = ${JSON.stringify(theme, null, 2)};\n`;
}
