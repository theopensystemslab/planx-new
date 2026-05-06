import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    pool: "threads",
    setupFiles: [
      "./src/test/jsdom.ts",
      "./src/test/mockServer.ts",
      "./src/test/mui.tsx",
    ],
  },
  plugins: [tsconfigPaths()],
});
