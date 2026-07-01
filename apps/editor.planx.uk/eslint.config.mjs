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
];
