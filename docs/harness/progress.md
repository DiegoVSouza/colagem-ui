# Progress

- Kit initialization completed.
- 2026-10-31: intake and phase 001 SPEC/PLAN/VERIFY written.
- 2026-10-31 phase 001: tokens (contrast table machine-checked), 20 components, level 1 layers, gallery, real-browser axe with contrast in both themes, tarball. `check_full.py` exit 0. Four defects found and fixed, recorded in VERIFY.
- Next: P07 (F2) and P06 (F3) consume `artifacts/packages/colagem-ui-0.1.0.tgz`.

- 2026-10-31 0.1.1: headline max-width moved from the wrapper (16 px em) to the h1, found while adopting the package in P07.
- 2026-10-31 0.2.0: logo-size Plate, Panel, SelectField, small Button and clamped Card summary, added for the P06 console. `check_full.py` exit 0, 39 unit tests, 4.7 KB gzip.
- 2026-10-31 0.3.0: Headline focusOnMount. Exit 0, 40 tests.

- 2026-10-31 0.4.0: FlowDiagram, FlowList, flowToMermaid and the build-time layoutFlow (`colagem-ui/layout`, ELK). 55 tests, 8.1 KB gzip of 40 KB. Real Chrome found one defect, fixed: wrapped SVG labels lost their spaces and failed `label-content-name-mismatch`. `check_full.py` exit 0. Evidence: `artifacts/evidence/colagem-ui-040/check-full.txt`.
