/** Label wrapping and node sizing. Browser-safe; the build-time layout and the component must agree. */

export const CHAR_W = 11; // Anton at 22px, uppercase. Conservative: the label wraps, never overflows.
export const LINE_H = 26;
export const PAD_X = 18;
export const PAD_Y = 14;
export const MAX_CHARS = 16;

/** Wrap a label into lines of at most MAX_CHARS characters, breaking at spaces. Shared with the component. */
export function wrapLabel(label: string, max = MAX_CHARS): string[] {
  const words = label.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export function nodeSize(label: string): { w: number; h: number } {
  const lines = wrapLabel(label);
  const longest = Math.max(...lines.map((l) => l.length));
  return { w: Math.max(120, longest * CHAR_W + PAD_X * 2), h: lines.length * LINE_H + PAD_Y * 2 };
}

