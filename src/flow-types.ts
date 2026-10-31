/** Shared shapes for FlowDiagram. No runtime code: safe to import from the browser and from build scripts. */

export type Lang = "en" | "pt";
export interface Text {
  en: string;
  pt: string;
}

export type FlowKind = "pipeline" | "lanes" | "states" | "waterfall";

export interface FlowNode {
  id: string;
  label: Text;
  detail: Text;
  /** Owning project, e.g. "P05". Shown in the node detail. */
  project: string;
  lane?: string;
  /** Path inside the project's repository. The host app turns it into a permalink. */
  code?: string;
  docs?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: Text;
}

export interface FlowScene {
  id: string;
  nodes: string[];
  /** Edge keys, `${from}>${to}`. */
  edges: string[];
  caption: Text;
}

export interface FlowScenario {
  id: string;
  label: Text;
  scenes: string[];
  /** Evidence record id. A scenario with no evidence does not ship. */
  evidence: string;
}

export interface Flow {
  id: string;
  kind: FlowKind;
  title: Text;
  nodes: FlowNode[];
  edges: FlowEdge[];
  scenes: FlowScene[];
  scenarios?: FlowScenario[];
  /** Live step name to node id, used by the run viewer. */
  runStep?: Record<string, string>;
}

export const edgeKey = (edge: Pick<FlowEdge, "from" | "to">): string => `${edge.from}>${edge.to}`;

export interface PlacedNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlacedEdge {
  key: string;
  /** Polyline in diagram coordinates. */
  points: [number, number][];
}

export interface Layout {
  width: number;
  height: number;
  nodes: PlacedNode[];
  edges: PlacedEdge[];
}

/** Two layouts, computed at build time. CSS picks one; nothing is measured in the browser. */
export interface FlowLayout {
  horizontal: Layout;
  vertical: Layout;
}

export interface FlowLabels {
  play: string;
  pause: string;
  previous: string;
  next: string;
  reset: string;
  /** "Step {n} of {total}" */
  step: (n: number, total: number) => string;
  scenarios: string;
  allSteps: string;
  detailClose: string;
  code: string;
  docs: string;
  project: string;
  listTitle: string;
  diagramLabel: string;
  /** "then" prefix for edges in the text version. */
  then: string;
}
