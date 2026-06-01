export default {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-links"
    "@storybook/experimental-addon-test"
  ],
  staticDirs: ["../public"],
  framework: {
    name: "@storybook/tanstack-react",
    options: {}
  },
  docs: {},
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      exclude: ["**/*.stories.tsx", ".storybook/**"]
    }
  }
};
