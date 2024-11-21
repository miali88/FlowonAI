import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    port: 5173,
    open: true, // open browser automatically
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'src/pages/index.html',
        clientA: 'src/pages/clientA/index.html',
        clientB: 'src/pages/clientB/index.html',
      }
    }
  },
  base: '/clients'
})