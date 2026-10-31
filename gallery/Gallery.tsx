import { useState } from "react";
import {
  AppFooter, AppHeader, Band, Button, Card, Command, DataTable, EmptyState, Field, GhostNumber, Headline, Lead,
  Layers, Modal, Plate, Progress, SkipLink, StatusSeal, Toast, Toggle, WakeNotice, useBackgroundMode,
} from "../src";

const rows = [
  { id: "p05", name: "SupportOps Platform", features: 17 },
  { id: "p06", name: "SupportOps Console", features: 4 },
];

export function Gallery({ theme = "breu" }: { theme?: "breu" | "papel" }) {
  const [pressed, setPressed] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(true);
  const mode = useBackgroundMode();
  return (
    <div data-theme={theme} className="page">
      <Layers ghost="01" />
      <SkipLink>Skip to content</SkipLink>
      <AppHeader brand="Colagem UI" navLabel="Sections" nav={<><a href="#cards">Cards</a><a href="#forms">Forms</a></>}>
        <Toggle pressed={pressed} onChange={setPressed}>motion: {pressed ? "off" : "on"}</Toggle>
      </AppHeader>
      <main id="main" className="wrap" tabIndex={-1}>
        <Plate text="Colagem Urbana" label="Design system" />
        <Headline>One focus per screen</Headline>
        <Lead>Everything behind the card points at it. Background mode: {mode}.</Lead>
        <Command verb="gallery open" object="all" n={1} />
        <Band words={["breu", "papel", "vermelho"]} />
        <h2 id="cards">Cards</h2>
        <Card index={0} numeral="01" label="Item 1: rest card" seal={<StatusSeal kind="partial" label="partial" />} title="Resting card" summary="Same information order as the focus card, dimmer." meta="2026-10-31" tag="rest" command={<Command verb="open" object="item" n={1} />} />
        <Card variant="focus" index={1} numeral="02" label="Item 2: focus card" seal={<StatusSeal kind="full" label="verified" active />} title="Focus card" summary="Paper surface, hard red shadow, no cut-out letters." meta="2026-10-31" tag="focus" />
        <h2 id="forms">Forms</h2>
        <Field label="Subject" hint="Short and specific" />
        <Field label="Amount" error="Enter a number" defaultValue="x" />
        <Field label="Description" multiline />
        <Button>Primary</Button> <Button variant="secondary">Secondary</Button> <Button variant="danger">Reject</Button>{" "}
        <Button disabled disabledReason="You cannot approve your own refund">Approve</Button>
        <h2>Data</h2>
        <DataTable caption="Projects" rowKey={(r) => r.id} rows={rows} columns={[
          { key: "name", label: "Project", render: (r) => r.name },
          { key: "n", label: "Features", numeric: true, render: (r) => r.features },
        ]} />
        <h2>Feedback</h2>
        <Progress value={40} label="Upload" />
        <WakeNotice service="P05" elapsed={7} expected={20} onRetry={() => undefined} labels={{ waking: (s, e, x) => `Waking ${s}: ${e}s of about ${x}s`, failed: (s) => `${s} did not answer`, retry: "Retry" }} />
        <EmptyState text="Nothing here yet" action={<Button onClick={() => setOpen(true)}>Open dialog</Button>} />
        <GhostNumber n="07" />
        <Modal title="Confirm" open={open} onClose={() => setOpen(false)} closeLabel="Close"><p>Dialog body.</p></Modal>
        {toast && <Toast kind="ok" onClose={() => setToast(false)} closeLabel="Dismiss" duration={0}>Saved</Toast>}
      </main>
      <AppFooter credits="Fonts: Anton, Courier Prime, Playfair Display, Special Elite (OFL).">
        <p>Keys: <kbd>j</kbd> next <kbd>k</kbd> previous</p>
      </AppFooter>
    </div>
  );
}
