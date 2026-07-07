import base from "@planx/eslint-config/base";
import vitestConfig from "@planx/eslint-config/vitest";
import globals from "globals";

export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
    },
  },
  ...vitestConfig(["expect", "assert.strictEqual"]),
];
