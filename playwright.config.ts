import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  outputDir: "test-results",
  webServer: {
    command: "npm run gallery:build && npm run gallery:preview",
    url: "http://localhost:44174",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: { baseURL: "http://localhost:44174", channel: "chrome", trace: "off" },
});
