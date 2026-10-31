import {
  useCallback, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type CSSProperties, type FormHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes,
} from "react";

/** Status glyphs (DS-003): the glyph and the word travel together, never color alone. */
export const GLYPH = { none: "○", partial: "◐", full: "●", warn: "!", fail: "✕", ok: "✓" } as const;
export type GlyphKind = keyof typeof GLYPH;

export function StatusSeal({ kind, label, active = false }: { kind: GlyphKind; label: string; active?: boolean }) {
  return (
    <span className={`seal seal-${kind}`}>
      {active && <span aria-hidden="true">▶ </span>}
      <span aria-hidden="true">{GLYPH[kind]} </span>
      {label}
    </span>
  );
}

/* ---------- shell ---------- */

export function AppHeader({ brand, brandHref = "#/", nav, children, navLabel }: {
  brand: ReactNode; brandHref?: string; nav?: ReactNode; children?: ReactNode; navLabel: string;
}) {
  return (
    <header className="top">
      <a className="brand" href={brandHref}>{brand}</a>
      {nav && <nav className="top-links" aria-label={navLabel}>{nav}</nav>}
      <div className="top-tools">{children}</div>
    </header>
  );
}

export function AppFooter({ children, credits }: { children?: ReactNode; credits?: ReactNode }) {
  return (
    <footer className="foot">
      {children}
      {credits && <p className="credits">{credits}</p>}
    </footer>
  );
}

export function SkipLink({ href = "#main", children }: { href?: string; children: ReactNode }) {
  return <a className="skip" href={href}>{children}</a>;
}

/* ---------- text ---------- */

export function Headline({ children, id, focusOnMount = false }: { children: ReactNode; id?: string; focusOnMount?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (focusOnMount) ref.current?.focus(); }, [focusOnMount]);
  return (
    <div className="hl-wrap">
      <span className="hl-block" aria-hidden="true" />
      <h1 className="hl" id={id} ref={ref} tabIndex={focusOnMount ? -1 : undefined}>{children}</h1>
    </div>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="lead">{children}</p>;
}

export function Command({ verb, object, n }: { verb: string; object: string; n?: number | string }) {
  return <p className="cmd" aria-hidden="true">$ {verb} {object}{n !== undefined ? ` ${n}` : ""}</p>;
}

export function Band({ words }: { words: string[] }) {
  const line = words.map((w) => `${w} ★ `).join("");
  return (
    <div className="band-clip" aria-hidden="true">
      <div className="band">
        <div className="band-track"><span>{line}</span><span>{line}</span></div>
      </div>
    </div>
  );
}

export function GhostNumber({ n }: { n: string }) {
  return <span className="ghost" aria-hidden="true" data-n={n} />;
}

/** Deterministic hash so tests and screenshots are stable. */
function seeded(text: string): () => number {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
}

/** Cut-out-letter plate: logo and plate only. Visual copy is aria-hidden, real text is .sr. */
export function Plate({ text, label, size = "plate" }: { text: string; label?: string; size?: "plate" | "logo" }) {
  const rand = seeded(text);
  const letters = [...text].map((ch, i) => {
    if (ch === " ") return <span key={i} className="pl-gap" />;
    const family = Math.floor(rand() * 3);
    const kit = Math.floor(rand() * 3);
    const upper = rand() < 0.5;
    const style = { "--rot": `${((rand() - 0.5) * 9.6).toFixed(2)}deg`, "--dy": `${((rand() - 0.5) * 2).toFixed(2)}px` } as CSSProperties;
    return <span key={i} className={`pl f${family} k${kit}`} style={style}>{upper ? ch.toUpperCase() : ch.toLowerCase()}</span>;
  });
  return (
    <div className={`plate-wrap${size === "logo" ? " logo" : ""}`}>
      {label && <span className="plate-l">{label}</span>}
      <span className="sr">{text}</span>
      <div className={`plate${size === "logo" ? " logo" : ""}`} aria-hidden="true">{letters}</div>
    </div>
  );
}

/* ---------- cards ---------- */

export function Card({ variant = "rest", index = 0, numeral, seal, title, summary, meta, tag, command, label, headingLevel = 3, clamp = false, children }: {
  variant?: "rest" | "focus"; index?: number; numeral?: string; seal?: ReactNode; title: ReactNode; summary?: ReactNode;
  meta?: ReactNode; tag?: string; command?: ReactNode; label: string; headingLevel?: 2 | 3 | 4; clamp?: boolean; children?: ReactNode;
}) {
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <article className={`cw ${variant} ${index % 2 === 0 ? "odd" : "even"}`} tabIndex={0} aria-label={label}>
      <div className="item">
        <span className="tape" aria-hidden="true" />
        <span className="dots" aria-hidden="true" />
        {numeral && <span className="numeral" aria-hidden="true">{numeral}</span>}
        {seal}
        <H className="card-title">{title}</H>
        {summary && <p className={`card-sum${clamp ? " clamp" : ""}`}>{summary}</p>}
        {children}
        {(meta || tag) && (
          <p className="meta"><span>{meta}</span>{tag && <span className="tag">#{tag}</span>}</p>
        )}
        {command}
      </div>
    </article>
  );
}

/* ---------- controls ---------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger"; size?: "md" | "sm"; disabledReason?: string;
};

export function Button({ variant = "primary", size = "md", disabledReason, disabled, children, className = "", ...rest }: ButtonProps) {
  const reasonId = useId();
  return (
    <>
      <button
        type="button"
        {...rest}
        disabled={disabled}
        aria-describedby={disabled && disabledReason ? reasonId : rest["aria-describedby"]}
        className={`btn btn-${variant}${size === "sm" ? " btn-sm" : ""} ${className}`.trim()}
      >
        {variant === "danger" && <span aria-hidden="true">✕ </span>}
        {children}
      </button>
      {disabled && disabledReason && <span id={reasonId} className="reason">{disabledReason}</span>}
    </>
  );
}

export function Toggle({ pressed, onChange, children }: { pressed: boolean; onChange: (next: boolean) => void; children: ReactNode }) {
  return (
    <button type="button" className="tg" aria-pressed={pressed} onClick={() => onChange(!pressed)}>
      {children}
    </button>
  );
}

export function Field({ label, error, hint, multiline = false, ...input }: {
  label: string; error?: string; hint?: string; multiline?: boolean;
} & InputHTMLAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const noteId = `${id}-note`;
  const describedBy = error || hint ? noteId : undefined;
  const common = { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, className: `field-input${error ? " has-error" : ""}` };
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline
        ? <textarea {...(input as object)} {...common} rows={4} />
        : <input {...(input as InputHTMLAttributes<HTMLInputElement>)} {...common} />}
      {error ? <p id={noteId} className="field-error"><span aria-hidden="true">✕ </span>{error}</p>
        : hint ? <p id={noteId} className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function SelectField({ label, children, ...select }: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select {...select} id={id} className="field-input">{children}</select>
    </div>
  );
}

/** Bordered container for a task (a form or a block of controls). */
export function Panel({ title, as = "section", children, ...rest }: { title: string; as?: "section" | "form"; children: ReactNode } & Omit<FormHTMLAttributes<HTMLFormElement>, "title">) {
  const id = useId();
  const body = (<><h2 id={id} className="panel-title">{title}</h2>{children}</>);
  return as === "form"
    ? <form {...rest} aria-labelledby={id} className="panel">{body}</form>
    : <section aria-labelledby={id} className="panel">{body}</section>;
}

/* ---------- data and feedback ---------- */

export interface Column<T> { key: string; label: string; numeric?: boolean; render: (row: T) => ReactNode }

export function DataTable<T>({ caption, columns, rows, rowKey }: {
  caption: string; columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string;
}) {
  return (
    <table className="dt">
      <caption className="sr">{caption}</caption>
      <thead>
        <tr>{columns.map((c) => <th key={c.key} scope="col" className={c.numeric ? "num" : undefined}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={rowKey(r)}>
            {columns.map((c, i) => i === 0
              ? <th key={c.key} scope="row">{c.render(r)}</th>
              : <td key={c.key} className={c.numeric ? "num" : undefined} data-label={c.label}>{c.render(r)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Toast({ kind, children, onClose, closeLabel, duration = 5000 }: {
  kind: "ok" | "warn" | "fail"; children: ReactNode; onClose: () => void; closeLabel: string; duration?: number;
}) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!duration) return;
    const t = window.setTimeout(() => close.current(), duration);
    return () => window.clearTimeout(t);
  }, [duration]);
  const glyph = kind === "ok" ? GLYPH.ok : kind === "warn" ? GLYPH.warn : GLYPH.fail;
  return (
    <div className={`toast toast-${kind}`} role={kind === "fail" ? "alert" : "status"}>
      <span aria-hidden="true">{glyph} </span>
      <span>{children}</span>
      <button type="button" className="toast-x" onClick={onClose} aria-label={closeLabel}>×</button>
    </div>
  );
}

export function Modal({ title, open, onClose, closeLabel, children }: {
  title: string; open: boolean; onClose: () => void; closeLabel: string; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current!;
    const focusable = () => [...node.querySelectorAll<HTMLElement>("button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])")].filter((e) => !e.hasAttribute("disabled"));
    (focusable()[0] ?? node).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0]!, last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener("keydown", onKey);
    return () => { node.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-veil">
      <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <h2 id={titleId} className="card-title">{title}</h2>
        {children}
        <Button variant="secondary" onClick={onClose}>{closeLabel}</Button>
      </div>
    </div>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress">
      <span id="pg-l">{label}</span>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label}>
        <span className="fill" style={{ "--v": `${v}%` } as CSSProperties} />
      </div>
      <span className="pg-v">{v}%</span>
    </div>
  );
}

export function EmptyState({ numeral = "00", text, action }: { numeral?: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="numeral" aria-hidden="true">{numeral}</span>
      <p>{text}</p>
      {action}
    </div>
  );
}

/** Fly services autostop (ADR-001): show text and elapsed time, never an endless spinner. */
export function WakeNotice({ service, elapsed, expected, failed, onRetry, labels }: {
  service: string; elapsed: number; expected: number; failed?: boolean; onRetry: () => void;
  labels: { waking: (service: string, elapsed: number, expected: number) => string; failed: (service: string) => string; retry: string };
}) {
  const pct = Math.min(95, (elapsed / expected) * 100);
  return (
    <div className="wake" role="status" aria-live="polite">
      {failed ? (
        <>
          <p><span aria-hidden="true">{GLYPH.fail} </span>{labels.failed(service)}</p>
          <Button onClick={onRetry}>{labels.retry}</Button>
        </>
      ) : (
        <>
          <p>{labels.waking(service, elapsed, expected)}</p>
          <div className="bar" aria-hidden="true"><span className="fill" style={{ "--v": `${pct}%` } as CSSProperties} /></div>
        </>
      )}
    </div>
  );
}

/** Counts seconds while `active`, for WakeNotice. */
export function useElapsed(active: boolean): number {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!active) { setS(0); return; }
    const t = window.setInterval(() => setS((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [active]);
  return s;
}

/* ---------- level 1: 2D layers (section 6) ---------- */

export type BackgroundMode = "3d" | "3d-static" | "2d";

export function pickBackground({ webgl2, reduce }: { webgl2: boolean; reduce: boolean }): BackgroundMode {
  return webgl2 ? (reduce ? "3d-static" : "3d") : "2d";
}

/** Level 1 never needs 3D: the mode only decides whether a later 3D layer may mount. */
export function useBackgroundMode(): BackgroundMode {
  const [mode] = useState<BackgroundMode>(() => {
    let webgl2 = false;
    try { webgl2 = !!document.createElement("canvas").getContext("webgl2"); } catch { /* no WebGL */ }
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    return pickBackground({ webgl2, reduce });
  });
  useEffect(() => { document.documentElement.dataset.bg = mode; }, [mode]);
  return mode;
}

const SKYLINE = (() => {
  const rand = seeded("skyline");
  let x = 0;
  const out: { x: number; w: number; h: number; lit: number }[] = [];
  while (x < 1200) {
    const w = 40 + Math.floor(rand() * 60);
    out.push({ x, w, h: 90 + Math.floor(rand() * 210), lit: Math.floor(rand() * 5) });
    x += w + Math.floor(rand() * 14);
  }
  return out;
})();

export function Layers({ ghost }: { ghost?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const tick = useCallback(() => {
    root.current?.style.setProperty("--py", String(Math.min(window.scrollY, 1200)));
  }, []);
  useEffect(() => {
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let queued = false;
    const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; tick(); }); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tick]);
  return (
    <div ref={root} className="layers" aria-hidden="true">
      <div className="l0" />
      {ghost && <div className="l1 layer"><span className="ghost" data-n={ghost} /></div>}
      <svg className="l2 layer" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" focusable="false">
        {SKYLINE.map((b, i) => (
          <g key={i}>
            <rect className={i % 3 === 0 ? "b-red" : "b-grey"} x={b.x} y={400 - b.h} width={b.w} height={b.h} />
            {Array.from({ length: 6 }, (_, j) => (
              <rect key={j} className={(j + b.lit) % 4 === 0 ? "win-on" : "win-off"} x={b.x + 8 + (j % 3) * 14} y={400 - b.h + 14 + Math.floor(j / 3) * 22} width="8" height="10" />
            ))}
          </g>
        ))}
      </svg>
      <svg className="l3 layer" viewBox="0 0 1200 400" preserveAspectRatio="none" focusable="false">
        <polygon className="road" points="0,400 1200,400 1200,330 0,372" />
        <polygon className="deck" points="0,120 1200,150 1200,170 0,142" />
      </svg>
      <svg className="l4 layer" viewBox="0 0 1200 400" preserveAspectRatio="none" focusable="false">
        <polygon className="glass-a" points="0,0 220,0 120,90 0,60" />
        <polygon className="glass-b" points="1200,0 960,0 1060,110 1200,80" />
        <polygon className="glass-r" points="1200,400 1090,400 1200,310" />
      </svg>
      <div className="l6 layer"><i /><i /><i /></div>
    </div>
  );
}
