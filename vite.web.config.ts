import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  base: './',
  plugins: [react(), {
    name: '20code-web-dev-csp',
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      handler: html => html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'; connect-src 'self' ws: http:")
    }
  }],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
})
