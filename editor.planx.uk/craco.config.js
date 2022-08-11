const CracoEsbuildPlugin = require("craco-esbuild");

module.exports = {
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
    },
  ],
  typescript: {
    enableTypeChecking: !Boolean(process.env.DISABLE_TYPE_CHECKING),
  },
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: false,
          stream: require.resolve("stream-browserify"),
          // TODO: Remove this when upgrading to React 18
          // https://github.com/facebook/react/issues/20235#issuecomment-750911623
          "react/jsx-runtime": "react/jsx-runtime.js",
          "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
        },
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
