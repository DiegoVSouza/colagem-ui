import type { Flow, FlowLabels, FlowLayout } from "../src";
import layout from "./sample-flow.layout.json";

const t = (en: string, pt = en) => ({ en, pt });

/** A small refund flow for the gallery. Layout is produced at build time (npm run gallery:layout). */
export const sampleFlow: Flow = {
  id: "gallery-refund",
  kind: "lanes",
  title: t("Refund with dual control", "Reembolso com controle duplo"),
  nodes: [
    { id: "ticket", label: t("Ticket arrives", "Ticket chega"), detail: t("A visitor opens a ticket.", "Um visitante abre um ticket."), project: "P05" },
    { id: "agents", label: t("Agents triage", "Agentes triam"), detail: t("Four workers classify and answer.", "Quatro workers classificam e respondem."), project: "P01" },
    { id: "gate", label: t("Gate checks", "Gate confere"), detail: t("A deterministic check on the proposal.", "Checagem determinística da proposta."), project: "P05" },
    { id: "human", label: t("Second person decides", "Segunda pessoa decide"), detail: t("The requester cannot approve their own refund.", "Quem pediu não aprova o próprio reembolso."), project: "P05" },
  ],
  edges: [
    { from: "ticket", to: "agents" },
    { from: "agents", to: "gate", label: t("proposal", "proposta") },
    { from: "gate", to: "human" },
  ],
  scenes: [
    { id: "intake", nodes: ["ticket", "agents"], edges: ["ticket>agents"], caption: t("The ticket reaches the agents.", "O ticket chega aos agentes.") },
    { id: "decide", nodes: ["gate", "human"], edges: ["gate>human"], caption: t("Money needs a second person.", "Dinheiro exige uma segunda pessoa.") },
  ],
  scenarios: [{ id: "own", label: t("Approve your own refund", "Aprovar o próprio reembolso"), scenes: ["decide"], evidence: "gallery" }],
};

export const sampleLayout = layout as unknown as FlowLayout;

export const sampleLabels: FlowLabels = {
  play: "Play", pause: "Pause", previous: "Previous", next: "Next", reset: "Reset",
  step: (n, total) => `Step ${n} of ${total}`, scenarios: "Failure scenarios", allSteps: "The whole flow",
  detailClose: "Close", code: "Code", docs: "Docs", project: "Project", listTitle: "Text version", diagramLabel: "Flow", then: "then",
};
