import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
    retry: 1,
    // Interaction-heavy jsdom tests are wall-clock sensitive and can vary wildly by machine
    // due to e.g. cores, processes, etc. So we are deliberately generous with timeouts.
    testTimeout: 35_000,
    hookTimeout: 35_000,
    setupFiles: [
      "./src/test/jsdom.ts",
      "./src/test/mockServer.ts",
      "./src/test/mui.tsx",
      "./src/test/testingLibrary.ts",
    ],
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
  },
  plugins: [tsconfigPaths()],
});
