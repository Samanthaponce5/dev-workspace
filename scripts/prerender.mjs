/*
 * Writes the page's HTML into dist/index.html at build time.
 *
 * `npm run build` runs three steps: the normal client build, a second
 * build of src/entry-server.jsx that Node can run, and this script, which
 * renders the app once and puts the result inside <div id="root">. The
 * browser then shows real content as soon as the HTML and CSS arrive, and
 * React attaches to that markup (hydrates) instead of building it again.
 *
 * The 3D scene is not part of this. It is browser-only and still loads
 * and mounts on the client.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url))
const EMPTY_ROOT = '<div id="root"></div>'

const { render } = await import(fromRoot('dist-ssr/entry-server.js'))
const page = fromRoot('dist/index.html')
const html = await readFile(page, 'utf8')
if (!html.includes(EMPTY_ROOT)) throw new Error(`prerender: could not find ${EMPTY_ROOT} in dist/index.html`)

const markup = render()
await writeFile(page, html.replace(EMPTY_ROOT, () => `<div id="root">${markup}</div>`))
await rm(fromRoot('dist-ssr'), { recursive: true, force: true })

console.log(`prerendered dist/index.html (${(markup.length / 1024).toFixed(1)} kB of markup)`)
