import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";

export default defineConfig([
  globalIgnores(["dist/**/*"]),
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      tslint,
      vitest,
    },

    languageOptions: {
      globals: {
        require: "readonly",
        process: "readonly",
        __dirname: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        Buffer: "readonly",
        Headers: "readonly",
        URLSearchParams: "readonly",
        exports: "readonly",
        fetch: "readonly",
        vi: "readonly",
        test: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
      },

      parser: tsParser,
    },

    rules: {
      "tslint/no-explicit-any": "warn",
      "no-unused-vars": "off", // disable base rule in favour of TS version
      "tslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "tslint/no-non-null-assertion": "off",
      "tslint/consistent-type-imports": "error",
      "no-nested-ternary": "error",
      ...vitest.configs.recommended.rules,
      "vitest/expect-expect": [
        "error",
        {
          assertFunctionNames: [
            "expect",
            // Allow Supertest expect() calls
            "get.expect",
            "post.expect",
            "supertest.**.expect",
          ],
        },
      ],
    },
  },
]);
