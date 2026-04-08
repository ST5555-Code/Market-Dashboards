import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
        ma: resolve(__dirname, 'ma/index.html'),
        energy: resolve(__dirname, 'energy/index.html'),
        cleantech: resolve(__dirname, 'cleantech/index.html'),
        media: resolve(__dirname, 'media/index.html'),
        hormuz: resolve(__dirname, 'hormuz/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
})
