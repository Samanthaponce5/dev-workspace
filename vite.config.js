import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { site } from './src/content/content.js'

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
 * known, og:url and the canonical URL) to the built page, so preview
 * crawlers, which don't run JavaScript, find them in the HTML itself.
 * They want absolute URLs, so the address comes from the environment:
 * SITE_URL if set (on Cloudflare Pages it must be: set it in the
 * project's settings), otherwise the production domain Vercel provides at
 * build time (the custom domain, once there is one). Without either, the
 * image path is left relative, which is fine for local builds only.
 *
 * The image is a screenshot of the home page (scripts/capture-brand.mjs).
 */
function socialMeta() {
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const siteUrl = (process.env.SITE_URL ?? (domain ? `https://${domain}` : '')).replace(/\/$/, '')
  // Cloudflare Pages doesn't provide the site's address: it has to be set as SITE_URL in the project's settings.
  if (process.env.CF_PAGES && !siteUrl) console.warn('\n  SITE_URL is not set: link previews will have no image. Add it in Cloudflare Pages > Settings > Variables.\n')
  const image = `${siteUrl}/og-image.jpg`
  const alt = `The home page of ${site.name}’s portfolio: the heading “Sam” beside a tiny 3D desk scene at night.`
  const meta = (key, name, content) => ({ tag: 'meta', attrs: { [key]: name, content }, injectTo: 'head' })

  return {
    name: 'social-meta',
    transformIndexHtml() {
      const tags = [
        meta('property', 'og:image', image),
        meta('property', 'og:image:type', 'image/jpeg'),
        meta('property', 'og:image:width', '1200'),
        meta('property', 'og:image:height', '630'),
        meta('property', 'og:image:alt', alt),
        meta('name', 'twitter:image', image),
        meta('name', 'twitter:image:alt', alt),
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
