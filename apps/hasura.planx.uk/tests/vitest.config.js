import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config({ path: './../.env.test' });

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    deps: {
      inline: ['dotenv']
    }
  }
});