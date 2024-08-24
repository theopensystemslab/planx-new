import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // runs once on initial setup
    globalSetup: ["./tests/setup/global.ts"],
    // runs before each test file
    setupFiles: ["./tests/setup/graphQL.ts"],
    coverage: {
      provider: "istanbul",
      // html reporter required to inspect coverage in Vitest UI dashboard
      reporter: ["lcov", "html", "text-summary"],
      thresholds: {
        functions: 55,
        // TODO: could add autoUpdate flag here so that function coverage is only allowed to increase
      },
    },
  },
  // remove .js from imports, which ts-with-esm requires but causes vitest to fail module resolution
  resolve: {
    alias: [
      {
        find: /^(.*)\.js$/,
        replacement: "$1",
      },
    ],
  },
});
