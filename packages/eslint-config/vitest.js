import vitest from "@vitest/eslint-plugin";

const testGlobs = [
  "**/__tests__/**/*.?(c|m)[jt]s?(x)",
  "**/?(*.)+(spec|test).?(c|m)[jt]s?(x)",
];

/**
 * Vitest rules, scoped to test files only
 */
export default function vitestConfig(assertFunctionNames = ["expect"]) {
  return [
    { files: testGlobs, ...vitest.configs.recommended },
    {
      files: testGlobs,
      rules: {
        "vitest/expect-expect": ["error", { assertFunctionNames }],
      },
    },
  ];
}
