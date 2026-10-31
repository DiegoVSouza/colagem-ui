// Enforces the library JavaScript budget from harness.yaml on dist/.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const limitKb = Number(/max_bundle_kb: (\d+)/.exec(readFileSync(join(root, "harness.yaml"), "utf8"))?.[1]);
if (!limitKb) {
  console.error("budget: saas.frontend_budget.max_bundle_kb is missing from harness.yaml");
  process.exit(1);
}
const dist = join(root, "dist");
const all = readdirSync(dist).filter((name) => name.endsWith(".js"));
// layout.js is the build-time entry. It is not part of any browser bundle and is the only file allowed to name elkjs.
const scripts = all.filter((name) => name !== "layout.js");
for (const name of scripts) {
  const text = readFileSync(join(dist, name), "utf8");
  if (["elkjs", "elk.bundled", "ElkNode", "new ELK"].some((word) => text.includes(word))) {
    console.error(`budget: ${name} contains elkjs; the layout engine must stay in layout.js (EPL-2.0 OR GPL-3.0, build time only)`);
    process.exit(1);
  }
}
if (scripts.length === 0) {
  console.error("budget: no JavaScript in dist; run npm run build first");
  process.exit(1);
}
const bytes = scripts.reduce((sum, name) => sum + gzipSync(readFileSync(join(dist, name))).length, 0);
const kb = bytes / 1024;
if (kb > limitKb) {
  console.error(`budget: ${kb.toFixed(1)} KB gzip exceeds ${limitKb} KB; remove code or split the library`);
  process.exit(1);
}
console.log(`budget: PASS (${kb.toFixed(1)} KB gzip of ${limitKb} KB)`);
