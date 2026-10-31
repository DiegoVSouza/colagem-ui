import "../src/fonts.css";
import "../src/plate-fonts.css";
import "../src/tokens.css";
import "../src/style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Gallery } from "./Gallery";

const theme = new URLSearchParams(window.location.search).get("theme") === "papel" ? "papel" : "breu";
document.documentElement.dataset.theme = theme;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Gallery theme={theme} />
  </StrictMode>,
);
