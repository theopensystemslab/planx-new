import base from "@planx/eslint-config/base";
import react from "@planx/eslint-config/react";
import globals from "globals";

export default [
  { ignores: ["dist/**", ".astro/**", "public/mockServiceWorker.js"] },
  ...base,
  ...react,
  {
    // Node-context files which run outside the browser
    files: ["*.config.{mjs,ts}", ".storybook/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
