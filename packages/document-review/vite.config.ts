import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'modules',
    lib: {
      entry: resolve(__dirname, 'src/DocumentReview.tsx'),
      name: 'DocumentReview',
      fileName: 'document-review'
    },
  }
});
