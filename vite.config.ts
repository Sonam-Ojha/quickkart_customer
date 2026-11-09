import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — cached aggressively; changes rarely
          if (
            id.indexOf('node_modules/react/') !== -1 ||
            id.indexOf('node_modules/react-dom/') !== -1 ||
            id.indexOf('node_modules/react-router-dom/') !== -1 ||
            id.indexOf('node_modules/scheduler/') !== -1
          ) {
            return 'react-vendor'
          }
          // TanStack Query
          if (id.indexOf('@tanstack/') !== -1) {
            return 'tanstack'
          }
          // Leaflet — large map library, only loaded on OrderTrackingPage
          if (id.indexOf('leaflet') !== -1 || id.indexOf('react-leaflet') !== -1) {
            return 'leaflet'
          }
        },
      },
    },
  },
})
