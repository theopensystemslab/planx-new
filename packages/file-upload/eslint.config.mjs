import base from "@planx/eslint-config/base";
import globals from "globals";

export default [
  { ignores: ["dist/**"] },
  ...base,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
];
