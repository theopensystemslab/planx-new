import react from "@planx/eslint-config/react";

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
      // TODO: Turn on and auto-fix 700+ imports
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];
