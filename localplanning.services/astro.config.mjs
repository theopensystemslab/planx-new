// @ts-check
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  site: "https://localplanning.services",
  env: {
    schema: {
      PUBLIC_PLANX_EDITOR_URL: envField.string({ context: "client", access: "public", optional: false }),
      PUBLIC_PLANX_GRAPHQL_API_URL: envField.string({ context: "client", access: "public", optional: false }),
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
