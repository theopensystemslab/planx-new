import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    clearMocks: true,
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/*.visualRegression.test.{ts,tsx}"],
    setupFiles: [
      "./src/test/jsdom.ts",
      "./src/test/mockServer.ts",
      "./src/test/mui.tsx",
    ],
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
  },
  plugins: [tsconfigPaths()],
});