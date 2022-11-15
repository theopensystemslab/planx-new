export default {
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    "^.+\\.js$": [
      "esbuild-jest",
      {
        sourcemap: true,
      },
    ],
  },
  testPathIgnorePatterns: ["dist/*"],
  moduleNameMapper: {
    // resolution override for linked module
    "document-review": "<rootDir>/../DocumentReview",
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      functions: 60,
    },
  },
  coverageReporters: ["lcov", "text-summary"],
  coverageDirectory: "./coverage",
};
