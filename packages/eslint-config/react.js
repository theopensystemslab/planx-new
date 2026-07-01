import pluginQuery from "@tanstack/eslint-plugin-query";
import jestDom from "eslint-plugin-jest-dom";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";

import base from "./base.js";
import vitestConfig from "./vitest.js";

/**
 * Config for the React (editor) app: base + a11y, react-hooks, import sorting,
 * tanstack-query, jest-dom
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
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "no-empty": "warn",
      "no-unsafe-optional-chaining": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
      "@tanstack/query/exhaustive-deps": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "typeLike",
          format: ["PascalCase"],
          custom: { regex: "^[A-Z]", match: true },
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@mui/material",
              message:
                "See https://github.com/theopensystemslab/planx-new/pull/140",
            },
            {
              name: "@mui/icons-material",
              message:
                "See https://github.com/theopensystemslab/planx-new/pull/140",
            },
            {
              name: "@mui/x-data-grid",
              importNames: ["DataGrid"],
              message:
                "Please import DataTable from ui/shared/DataTable instead",
            },
            {
              name: "jest-axe",
              message: "Please import axe-helper instead",
            },
            {
              name: "@testing-library/user-event",
              message:
                "Please import setup() from test/utils to get test user",
            },
            {
              name: "@testing-library/react",
              importNames: ["render"],
              message:
                "Please import setup() from test/utils to render test component",
            },
            {
              name: "@mui/styles",
              importNames: ["styled"],
              message:
                "Please import styled from '@mui/material/styles'. Reason: https://mui.com/system/styled/#what-problems-does-it-solve",
            },
            {
              name: "@mui/material/Switch",
              message:
                "Please import shared Switch component from 'ui/shared/Switch' instead of the MUI Switch component directly",
            },
          ],
          patterns: ["@mui/*/*/*"],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Use import.meta.env instead of process.env in Vite applications",
        },
        {
          selector:
            "JSXAttribute[name.name=/^(color|bgcolor|backgroundColor|borderColor|fill|stroke)$/] Literal[value=/\\./]",
          message:
            "Passing dot-notation colour strings (e.g., color={'text.primary'}) directly to props is no longer supported in MUI v9. Please use the sx prop instead: sx={{ color: 'text.primary' }}.",
        },
      ],
    },
  },
  ...vitestConfig(["expect"]),
  {
    files: ["**/*.stories.tsx"],
    rules: {
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];
