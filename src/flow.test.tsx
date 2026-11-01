import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FlowDiagram, FlowList, flowOrder, flowToMermaid, samplePath, type Flow, type FlowLabels, type FlowLayout } from "./index";
import { layoutFlow } from "./layout";

const t = (en: string, pt = en) => ({ en, pt });
const flow: Flow = {
  id: "sample",
  kind: "pipeline",
  title: t("Sample flow", "Fluxo de exemplo"),
  nodes: [
    { id: "a", label: t("Ticket arrives", "Ticket chega"), detail: t("A ticket is created.", "Um ticket é criado."), project: "P05", code: "src/a.py", docs: "docs/a.md" },
    { id: "b", label: t("Agents triage", "Agentes triam"), detail: t("Four workers run.", "Quatro workers rodam."), project: "P01" },
    { id: "c", label: t("Gate checks", "Gate confere"), detail: t("Deterministic check.", "Checagem determinística."), project: "P05" },
    { id: "d", label: t("Human decides", "Pessoa decide"), detail: t("A second person approves.", "Uma segunda pessoa aprova."), project: "P05" },
  ],
  edges: [
    { from: "a", to: "b" },
    { from: "b", to: "c", label: t("proposal", "proposta") },
    { from: "c", to: "d" },
  ],
  scenes: [
    { id: "s1", nodes: ["a", "b"], edges: ["a>b"], caption: t("The ticket reaches the agents.", "O ticket chega aos agentes.") },
    { id: "s2", nodes: ["c", "d"], edges: ["c>d"], caption: t("The gate hands off to a person.", "O gate passa para uma pessoa.") },
  ],
  scenarios: [{ id: "refuse", label: t("Approve your own refund"), scenes: ["s2"], evidence: "ev-1" }],
};
const labels: FlowLabels = {
  play: "Play", pause: "Pause", previous: "Previous", next: "Next", reset: "Reset",
  step: (n, total) => `Step ${n} of ${total}`, scenarios: "Failure scenarios", allSteps: "Whole flow",
  detailClose: "Close", code: "Code", docs: "Docs", project: "Project", listTitle: "Text version", diagramLabel: "Flow", then: "then",
};
let layout: FlowLayout;
beforeAll(async () => {
  layout = await layoutFlow(flow, "en");
});

const media = (reduce: boolean) =>
  ((q: string) => ({ matches: reduce && q.includes("reduce"), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;

describe("layoutFlow", () => {
  it("places every node inside the canvas without overlap, and routes every edge", () => {
    for (const l of [layout.horizontal, layout.vertical]) {
      expect(l.nodes).toHaveLength(4);
      for (const n of l.nodes) {
        // Regression: nodes were laid out at size zero, so the overlap check below passed on a collapsed diagram.
        expect(n.w, `${n.id} width`).toBeGreaterThanOrEqual(120);
        expect(n.h, `${n.id} height`).toBeGreaterThanOrEqual(54);
        expect(n.x).toBeGreaterThanOrEqual(0);
        expect(n.x + n.w).toBeLessThanOrEqual(l.width);
        expect(n.y + n.h).toBeLessThanOrEqual(l.height);
      }
      for (const a of l.nodes) {
        for (const b of l.nodes) {
          if (a.id < b.id) expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(true);
        }
      }
      expect(l.edges.map((e) => e.key).sort()).toEqual(["a>b", "b>c", "c>d"]);
      for (const e of l.edges) expect(e.points.length).toBeGreaterThanOrEqual(2);
    }
  });
  it("is deterministic and keeps the horizontal layout wider than the vertical one", async () => {
    expect(await layoutFlow(flow, "en")).toEqual(layout);
    expect(layout.horizontal.width).toBeGreaterThan(layout.vertical.width);
    expect(layout.vertical.height).toBeGreaterThan(layout.horizontal.height);
  });
});

describe("FlowDiagram", () => {
  const links = { code: (p: string) => `https://example.test/blob/abc/${p}`, docs: (p: string) => `https://example.test/blob/abc/${p}` };
  const view = () => render(<FlowDiagram flow={flow} layout={layout} lang="en" labels={labels} links={links} />);

  it("renders the text version in flow order, with the edge labels", () => {
    view();
    const items = Array.from(document.querySelectorAll(".flow-list > li")).map((li) => li.querySelector("strong")!.textContent);
    expect(items).toEqual(["Ticket arrives", "Agents triage", "Gate checks", "Human decides"]);
    expect(document.querySelector(".flow-list")!.textContent).toContain("then Gate checks (proposal)");
  });

  it("walks through scenes and announces each caption in a polite live region", async () => {
    const user = userEvent.setup();
    view();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Whole flow");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(status.textContent).toContain("Step 1 of 2 The ticket reaches the agents.");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(status.textContent).toContain("Step 2 of 2 The gate hands off to a person.");
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(status.textContent).toContain("Step 1 of 2");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(status.textContent).toContain("Whole flow");
  });

  it("puts only the scene's nodes in focus and dims the rest without opacity", async () => {
    const user = userEvent.setup();
    view();
    await user.click(screen.getByRole("button", { name: "Next" }));
    const horizontal = document.querySelector(".flow-h")!;
    expect(horizontal.querySelectorAll(".flow-node.focus")).toHaveLength(2);
    expect(horizontal.querySelectorAll(".flow-node.dim")).toHaveLength(2);
    expect(horizontal.querySelectorAll(".flow-edge.on")).toHaveLength(1);
  });

  it("replays a named failure scenario using only its scenes", async () => {
    const user = userEvent.setup();
    view();
    await user.click(screen.getByRole("button", { name: "Approve your own refund" }));
    expect(screen.getByRole("status").textContent).toContain("Step 1 of 1 The gate hands off to a person.");
    expect(screen.getByRole("button", { name: "Approve your own refund" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("opens node detail with permalinks on Enter and closes it on Escape", async () => {
    const user = userEvent.setup();
    view();
    document.querySelector<SVGElement>('.flow-h [data-node="a"]')!.focus();
    await user.keyboard("{Enter}");
    const detail = screen.getByRole("complementary", { name: "Ticket arrives" });
    expect(within(detail).getByText("A ticket is created.")).toBeTruthy();
    expect(within(detail).getByRole("link", { name: "Code" }).getAttribute("href")).toBe("https://example.test/blob/abc/src/a.py");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("moves along edges with the arrow keys", async () => {
    const user = userEvent.setup();
    view();
    document.querySelector<SVGElement>('.flow-h [data-node="a"]')!.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement?.getAttribute("data-node")).toBe("b");
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement?.getAttribute("data-node")).toBe("a");
  });

  it("lights a node only when a real run says so", () => {
    const { rerender } = view();
    expect(document.querySelectorAll(".flow-node.live")).toHaveLength(0);
    rerender(<FlowDiagram flow={flow} layout={layout} lang="en" labels={labels} live={{ b: "412 ms" }} />);
    const lit = document.querySelector('.flow-h [data-node="b"]')!;
    expect(lit.classList.contains("live")).toBe(true);
    expect(lit.getAttribute("aria-label")).toBe("Agents triage, 412 ms");
  });

  it("travels a token along the active edge, and not under reduced motion", async () => {
    const user = userEvent.setup();
    const animate = vi.fn();
    (SVGElement.prototype as unknown as { animate: unknown }).animate = animate;
    window.matchMedia = media(false);
    view();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(animate).toHaveBeenCalled();
    const keyframes = animate.mock.calls[0]![0] as Record<string, string>[];
    expect(keyframes.every((k) => Object.keys(k).every((p) => p === "transform" || p === "opacity"))).toBe(true);
    animate.mockClear();
    window.matchMedia = media(true);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(animate).not.toHaveBeenCalled();
  });

  it("renders in Portuguese", () => {
    render(<FlowDiagram flow={flow} layout={layout} lang="pt" labels={labels} />);
    expect(document.querySelector(".flow-list")!.textContent).toContain("Ticket chega");
  });
});

describe("helpers", () => {
  it("orders a graph with a cycle without looping forever", () => {
    const cyclic: Flow = { ...flow, edges: [...flow.edges, { from: "d", to: "a" }] };
    expect(flowOrder(cyclic)).toHaveLength(4);
    render(<FlowList flow={cyclic} lang="en" labels={labels} />);
  });
  it("samples a path from end to end", () => {
    const pts = samplePath([[0, 0], [10, 0], [10, 10]], 4);
    expect(pts[0]).toEqual([0, 0]);
    expect(pts.at(-1)).toEqual([10, 10]);
    expect(pts).toHaveLength(5);
  });
  it("exports Mermaid from the same data", () => {
    const text = flowToMermaid(flow, "en");
    expect(text).toContain('a["Ticket arrives"]');
    expect(text).toContain("b -->|proposal| c");
    expect(flowToMermaid(flow, "pt")).toContain('a["Ticket chega"]');
  });
});
