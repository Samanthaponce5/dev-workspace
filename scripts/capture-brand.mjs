/*
 * Makes the site's icons and its link-preview image.
 *
 *   - The icons are the navbar's SP logo with its dot: the same drawn
 *     letters (src/components/layout/logoShape.js) and the same dot size
 *     and spacing (Monogram.module.css), in the Dark theme's colours
 *     (src/styles/tokens.css), on the page's dark background. It writes
 *     favicon.svg, favicon.ico (16, 32 and 48 px), apple-touch-icon.png
 *     and the 192 and 512 px icons the web manifest lists.
 *   - The preview image is a screenshot of the real home page, in the Dark
 *     theme, once the intro has finished and the 3D scene is drawn,
 *     scaled down from a sharp 2x capture to 1200 x 630 (og-image.jpg).
 *
 *   1. Build and serve the production site:  npm run build && npm run preview
 *   2. In another terminal:                  npm run brand
 *      (or: node scripts/capture-brand.mjs http://localhost:4173/)
 *
 * Run it again when the logo, the theme colours or the home page change.
 * Needs Node 22+ and Google Chrome. Set CHROME_PATH if Chrome isn't in
 * the default macOS location.
 */
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { LOGO_HEIGHT, LOGO_LETTERS, LOGO_WIDTH, STROKE } from '../src/components/layout/logoShape.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const url = process.argv[2] ?? 'http://localhost:4173/'
const chromePath = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

/* The Dark theme's colours, read from the tokens so the icons follow them. */
const tokens = readFileSync(`${root}src/styles/tokens.css`, 'utf8')
const token = (name) => {
  const match = tokens.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{3,8})`, 'i')) // the first one is the Dark theme's
  if (!match) throw new Error(`No --color-${name} in tokens.css`)
  return match[1]
}
const COLORS = { background: token('bg'), letters: token('text'), dot: token('accent') }

/* The dot's size and its gap from the letters, as in the navbar (all in em there), in the letters' units. */
const monogramCss = readFileSync(`${root}src/components/layout/Monogram.module.css`, 'utf8')
const em = (selector, property) => {
  const block = monogramCss.match(new RegExp(`\\.${selector}\\s*{([^}]*)}`))?.[1] ?? ''
  const value = block.match(new RegExp(`(?:^|;|\\s)${property}:\\s*([\\d.]+)em`))?.[1]
  if (!value) throw new Error(`No ${property} in .${selector} in Monogram.module.css`)
  return Number(value)
}
const unit = LOGO_HEIGHT / em('letters', 'height')
const DOT = em('dot', 'width') * unit
const GAP = em('monogram', 'gap') * unit
const LOGO_FULL_WIDTH = LOGO_WIDTH + GAP + DOT

const round = (value) => Math.round(value * 100) / 100

/*
 * The logo on a square tile. `fill` is the share of the tile's width the
 * logo takes; `radius` rounds the tile's corners (as a share of its side);
 * `glow` adds the navbar dot's soft glow, for the larger icons.
 */
function iconSvg({ fill, radius = 0, glow = false }) {
  const side = LOGO_FULL_WIDTH / fill
  const x = (side - LOGO_FULL_WIDTH) / 2
  const y = (side - LOGO_HEIGHT) / 2
  const dotX = round(x + LOGO_WIDTH + GAP + DOT / 2)
  const dotY = round(y + LOGO_HEIGHT - DOT / 2) // on the letters' baseline, as in the navbar
  const s = round(side)
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">`,
    glow ? `<defs><filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="${round(DOT * 0.28)}"/></filter></defs>` : '',
    `<rect width="${s}" height="${s}" rx="${round(side * radius)}" fill="${COLORS.background}"/>`,
    `<g transform="translate(${round(x)} ${round(y)})" fill="none" stroke="${COLORS.letters}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">`,
    `<path d="${LOGO_LETTERS.s}"/><path d="${LOGO_LETTERS.p}"/>`,
    `</g>`,
    glow ? `<circle cx="${dotX}" cy="${dotY}" r="${round(DOT * 0.62)}" fill="${COLORS.dot}" opacity="0.45" filter="url(#glow)"/>` : '',
    `<circle cx="${dotX}" cy="${dotY}" r="${round(DOT / 2)}" fill="${COLORS.dot}"/>`,
    `</svg>`,
  ].join('')
}

// For browser tabs and bookmarks: the logo as large as a small tile allows, softly rounded.
const TAB_ICON = iconSvg({ fill: 0.86, radius: 0.22 })
// For home screens: full-bleed (the system rounds or masks the corners), the logo within the central safe zone.
const APP_ICON = iconSvg({ fill: 0.62, glow: true })

/* --- Chrome --- */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const port = 9400 + Math.floor(Math.random() * 400)
const chrome = spawn(chromePath, ['--headless=new', '--hide-scrollbars', '--enable-unsafe-swiftshader', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/brand-capture-${port}`, 'about:blank'], { stdio: 'ignore' })

let version
for (let attempt = 0; attempt < 60 && !version; attempt += 1) {
  try {
    version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()
  } catch {
    await sleep(250)
  }
}
if (!version) throw new Error(`Could not start Chrome at ${chromePath}`)

const socket = new WebSocket(version.webSocketDebuggerUrl)
await new Promise((resolve) => (socket.onopen = resolve))
let nextId = 0
const pending = new Map()
socket.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  }
}
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = (nextId += 1)
    pending.set(id, (message) => (message.error ? reject(new Error(`${method}: ${message.error.message}`)) : resolve(message.result)))
    socket.send(JSON.stringify({ id, method, params, sessionId }))
  })

async function openPage({ width, height, scale }) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const page = (method, params) => send(method, params, sessionId)
  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
    return result.value
  }
  await page('Page.enable')
  await page('Runtime.enable')
  // Headless Chrome can open a second tab and leave this one hidden, which stalls animation frames.
  await page('Page.bringToFront')
  await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false })
  return { page, evaluate, close: () => send('Target.closeTarget', { targetId }) }
}

/* --- The icons --- */

const writePublic = (file, data) => {
  writeFileSync(`${root}public/${file}`, data)
  console.log(`public/${file}: ${(data.length / 1024).toFixed(1)} kB`)
}

writePublic('favicon.svg', `${TAB_ICON}\n`)

/* Draws an SVG at a pixel size and returns it as a PNG. */
const rasterizer = await openPage({ width: 600, height: 600, scale: 1 })
async function png(svg, size) {
  await rasterizer.page('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } })
  const data = await rasterizer.evaluate(`(async () => {
    const image = new Image()
    image.src = 'data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}'
    await image.decode()
    const canvas = Object.assign(document.createElement('canvas'), { width: ${size}, height: ${size} })
    const context = canvas.getContext('2d')
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, ${size}, ${size})
    return canvas.toDataURL('image/png').split(',')[1]
  })()`)
  return Buffer.from(data, 'base64')
}

/* An .ico holding PNGs (every current browser reads these). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // icon
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, index) => {
    const entry = 6 + 16 * index
    header.writeUInt8(size >= 256 ? 0 : size, entry)
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    header.writeUInt16LE(1, entry + 4) // colour planes
    header.writeUInt16LE(32, entry + 6) // bits per pixel
    header.writeUInt32LE(data.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map((image) => image.data)])
}

const icoImages = []
for (const size of [16, 32, 48]) icoImages.push({ size, data: await png(TAB_ICON, size) })
writePublic('favicon.ico', ico(icoImages))
writePublic('apple-touch-icon.png', await png(APP_ICON, 180))
writePublic('icon-192.png', await png(APP_ICON, 192))
writePublic('icon-512.png', await png(APP_ICON, 512))
await rasterizer.close()

/* --- The link-preview image --- */

const PREVIEW = { width: 1200, height: 630, scale: 2, quality: 0.88 }

const site = await openPage(PREVIEW)
await site.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] })
// A fresh profile, so no saved display settings: the Dark theme, normal text, full motion.
await site.page('Page.navigate', { url })

// Wait for the intro to hand over to the page and for the scene's first complete frame.
const ready = await site.evaluate(`(async () => {
  const start = Date.now()
  const done = () => document.querySelector('[data-ready]') && !document.documentElement.classList.contains('intro-pending') && !document.querySelector('#intro')
  while (!done()) { if (Date.now() - start > 60000) return false; await new Promise(r => setTimeout(r, 50)) }
  await document.fonts.ready
  return true
})()`)
if (!ready) throw new Error(`The home page never finished loading at ${url}. Is the site being served (npm run build && npm run preview)?`)
await sleep(9000) // the page's rise-in, and the duck's hello has come and gone, so no speech bubble is caught mid-fade
// The floating Display settings button is a control, not part of the view: leave it out of the picture.
await site.evaluate(`document.querySelectorAll('button[aria-haspopup="dialog"]').forEach((button) => (button.style.visibility = 'hidden'))`)
await sleep(100)

const shot = (await site.page('Page.captureScreenshot', { format: 'png' })).data
const jpeg = await site.evaluate(`(async () => {
  const image = new Image()
  image.src = 'data:image/png;base64,${shot}'
  await image.decode()
  const canvas = Object.assign(document.createElement('canvas'), { width: ${PREVIEW.width}, height: ${PREVIEW.height} })
  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, ${PREVIEW.width}, ${PREVIEW.height})
  return canvas.toDataURL('image/jpeg', ${PREVIEW.quality}).split(',')[1]
})()`)
writePublic('og-image.jpg', Buffer.from(jpeg, 'base64'))
await site.close()

socket.close()
chrome.kill()
