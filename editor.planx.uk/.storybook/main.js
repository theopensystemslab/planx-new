const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  webpackFinal: async (config) => {
    config.resolve.plugins ||= [];
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    config.resolve.alias["react-navi"] = require.resolve(
      "./__mocks__/react-navi.js"
    );
    return config;
  },
  babel: async (options) => ({
    ...options,
    plugins: [
      ...options.plugins,
      "@babel/plugin-proposal-logical-assignment-operators",
    ],
  }),
  core: {
    builder: "webpack5",
  },
  staticDirs: ["../public"],
};
