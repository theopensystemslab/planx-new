export default {
  transform: {
    "^.+\\.js$": [
      "esbuild-jest",
      {
        sourcemap: true,
      },
    ],
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist/*"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      functions: 45,
    },
  },
  coverageReporters: ["lcov", "text-summary"],
  coverageDirectory: "./coverage",
};
