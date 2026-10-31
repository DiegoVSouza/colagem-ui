# colagem-ui

<!-- case:start -->
## The case

- **Problem.** A portfolio and a console need one look, and a contrast claim is worth nothing if only a unit test made it.
- **Decision.** Tokens are the only place a color may appear, components read tokens, and contrast is checked by axe in real Chrome in both themes at a wide and a narrow viewport. Diagrams are drawn in SVG from a layout computed at build time; the layout engine (`elkjs`, EPL-2.0 OR GPL-3.0) is a separate entry that never reaches `index.js`.
- **Measured.** 62 unit tests, 9.5 KB gzip against a 40 KB budget (`npm run budget`), and `check_full.py` exit 0 including axe with contrast in both themes. Real Chrome found five defects in 0.4.0 that jsdom could not see; they are listed in `docs/harness/progress.md`. Source: `artifacts/evidence/colagem-ui-040/check-full.txt`.
- **Run it.** `npm ci && python scripts/check_fast.py`, then `npm run gallery`.
- **Limits.** Level 2 (Three.js) lives in the portfolio, not here. Not published to npm; consumers pin a tarball by SHA-256.
- **Docs.** [Architecture](docs/architecture.md), [license notes](docs/harness/license-notes.md).
<!-- case:end -->

Tokens and React components of the lab's design system, `DESIGN_SYSTEM_COLAGEM_URBANA_NOITE.md` (levels 0 and 1), plus `FlowDiagram` and a set of content blocks. Consumed by P06 and P07 as a pinned tarball.

## Use

```powershell
npm install file:vendor/colagem-ui-0.4.0.tgz
```

```tsx
import "colagem-ui/fonts.css";
import "colagem-ui/tokens.css";
import "colagem-ui/style.css";
import { Card, StatusSeal, Button, FlowDiagram } from "colagem-ui";
```

Theme is `data-theme="breu|papel"`, accent is `data-accent="rosa|laranja|azul"` (default red). Add `colagem-ui/plate-fonts.css` only if you use `Plate`. Consumers never write a color: use tokens.

A flow is plain data (`Flow` in `src/flow-types.ts`). In a build script, `layoutFlow` from `colagem-ui/layout` computes two layouts (wide and narrow) with ELK, and `flowToMermaid` writes the same flow for a README. The browser only draws the result.

## Develop

```powershell
npm ci
python scripts/check_fast.py     # lint, types, token contrast test, static rules, component tests
python scripts/check_full.py     # plus build, budget, Playwright + axe with contrast, npm pack
npm run gallery                  # see every component
```

`artifacts/package.json` records the tarball version, SHA-256 and commit. A consumer copies the tarball to its `vendor/` and writes the hash to its `docs/harness/sources.lock.json`.
