module.exports = {
  transform: {
    "^.+\\.js$": [
      "esbuild-jest",
      {
        sourcemap: true,
      },
    ],
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  testEnvironment: "node",
};
