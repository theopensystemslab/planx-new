export default {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-links"
  ],
  staticDirs: ["../public"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {},
  typescript: {
    reactDocgen: "react-docgen-typescript"
  }
};
