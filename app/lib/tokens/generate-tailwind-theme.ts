import type { TokenModel } from "./model";

/** Generates a Tailwind CSS v4 `@theme` block (the current CSS-native config format). */
export function generateTailwindTheme(model: TokenModel): string {
  const lines: string[] = ["@theme {"];

  for (const c of model.colors) lines.push(`  --color-${c.name}: ${c.value};`);
  for (const s of model.spacing) lines.push(`  --spacing-${s.name}: ${s.value};`);
  for (const r of model.radius) lines.push(`  --radius-${r.name}: ${r.value};`);
  for (const sh of model.shadow) lines.push(`  --shadow-${sh.name}: ${sh.value};`);
  for (const t of model.typography) {
    if (t.fontSize) lines.push(`  --font-size-${t.name}: ${t.fontSize};`);
  }

  lines.push("}");
  return lines.join("\n");
}
