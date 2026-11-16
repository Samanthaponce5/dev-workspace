import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { scene } from './src/content/content.js'

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
        // Low priority: it should download alongside the main script, but never ahead of it.
        if (scene) tags.push({ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: true, fetchpriority: 'low', href: `/${scene.fileName}` }, injectTo: 'head' })

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

/*
 * Adds the link-preview image tags (and, when the site's address is
 * known, the canonical URL). Preview crawlers want absolute URLs, so the
 * address comes from the environment: SITE_URL if set, otherwise the
 * production domain Vercel provides at build time. Without either, the
 * image path is left relative, which is fine for local builds.
 */
function socialMeta() {
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const siteUrl = (process.env.SITE_URL ?? (domain ? `https://${domain}` : '')).replace(/\/$/, '')
  const image = `${siteUrl}/og-image.jpg`
  const meta = (key, name, content) => ({ tag: 'meta', attrs: { [key]: name, content }, injectTo: 'head' })

  return {
    name: 'social-meta',
    transformIndexHtml() {
      const tags = [
        meta('property', 'og:image', image),
        meta('property', 'og:image:width', '1200'),
        meta('property', 'og:image:height', '630'),
        meta('property', 'og:image:alt', scene.description),
        meta('name', 'twitter:image', image),
      ]
      if (siteUrl) {
        tags.push(meta('property', 'og:url', `${siteUrl}/`))
        tags.push({ tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' })
      }
      return tags
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadCriticalAssets(), socialMeta()],
})
