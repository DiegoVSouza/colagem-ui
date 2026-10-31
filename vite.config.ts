import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: { index: "src/index.ts", layout: "src/layout.ts" }, formats: ["es"], fileName: (_format, name) => `${name}.js`, cssFileName: "style" },
    rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime", /^elkjs/] },
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
    setupFiles: ["src/test/setup.ts"],
    restoreMocks: true,
  },
});
