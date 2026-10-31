// Packs the library and records version, SHA-256 and commit in artifacts/package.json.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const out = join(root, "artifacts/packages");
mkdirSync(out, { recursive: true });
const win = process.platform === "win32";
const raw = execFileSync(win ? "npm.cmd" : "npm", ["pack", "--json", "--pack-destination", out], { cwd: root, shell: win, encoding: "utf8" });
const file = JSON.parse(raw.slice(raw.indexOf("[")))[0].filename;
const sha256 = createHash("sha256").update(readFileSync(join(out, file))).digest("hex");
const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() !== "";
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
writeFileSync(join(root, "artifacts/package.json"), JSON.stringify({ name: "colagem-ui", version, file: `artifacts/packages/${file}`, sha256, commit, dirty }, null, 2) + "\n");
console.log(`pack: ${file} sha256=${sha256} commit=${commit}${dirty ? " (dirty tree)" : ""}`);
