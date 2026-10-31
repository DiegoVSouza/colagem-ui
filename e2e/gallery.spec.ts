import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const evidence = "artifacts/evidence/colagem-ui-001";
const sizes = [{ width: 1000, height: 800 }, { width: 360, height: 740 }];

for (const theme of ["breu", "papel"]) {
  for (const size of sizes) {
    test(`gallery ${theme} ${size.width}px: axe with contrast, no overflow, no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      await page.setViewportSize(size);
      await page.goto(`/?theme=${theme}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page }).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
      const wide = await page.evaluate(() => {
        if (document.documentElement.scrollWidth <= window.innerWidth) return [];
        return [...document.querySelectorAll("body *:not(svg *)")]
          .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 0.5)
          .map((e) => `${e.tagName.toLowerCase()}.${String(e.className)} right=${Math.round(e.getBoundingClientRect().right)}`)
          .slice(0, 6);
      });
      expect(wide, "elements wider than the viewport").toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test("reduced motion stops the band and the focus-card shake", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const names = await page.evaluate(() => [...document.querySelectorAll(".band-track, .cw.focus")].map((e) => getComputedStyle(e).animationName));
  expect(names).toEqual(["none", "none"]);
  expect(await page.evaluate(() => document.documentElement.dataset.bg)).toMatch(/^(2d|3d-static)$/);
});

test("background mode 2d is chosen without WebGL2, and the page still renders", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      return type === "webgl2" ? null : (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof original;
  });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.dataset.bg)).toBe("2d");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("squint screenshot (DS-006 evidence, judged by the owner)", async ({ page }) => {
  mkdirSync(evidence, { recursive: true });
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/");
  await page.screenshot({ path: `${evidence}/gallery-1000.png` });
  await page.addStyleTag({ content: "html{filter: blur(10px)}" });
  await page.screenshot({ path: `${evidence}/gallery-1000-squint.png` });
});
