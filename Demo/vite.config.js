import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    host: true,
    cors: true,
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        page1: '/pages/page1.html',
        page2: '/pages/page2.html',
        page3: '/pages/page3.html',
      },
      output: {
        dir: 'dist',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  },
  base: '/demo',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  }
})