// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), icon()],
  site: "https://localplanning.services",
  env: {
    schema: {
      PUBLIC_PLANX_EDITOR_URL: envField.string({ context: "client", access: "public", optional: false }),
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
        weights: [400, 500, 600, 700],
        styles: ["normal"],
        subsets: ["latin"],
      },
    ]
  }
});