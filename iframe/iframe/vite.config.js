export default defineConfig({
    server: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Permissions-Policy': 'microphone=self, camera=self'  // Note: changed from () to self
      }
    }
  })