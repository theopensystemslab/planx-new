import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tsconfigPaths(),
    nodePolyfills({
      include: ["events"],
    }),
  ],
  server: {
    port: 3000,
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
  },
  optimizeDeps: {
    // Lazily imported, so not discovered by Vite's initial dependency scan
    // Prevents "Failed to fetch dynamically imported module" on first load in dev
    include: ["react-notion-x"],
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    outDir: "build",
    emptyOutDir: true,
    sourcemap: "hidden",
  },
  define: {
    "process.env.HASURA_GRAPHQL_URL": `"${process.env.HASURA_GRAPHQL_URL}"`,
  },
});
