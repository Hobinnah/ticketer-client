import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "https://localhost:7229/",
        changeOrigin: true,
        secure: false, // Set to false for self-signed certificates in development
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
 