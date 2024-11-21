import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        wecreate: 'src/pages/wecreate/index.html',
      }
    }
  },
  base: '/clients'
})