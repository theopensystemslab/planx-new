import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  // we don't use a preset, preferring to give an explicit manual config
  testEnvironment: "node",
  transform: {
    // esbuild-jest is unmaintained and can't handle TypeScript with ESM, so we stick to ts-jest
    // TODO: if tests are slow, consider swapping out for @swc/jest
    "^.+\\.[jt]s$": [
      "ts-jest",
      {
        useESM: true,
        target: "esnext",
        // we need a separate moduleResolutuion for tests (jest v30 may fix this)
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  testPathIgnorePatterns: ["dist/*"],
  setupFilesAfterEnv: ["./jest.setup.js"],
  // handle .ts files first, as ESM modules, and remove .js from imports for jest
  moduleFileExtensions: ["ts", "js", "json"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  // set up coverage collection
  collectCoverage: true,
  coverageThreshold: {
    global: {
      functions: 55,
    },
  },
  coverageReporters: ["lcov", "text-summary"],
  coverageDirectory: "./coverage",
};

export default config;
