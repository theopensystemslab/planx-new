import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      APP_ENVIRONMENT: "test",
    },
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
        statements: 77.59,
        branches: 60.41,
        functions: 78.07,
        lines: 77.83,
        autoUpdate: true,
      },
    },
    exclude: [...configDefaults.exclude, "dist/**"],
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