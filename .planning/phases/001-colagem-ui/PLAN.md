# Plan

1. Tooling: package with `exports`, TypeScript, ESLint, Vitest, Vite library build, budget, real `check_fast.py` and `check_full.py`.
2. Tokens first: `tokens.css` from section 4, with the contrast test written before any component (red first).
3. Components with tests, one by one in the order of design system section 14: shell (header, footer, plate, headline, lead, band), cards and seals, controls and forms, feedback (toast, modal, progress, empty, wake), level 1 layers.
4. Gallery page (`gallery/`) rendering every component in both themes; Playwright + axe with contrast at 360 and 1000 px, plus the squint screenshot saved as evidence.
5. Pack: `npm pack`, SHA-256 into `artifacts/package.json`.

allowed_write_paths: `projects/p08/**`.

forbidden_changes: `harness-kit/`, other projects, a hex outside `tokens.css`, `border-radius`, blurred shadows, a runtime network call, removing or weakening a test.

llm_mode: fake (none used). budget: USD 0. validation: `python scripts/check_full.py` and the evidence under `artifacts/evidence/colagem-ui-001/`.

stop conditions: three failed attempts on one failure; any publish.
