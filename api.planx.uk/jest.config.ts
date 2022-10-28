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
  coverageThreshold: {
    global: {
      functions: 45,
    },
  },
  coverageReporters: ["lcov"],
  coverageDirectory: "./coverage",
};
