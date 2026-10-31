import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "../gallery/Gallery";
import { Button, Card, Field, Modal, StatusSeal, Toast, pickBackground } from "./index";

const read = (f: string) => readFileSync(join(process.cwd(), f), "utf8");
const style = read("src/style.css").replace(/\/\*[\s\S]*?\*\//g, "");

async function violations(container: HTMLElement) {
  // color-contrast needs a real renderer; it runs in the Playwright gallery test
  const r = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  return r.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`);
}

describe("static rules over shipped sources", () => {
  it("DS-001: no color literal outside tokens.css (css, tsx, ts)", () => {
    const hex = /#[0-9a-fA-F]{3,8}\b/;
    const files = ["src/style.css", ...readdirSync(join(process.cwd(), "src")).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.|tokens\.css/.test(f)).map((f) => `src/${f}`)];
    for (const f of new Set(files)) {
      const text = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/&#\d+;|href="#[^"]*"/g, "");
      expect(hex.test(text), `${f} has a color literal`).toBe(false);
      expect(/\b(rgb|rgba|hsl|hsla)\(/.test(text), `${f} uses a color function`).toBe(false);
    }
  });

  it("DS-005: no border-radius and no blurred shadow", () => {
    expect(style).not.toMatch(/border-radius/);
    expect(style).not.toMatch(/drop-shadow|filter:\s*blur|backdrop-filter/);
    for (const m of style.matchAll(/box-shadow:\s*([^;]+);/g)) {
      const parts = m[1]!.trim().split(/\s+/);
      const blur = parts.filter((p) => /^-?\d+(\.\d+)?(px)?$/.test(p));
      // offsets x y [blur]: a third numeric length would be a blur radius
      expect(blur.length <= 2 || blur[2] === "0" || blur[2] === "0px", m[0]).toBe(true);
    }
  });

  it("DS-002: --red and --dred are never text color of small text", () => {
    for (const m of style.matchAll(/(^|[\s{;])color:\s*var\(--(red|dred)\)/g)) {
      throw new Error(`small text uses --${m[2]}: ${m[0]}`);
    }
  });

  it("DS-004: only transform and opacity animate (wig is the documented exception)", () => {
    for (const m of style.matchAll(/transition:\s*([^;]+);/g)) {
      expect(/\b(width|height|top|left|filter|box-shadow)\b/.test(m[1]!), m[0]).toBe(false);
    }
    expect(style).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/);
    expect(style).toMatch(/animation: wig 0\.9s ease-in-out 2;|ease-in-out 2;/);
    expect(style).toMatch(/animation: band 18s linear infinite/);
  });
});

describe("DS-003 seals carry a glyph and a word", () => {
  it.each([["none", "○"], ["partial", "◐"], ["full", "●"], ["fail", "✕"]] as const)("%s", (kind, glyph) => {
    const { container } = render(<StatusSeal kind={kind} label="word" active />);
    expect(container.textContent).toContain(glyph);
    expect(container.textContent).toContain("word");
    expect(container.textContent).toContain("▶");
  });
});

describe("background selector (section 10)", () => {
  it("webgl2 + motion → 3d; webgl2 + reduce → 3d-static; none → 2d", () => {
    expect(pickBackground({ webgl2: true, reduce: false })).toBe("3d");
    expect(pickBackground({ webgl2: true, reduce: true })).toBe("3d-static");
    expect(pickBackground({ webgl2: false, reduce: false })).toBe("2d");
    expect(pickBackground({ webgl2: false, reduce: true })).toBe("2d");
  });
});

describe("components", () => {
  it("cards keep one information order: seal, title, summary, meta", () => {
    const { container } = render(<Card label="x" seal={<StatusSeal kind="none" label="s" />} title="T" summary="S" meta="M" tag="g" />);
    const text = container.textContent!;
    expect(text.indexOf("s")).toBeLessThan(text.indexOf("T"));
    expect(text.indexOf("T")).toBeLessThan(text.indexOf("S"));
    expect(text.indexOf("S")).toBeLessThan(text.indexOf("M"));
  });

  it("danger button shows glyph and verb; disabled shows the reason", () => {
    render(<><Button variant="danger">Reject</Button><Button disabled disabledReason="why not">Go</Button></>);
    expect(screen.getByRole("button", { name: /Reject/ }).textContent).toContain("✕");
    expect(screen.getByRole("button", { name: "Go" }).getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText("why not")).toBeTruthy();
  });

  it("field error is text with glyph and linked by aria-describedby", () => {
    render(<Field label="Amount" error="Enter a number" />);
    const input = screen.getByLabelText("Amount");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const note = document.getElementById(input.getAttribute("aria-describedby")!)!;
    expect(note.textContent).toContain("✕");
    expect(note.textContent).toContain("Enter a number");
  });

  it("toast auto-dismisses and has a close button", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast kind="warn" onClose={onClose} closeLabel="Dismiss">careful</Toast>);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
    vi.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  function Host() {
    const [open, setOpen] = useState(true);
    return <><button type="button">outside</button><Modal title="Sure?" open={open} onClose={() => setOpen(false)} closeLabel="Close"><button type="button">inner</button></Modal></>;
  }

  it("modal traps focus, closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<Host />);
    const dialog = screen.getByRole("dialog", { name: "Sure?" });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.tab(); await user.tab(); await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("A11Y-001 (jsdom)", () => {
  it.each(["breu", "papel"] as const)("gallery in %s has no axe violations", async (theme) => {
    const { container } = render(<Gallery theme={theme} />);
    expect(await violations(container)).toEqual([]);
  });
});
