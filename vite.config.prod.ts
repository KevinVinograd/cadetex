import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Production configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // No sourcemaps en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
})

