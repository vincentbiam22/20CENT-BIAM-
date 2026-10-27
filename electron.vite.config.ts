import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

/**
 * En développement uniquement, Vite injecte un script inline (React Fast Refresh).
 * On assouplit donc `script-src` pour le serveur de dev. Le build de production
 * garde la CSP stricte définie dans src/renderer/index.html.
 */
function devCsp(): Plugin {
  return {
    name: '20code-dev-csp',
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      handler: (html: string): string =>
        html.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react(), devCsp()]
  }
})
