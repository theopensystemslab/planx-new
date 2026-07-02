import base from "@planx/eslint-config/base";
import vitestConfig from "@planx/eslint-config/vitest";
import globals from "globals";

// Vitest globals are available everywhere (incl. plain-JS test helpers), as in
// the previous config. TS files get these from the type-checker anyway.
const testGlobals = {
  vi: "readonly",
  vitest: "readonly",
  suite: "readonly",
  describe: "readonly",
  test: "readonly",
  it: "readonly",
  expect: "readonly",
  beforeAll: "readonly",
  beforeEach: "readonly",
  afterAll: "readonly",
  afterEach: "readonly",
};

export default [
  { ignores: ["dist/**"] },
  ...base,
  {
    languageOptions: {
      globals: { ...globals.node, ...testGlobals },
    },
  },
  // Allow Supertest's chained `.expect()` to satisfy expect-expect
  ...vitestConfig([
    "expect",
    "get.expect",
    "post.expect",
    "supertest.**.expect",
  ]),
];
