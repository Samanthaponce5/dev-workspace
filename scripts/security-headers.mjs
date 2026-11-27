/*
 * Adds the Content-Security-Policy to dist/_headers (Cloudflare Pages),
 * after the build. It allows only:
 *
 *   - the site's own files, and its few inline scripts by their exact
 *     SHA-256 fingerprint (worked out here from the built pages, so editing
 *     one can never silently break the site);
 *   - Google Analytics (Google's documented domains for GA4), and
 *     Cloudflare Web Analytics, in case it is switched on;
 *   - inline styles (the page sets CSS variables in style attributes) and
 *     data: images (the intro's duck).
 *
 * It also stops the site being framed by other sites (clickjacking).
 * Run by `npm run build`, after prerendering.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = (file) => fileURLToPath(new URL(`../dist/${file}`, import.meta.url))
const PAGES = ['index.html', 'privacy.html']

const hashes = new Set()
for (const page of PAGES) {
  const html = readFileSync(dist(page), 'utf8')
  for (const [, body] of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`)
  }
}

const policy = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')} https://*.googletagmanager.com https://static.cloudflareinsights.com`,
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://cloudflareinsights.com",
  "img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

// Into the existing /* rule (the last one in the file): Cloudflare keeps only one of two identical rules.
const headers = readFileSync(dist('_headers'), 'utf8')
if (!/\n\/\*\n(?: {2}.*\n?)+$/.test(headers)) throw new Error('security-headers: dist/_headers must end with the /* rule')
writeFileSync(dist('_headers'), `${headers.trimEnd()}\n  Content-Security-Policy: ${policy}\n`)
console.log(`security headers: CSP with ${hashes.size} inline script fingerprints (${policy.length} characters)`)
