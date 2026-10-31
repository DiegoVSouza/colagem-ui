import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

const css = readFileSync(join(process.cwd(), "src/tokens.css"), "utf8").replace(/\r\n/g, "\n");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const out: Record<string, string> = {};
  for (const m of css.slice(open + 1, close).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]!] = m[2]!;
  return out;
}

const breu = block(":root,\n[data-theme=\"breu\"]");
const papel = block("[data-theme=\"papel\"] {\n  --page");

// design system section 4.4: [foreground, background, documented ratio, small text allowed]
const table: [string, string, number, boolean][] = [
  ["paper", "ink", 17.48, true],
  ["paper", "card", 16.78, true],
  ["mut", "card", 11.88, true],
  ["ink", "paper", 17.48, true],
  ["paper-ink", "paper", 14.62, true],
  ["white", "ink", 20.38, true],
  ["white", "red", 4.73, true],
  ["ink", "red", 4.31, false],
  ["red", "ink", 4.31, false],
  ["red", "card", 4.13, false],
  ["red-text", "ink", 6.17, true],
  ["red-text", "card", 5.92, true],
  ["red", "paper", 4.06, false],
  ["dred", "ink", 1.65, false],
];

describe("tokens.css matches design system section 4.4 (DS-002)", () => {
  it.each(table)("%s on %s is %s", (fg, bg, expected, small) => {
    const ratio = contrastRatio(breu[fg]!, breu[bg]!);
    expect(Math.abs(ratio - expected), `${fg}/${bg} measured ${ratio.toFixed(2)}`).toBeLessThan(0.02);
    if (small) expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("papel accent text on paper is 5.08", () => {
    expect(contrastRatio(papel["red-text"]!, breu["paper"]!)).toBeCloseTo(5.08, 1);
  });

  it("ok / warn / err meet 4.5 on ink and card in breu, and on paper in papel", () => {
    for (const k of ["ok", "warn", "err"]) {
      expect(contrastRatio(breu[k]!, breu["ink"]!), k).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(breu[k]!, breu["card"]!), k).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(papel[k]!, breu["paper"]!), `papel ${k}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("ink is not pure black and fog equals ink", () => {
    expect(breu["ink"]).toBe("#050505");
    expect(css).toMatch(/--fog:\s*var\(--ink\)/);
  });

  it.each([
    ["rosa", "#e6008a", "#ff2fa3", "#050505"],
    ["laranja", "#ff7a1a", "#ff7a1a", "#050505"],
    ["azul", "#0057ff", "#5c8cff", "#ffffff"],
  ])("preset %s: on-red over red and red-text over ink pass 4.5", (_n, red, text, on) => {
    expect(contrastRatio(on, red)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(text, breu["ink"]!)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(text, breu["card"]!)).toBeGreaterThanOrEqual(4.5);
  });
});
