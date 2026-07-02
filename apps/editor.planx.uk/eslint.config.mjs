import react, { noProcessEnv } from "@planx/eslint-config/react";

export default [
  {
    ignores: [
      "**/routeTree.gen.ts",
      "dist/**",
      "build/**",
      "storybook-static/**",
    ],
  },
  ...react,
  {
    rules: {
      // Relaxations of the recommended defaults
      // TODO: Tighten these up to match rest of the monorepo
      "no-empty": "warn",
      "no-unsafe-optional-chaining": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
      "@typescript-eslint/ban-ts-comment": "off",
      // TODO: Turn on and auto-fix 700+ imports
      "@typescript-eslint/consistent-type-imports": "off",
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
        noProcessEnv,
        {
          selector:
            "JSXAttribute[name.name=/^(color|bgcolor|backgroundColor|borderColor|fill|stroke)$/] Literal[value=/\\./]",
          message:
            "Passing dot-notation colour strings (e.g., color={'text.primary'}) directly to props is no longer supported in MUI v9. Please use the sx prop instead: sx={{ color: 'text.primary' }}.",
        },
      ],
    },
  },
  {
    files: ["**/*.stories.tsx"],
    rules: {
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];
