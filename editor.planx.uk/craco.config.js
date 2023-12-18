const CracoEsbuildPlugin = require("craco-esbuild");

module.exports = {
  plugins: [
    {
      plugin: CracoEsbuildPlugin,
      options: {
        esbuildLoaderOptions: {
          loader: "tsx",
          sourcemap: true,
        },
      },
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
        },
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
  },
};
