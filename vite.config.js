import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/StravaReview/',
  build: {
    target: 'es2020', // Recommended: Ensures compatibility with slightly older iOS versions
    rollupOptions: {
      output: {
        manualChunks: {
          // Group React core libraries into a separate chunk for better caching.
          'react-vendor': ['react', 'react-dom'],
          // Keep framer separated as it is heavy
          framer: ['framer-motion'],
          // Note: lucide-react, clsx, and tailwind-merge are explicitly excluded from manual chunks
          // to allow Vite to tree-shake them naturally, reducing bundle size.
        }
      }
    }
  }
})
