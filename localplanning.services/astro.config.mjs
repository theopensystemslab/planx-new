import { defineConfig, envField, fontProviders } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import icon from "astro-icon";

// Check args to access Astro mode
// Env var is not available in Astro config files
const mode = process.argv.at(-1).replaceAll("-", "")
const isCloudfrontBuild = ["staging", "production"].includes(mode);

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon()],
  env: {
    schema: {
      PUBLIC_PLANX_EDITOR_URL: envField.string({ context: "client", access: "public", optional: false }),
      PUBLIC_PLANX_BUILD_TIME_GRAPHQL_API_URL: envField.string({ context: "client", access: "public", optional: false }),
      PUBLIC_PLANX_GRAPHQL_API_URL: envField.string({ context: "client", access: "public", optional: false }),
      PUBLIC_PLANX_REST_API_URL: envField.string({ context: "client", access: "public", optional: false }),
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
  build: {
    // AWS Cloudfront requires /about.html not /about/index.html
    format: isCloudfrontBuild 
      ? "file"
      : "directory"
  }
});