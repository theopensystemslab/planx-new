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
            threshold: 0,
            allowedMismatchedPixelRatio: 0,
          },
          timeout: 2_000
        },
      },
    },
    include: ["**/*.visualRegression.test.{ts,tsx}"],
  },
});