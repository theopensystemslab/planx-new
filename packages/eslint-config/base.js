import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * Shared base config for all TypeScript workspaces
 *
 * `eslint-config-prettier` is spread last so it always wins and disables any
 * stylistic rules that would conflict with Prettier
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-nested-ternary": "error",
      // New in ts-eslint v8 recommended
      // TODO: fix outstanding warnings and promote back to "error"
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  eslintConfigPrettier,
];
