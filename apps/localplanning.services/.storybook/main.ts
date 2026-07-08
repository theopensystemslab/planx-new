import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "msw-storybook-addon"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite");

    config.plugins = [...(config.plugins ?? []), tailwindcss()];

    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        // Mock Astro's virtual modules
        "astro:env/client": path.resolve(__dirname, "./mocks/astro-env.ts"),
        "astro:transitions/client": path.resolve(
          __dirname,
          "./mocks/astro-transitions.ts",
        ),
        // Resolve path aliases to match tsconfig.json
        "@components": path.resolve(__dirname, "../src/components"),
        "@lib": path.resolve(__dirname, "../src/lib"),
        "@stores": path.resolve(__dirname, "../src/stores"),
        "@styles": path.resolve(__dirname, "../src/styles"),
        "@layouts": path.resolve(__dirname, "../src/layouts"),
        "@content": path.resolve(__dirname, "../src/content"),
      },
    };

    return config;
  },
};

export default config;
