import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    headers: {
      'Permissions-Policy': 'microphone=self, camera=self',
      'Access-Control-Allow-Origin': '*'
    }
  }
})