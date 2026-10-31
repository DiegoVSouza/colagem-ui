import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Flow, FlowLabels, FlowLayout, FlowNode, Lang, Layout } from "./flow-types";
import { edgeKey } from "./flow-types";
import { LINE_H, wrapLabel } from "./flow-text";

export interface FlowLinks {
  code: (path: string) => string;
  docs: (path: string) => string;
}

export interface FlowDiagramProps {
  flow: Flow;
  layout: FlowLayout;
  lang: Lang;
  labels: FlowLabels;
  links?: FlowLinks;
  /** Nodes lit by a real run: node id to a short text such as "412 ms". Nothing animates by itself. */
  live?: Record<string, string>;
  /** Auto-play step interval in ms. */
  interval?: number;
}

/** Order nodes so the text version reads in flow order: Kahn's algorithm, ties by declaration order. */
export function flowOrder(flow: Flow): FlowNode[] {
  const indeg = new Map(flow.nodes.map((n) => [n.id, 0]));
  for (const e of flow.edges) indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  const byId = new Map(flow.nodes.map((n) => [n.id, n]));
  const out: FlowNode[] = [];
  const done = new Set<string>();
  while (out.length < flow.nodes.length) {
    const next = flow.nodes.find((n) => !done.has(n.id) && (indeg.get(n.id) ?? 0) === 0) ?? flow.nodes.find((n) => !done.has(n.id))!;
    done.add(next.id);
    out.push(next);
    for (const e of flow.edges) if (e.from === next.id) indeg.set(e.to, (indeg.get(e.to) ?? 1) - 1);
  }
  return out.map((n) => byId.get(n.id)!);
}

/** The nested-list version of a flow. Primary text alternative: screen readers read SVG diagrams as run-on text. */
export function FlowList({ flow, lang, labels }: { flow: Flow; lang: Lang; labels: FlowLabels }) {
  const byId = new Map(flow.nodes.map((n) => [n.id, n]));
  return (
    <ol className="flow-list">
      {flowOrder(flow).map((n) => {
        const outgoing = flow.edges.filter((e) => e.from === n.id);
        return (
          <li key={n.id}>
            <strong>{n.label[lang]}</strong> <span className="flow-proj">{n.project}</span>. {n.detail[lang]}
            {outgoing.length > 0 && (
              <ul>
                {outgoing.map((e) => (
                  <li key={edgeKey(e)}>
                    {labels.then} {byId.get(e.to)!.label[lang]}
                    {e.label ? ` (${e.label[lang]})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function cutPoints(w: number, h: number): string {
  return [[0, 3], [6, 0], [w - 8, 2], [w, 0], [w - 1, h / 2], [w, h - 3], [w - 8, h], [5, h - 2], [0, h - 5]].map((p) => p.join(",")).join(" ");
}

/** Sample a polyline into at most `count` points, evenly by length. Deterministic. */
export function samplePath(points: [number, number][], count = 12): [number, number][] {
  if (points.length < 2) return points;
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i]![0], p[1] - points[i]![1]));
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const out: [number, number][] = [];
  for (let k = 0; k <= count; k++) {
    let d = (total * k) / count;
    let i = 0;
    while (i < lengths.length - 1 && d > lengths[i]!) {
      d -= lengths[i]!;
      i++;
    }
    const t = lengths[i] ? d / lengths[i]! : 0;
    const a = points[i]!;
    const b = points[i + 1]!;
    out.push([Math.round((a[0] + (b[0] - a[0]) * t) * 10) / 10, Math.round((a[1] + (b[1] - a[1]) * t) * 10) / 10]);
  }
  return out;
}

interface SvgProps {
  flow: Flow;
  layout: Layout;
  dir: "h" | "v";
  lang: Lang;
  labels: FlowLabels;
  focusNodes: Set<string>;
  focusEdges: Set<string>;
  scoped: boolean;
  selected: string | null;
  live?: Record<string, string>;
  onSelect: (id: string) => void;
  onKey: (event: KeyboardEvent, id: string) => void;
  title: string;
  desc: string;
}

function Svg(p: SvgProps) {
  const pos = new Map(p.layout.nodes.map((n) => [n.id, n]));
  return (
    <svg className={`flow-svg flow-${p.dir}`} viewBox={`0 0 ${p.layout.width + 8} ${p.layout.height + 8}`} role="group" aria-label={p.title}>
      <title>{p.title}</title>
      <desc>{p.desc}</desc>
      <defs>
        <marker id={`arrow-${p.dir}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path className="flow-arrow" d="M0,0 L10,5 L0,10 z" />
        </marker>
        <marker id={`arrow-red-${p.dir}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path className="flow-arrow-red" d="M0,0 L10,5 L0,10 z" />
        </marker>
      </defs>
      {p.layout.edges.map((e) => {
        const on = p.focusEdges.has(e.key);
        const d = e.points.map((pt, i) => `${i ? "L" : "M"}${pt[0]},${pt[1]}`).join(" ");
        return (
          <g key={e.key} className={`flow-edge${on ? " on" : p.scoped ? " dim" : ""}`}>
            <path d={d} markerEnd={`url(#${on ? "arrow-red" : "arrow"}-${p.dir})`} />
            {on && <rect className="flow-token" width="10" height="10" x="-5" y="-5" data-token={JSON.stringify(samplePath(e.points))} />}
          </g>
        );
      })}
      {p.flow.nodes.map((n) => {
        const box = pos.get(n.id);
        if (!box) return null;
        const lines = wrapLabel(n.label[p.lang]);
        const on = p.focusNodes.has(n.id);
        const lit = p.live?.[n.id];
        const cls = ["flow-node", on ? "focus" : p.scoped ? "dim" : "", p.selected === n.id ? "selected" : "", lit ? "live" : ""].filter(Boolean).join(" ");
        return (
          <g
            key={n.id}
            className={cls}
            transform={`translate(${box.x},${box.y})`}
            tabIndex={0}
            role="button"
            aria-pressed={p.selected === n.id}
            aria-label={`${n.label[p.lang]}${lit ? `, ${lit}` : ""}`}
            data-node={n.id}
            onClick={() => p.onSelect(n.id)}
            onKeyDown={(event) => p.onKey(event, n.id)}
          >
            <polygon className="flow-shadow" points={cutPoints(box.w, box.h)} transform="translate(6,6)" />
            <polygon className="flow-box" points={cutPoints(box.w, box.h)} />
            <text className="flow-label" x={box.w / 2} y={box.h / 2 - ((lines.length - 1) * LINE_H) / 2 + 8} textAnchor="middle">
              {lines.map((line, i) => (
                <tspan key={i} x={box.w / 2} dy={i === 0 ? 0 : LINE_H}>
                  {i < lines.length - 1 ? `${line} ` : line}
                </tspan>
              ))}
            </text>
            {lit && (
              <text className="flow-live" x={box.w / 2} y={box.h + 16} textAnchor="middle">
                {lit}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function FlowDiagram({ flow, layout, lang, labels, links, live, interval = 2600 }: FlowDiagramProps) {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [index, setIndex] = useState<number | null>(null); // null: the whole diagram, no scene
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const sceneIds = useMemo(() => {
    const scenario = flow.scenarios?.find((s) => s.id === scenarioId);
    return scenario ? scenario.scenes : flow.scenes.filter((s) => !s.scenarioOnly).map((s) => s.id);
  }, [flow, scenarioId]);
  const scene = index === null ? null : flow.scenes.find((s) => s.id === sceneIds[index]) ?? null;

  const focusNodes = useMemo(() => new Set(scene?.nodes ?? []), [scene]);
  const focusEdges = useMemo(() => new Set(scene?.edges ?? []), [scene]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((i) => {
        const next = (i ?? -1) + 1;
        if (next >= sceneIds.length) {
          setPlaying(false);
          return i;
        }
        return next;
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [playing, sceneIds, interval]);

  // A token travels along each active edge. Transform and opacity only; nothing moves under reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el || index === null) return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.querySelectorAll<SVGElement>("[data-token]").forEach((token) => {
      if (typeof token.animate !== "function") return;
      const pts = JSON.parse(token.getAttribute("data-token") ?? "[]") as [number, number][];
      if (pts.length < 2) return;
      token.animate(
        pts.map(([x, y], i) => ({ transform: `translate(${x}px, ${y}px)`, opacity: i === 0 || i === pts.length - 1 ? 0 : 1 })),
        { duration: 900, easing: "ease-in-out" },
      );
    });
  }, [index, scenarioId]);

  const go = useCallback(
    (to: number) => setIndex(Math.max(0, Math.min(sceneIds.length - 1, to))),
    [sceneIds.length],
  );

  const outgoing = (id: string) => flow.edges.filter((e) => e.from === id).map((e) => e.to);
  const incoming = (id: string) => flow.edges.filter((e) => e.to === id).map((e) => e.from);
  const focusNode = (id: string) => {
    // Two SVGs are in the DOM and CSS shows one; focus the node in the one that is displayed.
    const candidates = Array.from(root.current?.querySelectorAll<SVGElement>(`[data-node="${id}"]`) ?? []);
    const visible = candidates.find((c) => getComputedStyle(c.closest("svg")!).display !== "none") ?? candidates[0];
    visible?.focus();
  };

  const onKey = (event: KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelected((cur) => (cur === id ? null : id));
    } else if (event.key === "Escape") {
      setSelected(null);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      const next = outgoing(id)[0];
      if (next) { event.preventDefault(); focusNode(next); }
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      const prev = incoming(id)[0];
      if (prev) { event.preventDefault(); focusNode(prev); }
    }
  };

  const node = selected ? flow.nodes.find((n) => n.id === selected) : null;
  const title = flow.title[lang];
  const desc = `${labels.diagramLabel}: ${flowOrder(flow).map((n) => n.label[lang]).join(", ")}`;
  const common = { flow, lang, labels, focusNodes, focusEdges, scoped: scene !== null, selected, live, onSelect: (id: string) => setSelected((c) => (c === id ? null : id)), onKey, title, desc };

  const button = (label: string, onClick: () => void, extra: { disabled?: boolean; pressed?: boolean } = {}): ReactNode => (
    <button type="button" className="flow-btn" onClick={onClick} disabled={extra.disabled} aria-pressed={extra.pressed}>
      {label}
    </button>
  );

  return (
    <div className="flow" ref={root} data-flow={flow.id} onKeyDown={(e) => e.key === "Escape" && setSelected(null)}>
      <div className="flow-controls" role="group" aria-label={title}>
        {button(playing ? labels.pause : labels.play, () => { if (!playing && (index === null || index >= sceneIds.length - 1)) setIndex(0); setPlaying((p) => !p); })}
        {button(labels.previous, () => { setPlaying(false); go((index ?? 0) - 1); }, { disabled: index === null || index === 0 })}
        {button(labels.next, () => { setPlaying(false); go((index ?? -1) + 1); }, { disabled: index !== null && index >= sceneIds.length - 1 })}
        {button(labels.reset, () => { setPlaying(false); setIndex(null); setScenarioId(null); })}
        {flow.scenarios && flow.scenarios.length > 0 && (
          <div className="flow-scenarios" role="group" aria-label={labels.scenarios}>
            {flow.scenarios.map((s) =>
              button(s.label[lang], () => { setPlaying(false); setScenarioId(s.id); setIndex(0); }, { pressed: scenarioId === s.id }),
            )}
          </div>
        )}
      </div>
      <div className="flow-stage">
        <Svg {...common} layout={layout.horizontal} dir="h" />
        <Svg {...common} layout={layout.vertical} dir="v" />
      </div>
      <p className="flow-caption" role="status" aria-live="polite">
        {scene ? (
          <>
            <span className="flow-step">{labels.step(index! + 1, sceneIds.length)}</span> {scene.caption[lang]}
          </>
        ) : (
          labels.allSteps
        )}
      </p>
      {node && (
        <aside className="flow-detail" aria-label={node.label[lang]}>
          <h4>{node.label[lang]}</h4>
          <p className="flow-proj">{labels.project}: {node.project}</p>
          <p>{node.detail[lang]}</p>
          {links && (node.code || node.docs) && (
            <p className="flow-links">
              {node.code && <a href={links.code(node.code)} rel="noopener noreferrer">{labels.code}</a>}
              {node.docs && <a href={links.docs(node.docs)} rel="noopener noreferrer">{labels.docs}</a>}
            </p>
          )}
          <button type="button" className="flow-btn" onClick={() => setSelected(null)}>{labels.detailClose}</button>
        </aside>
      )}
      <details className="flow-text" open>
        <summary>{labels.listTitle}</summary>
        <FlowList flow={flow} lang={lang} labels={labels} />
      </details>
    </div>
  );
}
