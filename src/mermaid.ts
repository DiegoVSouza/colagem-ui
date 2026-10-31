import type { Flow, Lang } from "./flow-types";

/** Mermaid source for a README, from the same Flow the site draws. Mermaid is never shipped to the site. */
export function flowToMermaid(flow: Flow, lang: Lang = "en"): string {
  const direction = flow.kind === "states" ? "stateDiagram-v2" : "flowchart LR";
  const clean = (text: string) => text.replace(/["\n]/g, " ");
  const lines: string[] = [direction];
  if (flow.kind === "states") {
    for (const e of flow.edges) lines.push(`  ${e.from} --> ${e.to}${e.label ? `: ${clean(e.label[lang])}` : ""}`);
    for (const n of flow.nodes) lines.push(`  ${n.id}: ${clean(n.label[lang])}`);
    return lines.join("\n") + "\n";
  }
  for (const n of flow.nodes) lines.push(`  ${n.id}["${clean(n.label[lang])}"]`);
  for (const e of flow.edges) lines.push(`  ${e.from} -->${e.label ? `|${clean(e.label[lang])}|` : ""} ${e.to}`);
  return lines.join("\n") + "\n";
}
