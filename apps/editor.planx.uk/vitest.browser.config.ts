import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env': '{}',
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright() as any,
      headless: true,
      instances: [{ browser: "chromium" }],
      expect: {
        toMatchScreenshot: {
          comparatorName: 'pixelmatch',
          comparatorOptions: {
            // 0-1, how different can colors be?
            threshold: 0.2,
            // 1% of pixels can differ
            allowedMismatchedPixelRatio: 0.01,
          },
          timeout: 2_000
        },
      },
    },
    include: ["**/*.visualRegression.test.{ts,tsx}"],
  },
});