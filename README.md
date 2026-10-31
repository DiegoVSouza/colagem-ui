# colagem-ui

Tokens and React components of the lab's design system, `DESIGN_SYSTEM_COLAGEM_URBANA_NOITE.md` (levels 0 and 1). Consumed by P06 and P07 as a pinned tarball.

## Use

```powershell
npm install file:vendor/colagem-ui-0.1.0.tgz
```

```tsx
import "colagem-ui/fonts.css";
import "colagem-ui/tokens.css";
import "colagem-ui/style.css";
import { Card, StatusSeal, Button } from "colagem-ui";
```

Theme is `data-theme="breu|papel"`, accent is `data-accent="rosa|laranja|azul"` (default red). Add `colagem-ui/plate-fonts.css` only if you use `Plate`. Consumers never write a color: use tokens.

## Develop

```powershell
npm ci
python scripts/check_fast.py     # lint, types, token contrast test, static rules, component tests
python scripts/check_full.py     # plus build, budget, Playwright + axe with contrast, npm pack
npm run gallery                  # see every component
```

`artifacts/package.json` records the tarball version, SHA-256 and commit. A consumer copies the tarball to its `vendor/` and writes the hash to its `docs/harness/sources.lock.json`.
