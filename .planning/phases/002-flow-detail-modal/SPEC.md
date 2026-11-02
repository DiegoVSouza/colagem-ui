# Phase 002: flow detail as a modal

Status: done (0.4.5).

Owner report (2026-11-02): in the "How it works" diagram, the explanation card that opens when a node is clicked appears below the diagram, where a visitor on a long page does not see it. It must open as a modal the visitor can see.

## Requirements

- FLOW-MODAL-001: choosing a node opens its detail in a modal dialog (`role="dialog"`, `aria-modal`, named by the node label), centred in the viewport over a dimmed veil.
- FLOW-MODAL-002: the modal is rendered in `document.body`, not inside the diagram, so no ancestor transform, overflow or stacking context can clip or misplace it.
- FLOW-MODAL-003: it closes with the Close button, with Escape and with a click on the veil; focus returns to the node that opened it; focus stays inside while it is open.
- FLOW-MODAL-004: the detail never renders below the diagram any more (no `aside.flow-detail` in the flow).
- FLOW-MODAL-005: nothing renders on the server (the detail only exists after a choice), so prerendering is unchanged.
- FLOW-MODAL-006: `Modal` itself also closes on a click on its veil, for every consumer.
- Tokens only; no colour literal.

## Out of scope

A new component. The existing `Modal` is reused.
