import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  define: {
    'process.env.NEXT_PUBLIC_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});
