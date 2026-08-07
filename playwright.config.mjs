import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "release-browser.spec.mjs",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173/my-portfolio/",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/static-server.mjs",
    url: "http://127.0.0.1:4173/my-portfolio/",
    reuseExistingServer: false,
  },
});
