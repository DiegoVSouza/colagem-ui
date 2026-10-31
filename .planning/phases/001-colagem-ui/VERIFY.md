# Verification

PASS (local) — 2026-10-31. Not published anywhere; distribution is the tarball.

| Command (cwd: projects/p08) | Exit | Evidence (`artifacts/evidence/colagem-ui-001/`) |
| --- | --- | --- |
| `python scripts/check_full.py`, final | 0: 36 unit tests, lint, types, build, budget 4.5 KB gzip of 40 KB, 7 Playwright tests (axe with contrast in `breu` and `papel`, 1000 px and 360 px; reduced motion; forced 2d; squint screenshot), `npm pack` | `check-full.txt`, `gallery-1000.png`, `gallery-1000-squint.png` |

What the tests establish:

- `src/tokens.test.ts` recomputes every ratio of design system section 4.4 from `tokens.css`, plus the three accent presets and the `papel` theme. All 20 match the document (tolerance 0.02), so the document's table is now machine-checked.
- `src/system.test.tsx` scans shipped sources: no color literal outside `tokens.css`, no `border-radius`, no blurred shadow, no `--red`/`--dred` as small-text color, animation limited to the documented set, reduced-motion block present. It also checks glyph + word seals, card information order, button reasons, field errors, toast, modal focus trap, and the background selector.

Defects found by the gates and fixed (kept for the record):

1. Decorative ghost numeral failed real-browser contrast. Fixed by rendering it as generated content from `data-n`, since it is `aria-hidden` and decorative.
2. In the `papel` theme, secondary text (`--mut`) and dark surfaces inherited the page color and became unreadable. Fixed with a `--page-mut` token and explicit text color on dark surfaces. jsdom axe cannot see this; only the real-browser run did.
3. Horizontal overflow from the rotated band, the plate at 360 px and the even-card offset. Fixed with a clip wrapper, a wrapping plate on narrow screens (deviation from the document's `nowrap`, recorded in the stylesheet) and no even offset under 760 px.
4. The e2e reused a stale preview server and tested an old build. `reuseExistingServer` is now `false`.

Not covered: Level 2 (3D), real-device performance, screen reader run by a person, Firefox and Safari, and the owner's judgement of the squint screenshots (`review_mode=human_pending`).

Package: see `artifacts/package.json` (version, SHA-256, commit). Consumers pin that hash in their `docs/harness/sources.lock.json`.

## 0.2.0 (2026-10-31)

Added `Plate size="logo"`, `Panel`, `SelectField`, `Button size="sm"` and `Card clamp` for the P06 console. `python scripts/check_full.py` exit 0: 39 unit tests, budget 4.7 KB gzip of 40 KB, 7 Playwright tests with axe contrast in both themes (gallery now includes the new components). Evidence: `artifacts/evidence/colagem-ui-001/check-full.txt`.

## 0.3.0 (2026-10-31)

`Headline focusOnMount` (focus moves to the h1 on navigation without making it a tab stop). `check_full.py` exit 0: 40 unit tests, 4.7 KB gzip, 7 Playwright tests.
