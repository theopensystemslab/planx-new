const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/preset-create-react-app"],
  webpackFinal: async config => {
    config.resolve.plugins ||= [];
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    config.resolve.alias["react-navi"] = require.resolve("./__mocks__/react-navi.js");
    return config;
  },
  babel: async options => ({
    ...options,
    plugins: [...options.plugins, "@babel/plugin-proposal-logical-assignment-operators"],
    presets: [
      [
        "@babel/preset-env",
        {
          "targets": {
            "chrome": 100
          }
        }
      ],
      "@babel/preset-typescript",
      "@babel/preset-react"
    ]
  }),
  staticDirs: ["../public"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },
  docs: {
    autodocs: true
  }
};