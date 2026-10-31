# Specification

`colagem-ui`: tokens and React components of the Colagem Urbana Noite design system, levels 0 and 1.

## Surface

- `tokens.css`: all tokens of design system section 4 (color, accent preset, theme `breu` and `papel`, fonts, cut, hit, focus, spacing, z-index, motion). Accent presets switch with `data-accent="vermelho|rosa|laranja|azul"`, theme with `data-theme`.
- `style.css`: component styles that use only `var(--*)`.
- Components: `AppHeader`, `AppFooter`, `Card` (rest / focus, tape, dots, numeral), `StatusSeal`, `Button` (primary, secondary, danger), `Toggle`, `Field`, `DataTable`, `Toast`, `Modal`, `Progress`, `EmptyState`, `WakeNotice`, `Plate`, `Headline`, `Lead`, `Band`, `Command`, `GhostNumber`, `Layers` (level 1 2D background with parallax and `data-bg`).
- Helpers: `contrastRatio`, `pickBackground` (`3d | 3d-static | 2d` selector, section 10).

## Engineering contract

| Requirement | Rule |
| --- | --- |
| DS-001 | No hex color outside `tokens.css` in any shipped CSS or TSX. A test scans the sources. |
| DS-002 | A test parses `tokens.css` and checks every pair of section 4.4: the listed ratio within 0.02, small-text pairs ≥ 4.5, and `--red` / `--dred` never used for small text in `style.css`. |
| DS-003 | `StatusSeal` renders glyph plus word; the active item adds `▶`. Never color only. |
| DS-004 | Under `prefers-reduced-motion: reduce` no ambient animation runs (CSS check) and `pickBackground` returns `3d-static` or `2d`. Only `transform` and `opacity` animate, except `wig`, finite, 2 iterations. |
| DS-005 | Cards, shadows and buttons have no `border-radius` and no blur shadow. A test scans `style.css`. |
| A11Y-001 | axe has zero violations for every component, in jsdom and in real Chrome with contrast on the gallery, in `breu` and `papel`, at 360 px and 1000 px. |
| PERF-001 | Library JS ≤ 40 KB gzip. |
| PKG-001 | `npm pack` output is installable by a clean consumer; version, SHA-256 and commit are written to `artifacts/package.json`. |

## Out of scope

Three.js, sound, charts, publishing to a registry, any network call.
