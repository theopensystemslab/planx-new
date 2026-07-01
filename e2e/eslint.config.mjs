import base from "@planx/eslint-config/base";
import playwright from "@planx/eslint-config/playwright";
import globals from "globals";

export default [
  { ignores: ["dist/**", "pnpm-lock.yaml"] },
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Playwright rules apply only to the UI-driven tests
  ...playwright.map((config) => ({
    ...config,
    files: ["tests/ui-driven/**/*.{js,ts}"],
  })),
];
