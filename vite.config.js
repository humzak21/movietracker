import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep original names for font files
          if (assetInfo.name && /\.(ttf|woff|woff2|eot|otf)$/i.test(assetInfo.name)) {
            return 'assets/[name][extname]'
          }
          // Use hash for other assets (images, etc.)
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})