import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/** Link to a live demo, the code and the docs. A missing target is shown as a plain, labelled gap, never as a dead link. */
export interface LinkTarget {
  label: string;
  href?: string;
  /** Text shown when href is missing, e.g. "PENDING". */
  missing?: string;
}

export function LinkTrio({ links, label }: { links: LinkTarget[]; label: string }) {
  return (
    <ul className="trio" aria-label={label}>
      {links.map((l) => (
        <li key={l.label}>
          {l.href ? (
            <a href={l.href} rel="noopener noreferrer">
              {l.label}
            </a>
          ) : (
            <span className="trio-off">
              {l.label} <span className="trio-why">{l.missing ?? "PENDING"}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export interface MetricRow {
  id: string;
  label: string;
  value: string;
  /** fake, replay, live or service. Shown as a word. */
  mode: string;
  source: ReactNode;
  caveat?: string;
}

export function MetricTable({ caption, rows, labels }: { caption: string; rows: MetricRow[]; labels: { metric: string; value: string; mode: string; source: string } }) {
  return (
    <table className="dt metric">
      <caption className="sr">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{labels.metric}</th>
          <th scope="col">{labels.value}</th>
          <th scope="col">{labels.mode}</th>
          <th scope="col">{labels.source}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <th scope="row">
              {r.label}
              {r.caveat && <span className="sub"> {r.caveat}</span>}
            </th>
            <td data-label={labels.value} className="num">{r.value}</td>
            <td data-label={labels.mode}>{r.mode}</td>
            <td data-label={labels.source}>{r.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export interface RunStep {
  id: string;
  agent: string;
  project: string;
  model: string;
  latencyMs: number;
  tokens: number;
  costUsd: number;
}

/** One row per real model call. Every number comes from the run; this component adds none. */
export function RunLog({ steps, caption, labels }: { steps: RunStep[]; caption: string; labels: { step: string; project: string; model: string; latency: string; tokens: string; cost: string; empty: string } }) {
  if (steps.length === 0) return <p className="runlog-empty">{labels.empty}</p>;
  return (
    <table className="dt runlog">
      <caption className="sr">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{labels.step}</th>
          <th scope="col">{labels.project}</th>
          <th scope="col">{labels.model}</th>
          <th scope="col" className="num">{labels.latency}</th>
          <th scope="col" className="num">{labels.tokens}</th>
          <th scope="col" className="num">{labels.cost}</th>
        </tr>
      </thead>
      <tbody>
        {steps.map((s) => (
          <tr key={s.id}>
            <th scope="row">{s.agent}</th>
            <td data-label={labels.project}>{s.project}</td>
            <td data-label={labels.model}><code>{s.model}</code></td>
            <td data-label={labels.latency} className="num">{s.latencyMs} ms</td>
            <td data-label={labels.tokens} className="num">{s.tokens}</td>
            <td data-label={labels.cost} className="num">${s.costUsd.toFixed(6)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export interface StepperItem {
  id: string;
  title: string;
  body?: ReactNode;
}

export function Stepper({ steps, current, onSelect, label }: { steps: StepperItem[]; current: number; onSelect?: (index: number) => void; label: string }) {
  return (
    <ol className="stepper" aria-label={label}>
      {steps.map((s, i) => (
        <li key={s.id} className={i === current ? "now" : i < current ? "done" : ""} aria-current={i === current ? "step" : undefined}>
          {onSelect ? (
            <button type="button" className="step-btn" onClick={() => onSelect(i)}>
              <span className="step-n">{String(i + 1).padStart(2, "0")}</span> {s.title}
            </button>
          ) : (
            <span className="step-btn">
              <span className="step-n">{String(i + 1).padStart(2, "0")}</span> {s.title}
            </span>
          )}
          {i === current && s.body && <div className="step-body">{s.body}</div>}
        </li>
      ))}
    </ol>
  );
}

export interface TimelineItem {
  id: string;
  when: string;
  title: string;
  body?: ReactNode;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="timeline">
      {items.map((it) => (
        <li key={it.id}>
          <p className="tl-when">{it.when}</p>
          <h3 className="tl-title">{it.title}</h3>
          {it.body && <div className="tl-body">{it.body}</div>}
        </li>
      ))}
    </ol>
  );
}

export function DecisionCard({ title, body, rejected, link, labels }: { title: string; body: ReactNode; rejected: string; link?: { href: string; text: string }; labels: { rejected: string } }) {
  return (
    <article className="decision">
      <h3>{title}</h3>
      <div className="decision-body">{body}</div>
      {link && (
        <p>
          <a href={link.href} rel="noopener noreferrer">{link.text}</a>
        </p>
      )}
      <p className="rejected">
        <strong>{labels.rejected}</strong> {rejected}
      </p>
    </article>
  );
}

export function FailureCard({ what, cause, change, labels }: { what: string; cause: string; change: string; labels: { what: string; cause: string; change: string } }) {
  return (
    <article className="failure">
      <dl>
        <dt>{labels.what}</dt>
        <dd>{what}</dd>
        <dt>{labels.cause}</dt>
        <dd>{cause}</dd>
        <dt>{labels.change}</dt>
        <dd>{change}</dd>
      </dl>
    </article>
  );
}

export interface SideIndexItem {
  id: string;
  label: string;
  href: string;
  active?: boolean;
}

/** Lateral project index. Hidden under 900 px by CSS; the same links exist in the page body. */
export function SideIndex({ items, label }: { items: SideIndexItem[]; label: string }) {
  return (
    <nav className="sideindex" aria-label={label}>
      <ol>
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={it.href} aria-current={it.active ? "page" : undefined}>
              <span className="si-n">{String(i + 1).padStart(2, "0")}</span> {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Decorative status line. Everything it shows is also in the page, so it is hidden from assistive technology. */
export function Hud({ children }: { children: ReactNode }) {
  return (
    <div className="hud" aria-hidden="true">
      {children}
    </div>
  );
}

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

export function Tabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (event: KeyboardEvent, i: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const to = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (i + step + tabs.length) % tabs.length;
    if (step === 0 && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    setActive(to);
    refs.current[to]?.focus();
  };
  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            id={`${base}-t-${t.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-p-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            className="tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => move(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${base}-p-${t.id}`} aria-labelledby={`${base}-t-${t.id}`} hidden={i !== active} tabIndex={0} className="tabpanel">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
