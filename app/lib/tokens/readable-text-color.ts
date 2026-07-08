/**
 * Picks black or white text for a given background color so preview elements
 * stay legible no matter what color a user's tokens happen to contain — a
 * pasted brand color close to white shouldn't render white-on-white text.
 * Falls back to white if the color can't be parsed (e.g. a CSS variable
 * reference or named color this simple parser doesn't handle).
 *
 * Uses the real WCAG relative-luminance + contrast-ratio formula rather than
 * a naive luminance threshold — a naive threshold picks white for mid-tone
 * saturated colors (e.g. #3b82f6, #f43f5e) whose actual contrast ratio
 * against white falls below the 4.5:1 AA minimum for normal text.
 */
export function readableTextColor(backgroundColor: string): "#000000" | "#ffffff" {
  const rgb = parseHex(backgroundColor);
  if (!rgb) return "#ffffff";

  const bgLuminance = relativeLuminance(rgb);
  const contrastWithWhite = contrastRatio(bgLuminance, 1);
  const contrastWithBlack = contrastRatio(bgLuminance, 0);

  return contrastWithWhite >= contrastWithBlack ? "#ffffff" : "#000000";
}

function parseHex(color: string): [number, number, number] | null {
  const hex = color.trim().replace("#", "");
  const isShort = hex.length === 3;
  const isFull = hex.length === 6;
  if (!isShort && !isFull) return null;

  const expand = (c: string) => (isShort ? c + c : c);
  const r = parseInt(expand(hex.slice(0, isShort ? 1 : 2)), 16);
  const g = parseInt(expand(hex.slice(isShort ? 1 : 2, isShort ? 2 : 4)), 16);
  const b = parseInt(expand(hex.slice(isShort ? 2 : 4, isShort ? 3 : 6)), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const linearize = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [linearize(r), linearize(g), linearize(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
