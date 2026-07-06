import pluginQuery from "@tanstack/eslint-plugin-query";
import jestDom from "eslint-plugin-jest-dom";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";

import base from "./base.js";
import vitestConfig from "./vitest.js";

export const noProcessEnv = {
  selector: "MemberExpression[object.name='process'][property.name='env']",
  message: "Use import.meta.env instead of process.env in client-side code",
};

/**
 * Config for React apps
 *
 * `eslint-plugin-testing-library` is intentionally not enabled here
 * TODO: Enable and fix in a follow up
 */
export default [
  ...base,
  jsxA11y.flatConfigs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  jestDom.configs["flat/recommended"],
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@tanstack/query/exhaustive-deps": "warn",
      "no-restricted-syntax": ["error", noProcessEnv],
    },
  },
  ...vitestConfig(["expect"]),
];
