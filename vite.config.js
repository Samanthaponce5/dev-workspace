import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/*
 * Adds preload hints to the built index.html for two things the browser
 * would otherwise only discover late:
 *
 *   - the 3D scene's bundle, which is imported dynamically. Without the
 *     hint it starts downloading only after the main script has arrived
 *     and run; with it, both download side by side.
 *   - the two web font files, which are otherwise requested only once the
 *     stylesheet has been parsed and text needs them.
 */
function preloadCriticalAssets() {
  return {
    name: 'preload-critical-assets',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html
        const files = Object.values(bundle)
        const tags = []

        const scene = files.find((file) => file.type === 'chunk' && file.isDynamicEntry && file.name === 'DeskScene')
        if (scene) tags.push({ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: true, href: `/${scene.fileName}` }, injectTo: 'head' })

        for (const file of files) {
          if (/geist(-mono)?-latin-wght-normal.*\.woff2$/.test(file.fileName)) {
            tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: true, href: `/${file.fileName}` }, injectTo: 'head' })
          }
        }
        return { html, tags }
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadCriticalAssets()],
})
