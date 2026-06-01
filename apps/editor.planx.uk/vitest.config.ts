import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          clearMocks: true,
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
      },
      {
        extends: "./vite.config.ts",
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        optimizeDeps: {
          include: [
            "vite-plugin-node-polyfills/shims/buffer",
            "vite-plugin-node-polyfills/shims/global",
            "vite-plugin-node-polyfills/shims/process",
          ],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
