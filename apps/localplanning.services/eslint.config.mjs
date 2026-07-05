import base from "@planx/eslint-config/base";
import react from "@planx/eslint-config/react";

export default [
  { ignores: ["dist/**", ".astro/**", "public/mockServiceWorker.js"] },
  ...base,
  ...react,
];
