import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  // ts-jest presets are deprecated, so we prefer to give an explicit manual config
  testEnvironment: "node",
  transform: {
    // esbuild-jest transformer is unmaintained and can't handle ts-with-esm, so we stick to ts-jest
    // TODO: if tests are too slow, consider swapping out for @swc/jest
    "^.+\\.[jt]s$": [
      "ts-jest",
      {
        useESM: true,
        // we need a separate module/moduleResolution config for tests (jest v30 may fix this)
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  // mime v4 (which moves to pure ESM) may still have commonJS traces, so we transform it
  transformIgnorePatterns: ["node_modules\\/.pnpm\\/(?!(mime))"],
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
