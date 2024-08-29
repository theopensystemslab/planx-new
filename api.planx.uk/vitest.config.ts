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
        statements: 72.03,
        branches: 54.92,
        functions: 67.62,
        lines: 71.84,
        autoUpdate: true,
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
