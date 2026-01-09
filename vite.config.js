import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/StravaReview/', // Use leading and trailing slashes
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and generic vendors
          vendor: ['react', 'react-dom', 'lucide-react', 'clsx', 'tailwind-merge'],
          // Isolate the heavy animation library so it's only loaded when needed
          framer: ['framer-motion'],
          // Isolate date-fns if it gets large
          utils: ['date-fns']
        }
      }
    }
  }
})
