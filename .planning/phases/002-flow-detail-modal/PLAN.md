# Plan 002

allowed_write_paths: `projects/p08/**`. forbidden: the kit, a colour literal, a consumer repository (P07 adopts the new tarball in its own phase).

1. Tests first (red): flow detail is a dialog in `document.body`, closes on Escape, button and veil, returns focus, is not inside `.flow`; `Modal` closes on a veil click.
2. `Modal` veil click; `FlowDiagram` renders the detail through `Modal` in a portal with a stable close handler.
3. Remove the now unused `.flow-detail` rules or keep only what the modal content needs.
4. `check_full`, version 0.4.5, pack the tarball, record SHA-256 and commit.

stop conditions: a failing existing test that can only pass by weakening it.
