import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DecisionCard, Hud, LinkTrio, MetricTable, RunLog, SideIndex, Stepper, Tabs } from "./index";

describe("blocks", () => {
  it("shows a missing link as a labelled gap, never a dead anchor", () => {
    render(<LinkTrio label="Links" links={[{ label: "Code", href: "https://example.test" }, { label: "Live demo", missing: "PENDING" }]} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("PENDING")).toBeTruthy();
  });

  it("MetricTable keeps the value exactly as given and names its mode", () => {
    render(<MetricTable caption="m" labels={{ metric: "Metric", value: "Value", mode: "Mode", source: "Source" }} rows={[{ id: "1", label: "Trials passed", value: "27 of 36", mode: "live", source: "x" }]} />);
    expect(screen.getByText("27 of 36")).toBeTruthy();
    expect(screen.getByText("live")).toBeTruthy();
  });

  it("RunLog adds no number of its own and says so when empty", () => {
    const labels = { step: "S", project: "P", model: "M", latency: "L", tokens: "T", cost: "C", empty: "No run yet" };
    const { rerender } = render(<RunLog caption="r" steps={[]} labels={labels} />);
    expect(screen.getByText("No run yet")).toBeTruthy();
    rerender(<RunLog caption="r" steps={[{ id: "1", agent: "classifier", project: "P05", model: "m", latencyMs: 412, tokens: 960, costUsd: 0.000086 }]} labels={labels} />);
    expect(screen.getByText("412 ms")).toBeTruthy();
    expect(screen.getByText("$0.000086")).toBeTruthy();
  });

  it("Stepper marks the current step", () => {
    render(<Stepper label="Tour" current={1} steps={[{ id: "a", title: "One" }, { id: "b", title: "Two", body: <p>detail</p> }]} />);
    expect(screen.getByText("detail")).toBeTruthy();
    expect(document.querySelector('[aria-current="step"]')?.textContent).toContain("Two");
  });

  it("DecisionCard always carries a Rejected line", () => {
    render(<DecisionCard title="T" body="b" rejected="One-click approval." labels={{ rejected: "Rejected:" }} />);
    expect(screen.getByText("Rejected:")).toBeTruthy();
  });

  it("Tabs follow the arrow keys, Home and End, with one tab stop", async () => {
    const user = userEvent.setup();
    render(<Tabs label="L" tabs={[{ id: "a", label: "A", panel: "pa" }, { id: "b", label: "B", panel: "pb" }, { id: "c", label: "C", panel: "pc" }]} />);
    const tabs = screen.getAllByRole("tab");
    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tabs[1]);
    await user.keyboard("{End}");
    expect(tabs[2]!.getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{Home}");
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1);
    expect(screen.getAllByRole("tabpanel", { hidden: true }).filter((p) => !p.hidden)).toHaveLength(1);
  });

  it("SideIndex marks the active project and Hud is hidden from assistive technology", () => {
    render(
      <>
        <SideIndex label="Projects" items={[{ id: "a", label: "A", href: "#a", active: true }, { id: "b", label: "B", href: "#b" }]} />
        <Hud>05/08</Hud>
      </>,
    );
    expect(document.querySelector('[aria-current="page"]')?.textContent).toContain("A");
    expect(document.querySelector(".hud")?.getAttribute("aria-hidden")).toBe("true");
  });
});
