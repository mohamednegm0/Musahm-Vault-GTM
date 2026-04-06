import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist/VaultUI',
    sourcemap: false,
    minify: 'terser'
  }
})
