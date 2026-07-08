import type { TokenModel } from "./model";

/**
 * Generates a plain CSS custom-properties block in shadcn/ui's `:root` style.
 * This is a direct token→CSS-variable bridge, not a semantic remap (background/
 * primary/etc.) — that mapping is a deliberate design decision, not this tool's
 * job, since it requires knowing which raw token means what semantically.
 */
export function generateShadcnVars(model: TokenModel): string {
  const lines: string[] = [":root {"];

  for (const c of model.colors) lines.push(`  --${c.name}: ${c.value};`);
  for (const s of model.spacing) lines.push(`  --spacing-${s.name}: ${s.value};`);
  for (const r of model.radius) lines.push(`  --radius-${r.name}: ${r.value};`);
  for (const sh of model.shadow) lines.push(`  --shadow-${sh.name}: ${sh.value};`);

  lines.push("}");
  return lines.join("\n");
}
