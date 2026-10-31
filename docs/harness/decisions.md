# Intake decisions — P08 colagem-ui

- Product: React component library and CSS tokens implementing `DESIGN_SYSTEM_COLAGEM_URBANA_NOITE.md` (level 0 core and level 1 2D layers), consumed by P06 and P07 as a pinned tarball. Lab overview: `docs/harness/frontend-platform/` and `docs/decisions/ADR-001-frontend-on-cloudflare-pages.md`.
- Success criterion: the token values pass the design system's own contrast table, every component passes axe (jsdom and real Chrome with contrast), reduced-motion stops ambient animation, no color exists outside `tokens.css`, `npm pack` produces a tarball with a recorded SHA-256.
- Pattern: no model, no agent, no network. `workflow-automation` with `has_agent: false` is the closest kit profile; `stack.frontend: react-ts`, `backend: none`. No trifecta.
- Source of truth for the design: the design system document in the lab root. Items marked **[proposta]** in it are implemented as written but recorded as `untested in the original`; this library's tests are their first test.
- Fonts: Anton and Courier Prime via Fontsource (self-hosted). Playfair Display and Special Elite are only for the cut-out-letter plate and are included as optional CSS (`colagem-ui/plate-fonts.css`) so consumers that skip the plate pay nothing.
- Cut-out letters are deterministic (seeded by the text) so tests and screenshots are stable. Visual copy is `aria-hidden`, real text in `.sr`.
- Peer dependencies: `react` and `react-dom` 19. No other runtime dependency.
- Budget: ≤ 40 KB gzip of library JS.
- No 3D here. Level 2 is a later P07 phase and will live in P07, not in this package, so the library stays small.
- Versioning: semver; any token rename is a major. A consumer upgrades by replacing the tarball and the lock entry.
- Publishing to npm or any registry is not done (lab rule 9); distribution is the tarball in each consumer's `vendor/`.
