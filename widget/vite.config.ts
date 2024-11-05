import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local',  // Shadow DOM scoping
    },
    postcss: {
      plugins: [autoprefixer],
    },
  },
  build: {
    cssCodeSplit: false,  // Keep as false for your widget use case
  },
  define: {
    'process.env.NEXT_PUBLIC_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  }
});