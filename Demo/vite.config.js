import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/demo/',
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
        flow_script: resolve(__dirname, 'chat/flow_script.html'),
        headformers: resolve(__dirname, 'chat/headformers.html'),
        hja_net: resolve(__dirname, 'chat/hja_net.html'),
        oto_dev: resolve(__dirname, 'chat/oto_dev.html'),
        rginsolvency: resolve(__dirname, 'chat/rginsolvency.html'),
        wecreate: resolve(__dirname, 'chat/wecreate.html')
      },
      output: {
        dir: 'dist',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  }
})