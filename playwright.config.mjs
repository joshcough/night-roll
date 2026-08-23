// Playwright e2e — the gesture layer the vm harness can't see (real pointer
// events, real canvas). webkit ≈ iPad Safari, Josh's main device.
// Run: npm run test:e2e   (serves the repo root itself)
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  fullyParallel: true,
  workers: 2, // uncapped = cpu/2 browser processes; they starved specs into
              // 30s timeouts and pinned Josh's machine (2026-08-23)
  retries: 1, // canvas timing on webkit can be flaky-once
  webServer: {
    command: "python3 -m http.server 8735",
    port: 8735,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:8735",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"],
      launchOptions: { args: [
        "--autoplay-policy=no-user-gesture-required",
        // headless has no audio device: without this, the first AudioContext
        // stalls ~20s inside a pointerdown and wrecks every gesture test
        "--disable-audio-output",
      ] } } },
    { name: "webkit", use: { ...devices["iPad Pro 11 landscape"] } },
  ],
});
