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
};
