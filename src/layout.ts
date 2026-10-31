/**
 * Build-time layout for FlowDiagram. NODE ONLY: this entry imports elkjs, which is EPL-2.0 OR GPL-3.0
 * and must never reach a browser bundle. It is a separate package entry (`colagem-ui/layout`) and
 * `scripts/budget.mjs` fails if `index.js` mentions elkjs.
 */
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import type { Flow, FlowLayout, Layout, Lang } from "./flow-types";
import { edgeKey } from "./flow-types";
import { nodeSize } from "./flow-text";

export { wrapLabel, nodeSize } from "./flow-text";

const elk = new ELK();
async function place(flow: Flow, direction: "RIGHT" | "DOWN", lang: Lang): Promise<Layout> {
  const sizes = new Map(flow.nodes.map((n) => [n.id, nodeSize(n.label[lang])]));
  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.spacing.nodeNodeBetweenLayers": direction === "RIGHT" ? "56" : "44",
      "elk.spacing.nodeNode": "28",
      "elk.padding": "[top=16,left=16,bottom=16,right=16]",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
    },
    children: flow.nodes.map((n) => ({ id: n.id, ...sizes.get(n.id)! })),
    edges: flow.edges.map((e) => ({ id: edgeKey(e), sources: [e.from], targets: [e.to] })),
  };
  const out = await elk.layout(graph);
  const edgesOut = (out.edges ?? []) as ElkExtendedEdge[];
  const round = (v: number) => Math.round(v * 10) / 10;
  return {
    width: Math.ceil(out.width ?? 0),
    height: Math.ceil(out.height ?? 0),
    nodes: (out.children ?? []).map((c) => ({ id: c.id, x: round(c.x ?? 0), y: round(c.y ?? 0), w: c.width ?? 0, h: c.height ?? 0 })),
    edges: edgesOut.map((e) => {
      const section = e.sections?.[0];
      const pts: [number, number][] = section
        ? [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map((p) => [round(p.x), round(p.y)] as [number, number])
        : [];
      return { key: e.id, points: pts };
    }),
  };
}

/** Horizontal layout for wide screens, vertical for narrow ones. Deterministic for the same input. */
export async function layoutFlow(flow: Flow, lang: Lang = "en"): Promise<FlowLayout> {
  return { horizontal: await place(flow, "RIGHT", lang), vertical: await place(flow, "DOWN", lang) };
}
