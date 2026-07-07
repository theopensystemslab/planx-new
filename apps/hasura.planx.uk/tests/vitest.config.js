import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({ path: "./../.env.test" });

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.js"],
    deps: {
      inline: ["dotenv"],
    },
    fileParallelism: false,
  },
});
