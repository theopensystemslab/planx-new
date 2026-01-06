import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(), 
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
