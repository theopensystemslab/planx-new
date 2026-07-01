import playwright from "eslint-plugin-playwright";

/**
 * Playwright rules for the UI-driven E2E tests
 */
export default [
  playwright.configs["flat/recommended"],
  {
    rules: {
      "playwright/expect-expect": [
        "error",
        {
          assertFunctionNames: [
            "expectSections",
            "publishService",
            "turnServiceOnline",
            "makeFlowAService",
          ],
        },
      ],
      "playwright/no-networkidle": "warn",
      // TODO: refactor and promote back to "error"
      "playwright/valid-describe-callback": "warn",
      // Auto-fixable rule kept OFF so pre-commit `--fix` doesn't rewrite tests
      // TODO: enable + fix
      "playwright/prefer-web-first-assertions": "off",
    },
  },
];
