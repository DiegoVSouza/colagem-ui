import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "gallery",
  plugins: [react()],
  build: { outDir: "../dist-gallery", emptyOutDir: true, sourcemap: false },
});
