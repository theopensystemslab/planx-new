import { defineConfig, envField, fontProviders } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import icon from "astro-icon";

const { PUBLIC_LPS_URL, MODE } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon()],
  site: PUBLIC_LPS_URL,
  env: {
    schema: {
      PUBLIC_PLANX_EDITOR_URL: envField.string({ context: "client", access: "public", optional: false }),
      PUBLIC_PLANX_GRAPHQL_API_URL: envField.string({ context: "client", access: "public", optional: false }),
      PUBLIC_PLANX_REST_API_URL: envField.string({ context: "client", access: "public", optional: false }),
      PUBLIC_LPS_URL: envField.string({ context: "client", access: "public", optional: false }),
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  experimental: {
    fonts: [
      {
        name: "Inter",
        cssVariable: "--font-inter",
        provider: fontProviders.google(),
        fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
        weights: ["100 900"],
        styles: ["normal"],
        subsets: ["latin"],
      },
    ]
  },
  ...(MODE === "production" && {
    // This generates directory.html instead of directory/index.html
    // Required for AWS Cloudfront
    build: {
      format: "file"
    }
  })
});