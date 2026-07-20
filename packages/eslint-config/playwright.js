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
            "expectSessionResumedAtRetryPayment",
            "publishService",
            "turnServiceOnline",
            "makeFlowAService",
          ],
        },
      ],
      "playwright/no-networkidle": "warn",
    },
  },
];
