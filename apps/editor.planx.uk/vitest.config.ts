import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [
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
