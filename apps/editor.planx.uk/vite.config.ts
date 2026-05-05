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
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    outDir: "build",
    emptyOutDir: true,
  },
  define: {
    "process.env.HASURA_GRAPHQL_URL": `"${process.env.HASURA_GRAPHQL_URL}"`,
  },
});
