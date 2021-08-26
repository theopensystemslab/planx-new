const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: async (config) => {
    config.resolve.plugins.push(new TsconfigPathsPlugin({}));
    return config;
  },
  babel: async (options) => ({
    ...options,
    plugins: [
      ...options.plugins,
      "@babel/plugin-proposal-logical-assignment-operators",
    ],
  }),
};
