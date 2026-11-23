/*
 * Captures the images that are generated from the live site:
 *
 *   - the still images ("posters") of the desk scene, which the hero
 *     shows when the 3D scene is slow to load or WebGL isn't available;
 *   - the intro's embedded pictures and proportions (the SP letters,
 *     cut into the pieces that assemble, the tiny duck, and how the
 *     navbar logo's dot sits beside its letters), written into
 *     index.html so the intro matches what it lands on.
 *
 *   1. Start the dev server:  npm run dev
 *   2. In another terminal:   npm run posters
 *      (or: node scripts/capture-posters.mjs http://localhost:5173)
 *
 * Run it again whenever the scene, the duck or the navbar logo changes
 * (furniture, characters, colours, lighting, camera, logo font or size),
 * so the stills keep matching the live page.
 *
 * It opens the site in headless Chrome at a desktop and a phone size,
 * waits for the scene's first complete frame, stops the animation clock so
 * everything is in its resting pose, hides everything except the canvas,
 * and saves the scene with a transparent background. It also records how
 * large the scene was drawn and where the stage's centre fell inside the
 * picture; ScenePoster.jsx uses those numbers to line the picture up with
 * the live scene at any screen size.
 *
 * Needs Node 22+ and Google Chrome. Set CHROME_PATH if Chrome isn't in
 * the default macOS location.
 */
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const url = process.argv[2] ?? 'http://localhost:5173/'
const chromePath = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const VARIANTS = [
  { name: 'desktop', width: 1440, height: 900, scale: 1.5, mobile: false },
  // On a phone the platform runs off the sides and bottom of the screen,
  // but the poster needs the whole of it so it can do the same at any
  // size. So this capture is wider than a phone and narrows the stage,
  // which draws the scene smaller with room to spare all round.
  { name: 'mobile', width: 640, height: 900, scale: 2, mobile: true, stageCss: 'margin-left: 19% !important; margin-right: 19% !important; margin-bottom: 15% !important;' },
]
const WEBP_QUALITY = 0.84

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const port = 9400 + Math.floor(Math.random() * 400)
const chrome = spawn(chromePath, ['--headless=new', '--hide-scrollbars', '--enable-unsafe-swiftshader', `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/poster-capture-${port}`, 'about:blank'], { stdio: 'ignore' })

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

/* Runs in the page. Lets us stop the clock the scene's animations read. */
const FREEZABLE_CLOCK = `(() => { const real = performance.now.bind(performance); let fixed = null; performance.now = () => (fixed === null ? real() : fixed); window.__freezeClock = () => { fixed = real() } })()`

/* Runs in the page. Measures the stage and asks the site's own fitting maths how large the scene is drawn. */
const MEASURE = `(async () => {
  const { fitScene } = await import('/src/components/three/camera/fitMath.js')
  const { VIEWS } = await import('/src/components/three/camera/views.js')
  const stage = document.querySelector('[data-hero-stage]').getBoundingClientRect()
  const view = matchMedia('(max-width: 63.99rem)').matches ? VIEWS.mobile : VIEWS.desktop
  return { pixelsPerUnit: fitScene(view, stage.width, stage.height).pixelsPerUnit, centreX: stage.left + stage.width / 2, centreY: stage.top + stage.height / 2 }
})()`

/* Runs in the page. Leaves only the scene's canvas showing, on a transparent page. */
const ISOLATE_CANVAS = `(() => {
  // The duck is hidden while the intro is pending; the stills need it on its shelf.
  window.__scene.scene.getObjectByName('rubber-duck').visible = true
  document.documentElement.style.background = 'transparent'
  document.body.style.background = 'transparent'
  document.body.style.visibility = 'hidden'
  document.querySelector('[data-hero] canvas').style.visibility = 'visible'
})()`

/* Runs in the page. Trims the screenshot to the scene and re-encodes it as WebP. */
const trimAndEncode = (png, quality) => `(async () => {
  const image = new Image()
  image.src = 'data:image/png;base64,${png}'
  await image.decode()
  const canvas = Object.assign(document.createElement('canvas'), { width: image.width, height: image.height })
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  const { data } = context.getImageData(0, 0, image.width, image.height)
  let left = image.width, top = image.height, right = 0, bottom = 0
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (data[(y * image.width + x) * 4 + 3] > 6) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }
  const box = { x: Math.max(0, left - 2), y: Math.max(0, top - 2) }
  box.width = Math.min(image.width, right + 3) - box.x
  box.height = Math.min(image.height, bottom + 3) - box.y
  const trimmed = Object.assign(document.createElement('canvas'), { width: box.width, height: box.height })
  trimmed.getContext('2d').drawImage(canvas, -box.x, -box.y)
  return { box, webp: trimmed.toDataURL('image/webp', ${quality}).split(',')[1] }
})()`

/* Opens the site at a given size and waits for the scene's first complete frame, with the clock stopped. */
async function openSite({ width, height, scale, mobile, stageCss }) {
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
  await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile })
  await page('Page.addScriptToEvaluateOnNewDocument', { source: FREEZABLE_CLOCK })
  if (stageCss) {
    await page('Page.addScriptToEvaluateOnNewDocument', {
      source: `document.addEventListener('DOMContentLoaded', () => document.head.append(Object.assign(document.createElement('style'), { textContent: '[data-hero-stage] { ${stageCss} }' })))`,
    })
  }
  await page('Page.navigate', { url })

  // Wait for the live scene's first complete frame, then stop the clock at once.
  const ready = await evaluate(`(async () => { const start = Date.now(); while (!document.querySelector('[data-ready]')) { if (Date.now() - start > 60000) return false; await new Promise(r => setTimeout(r, 30)) } window.__freezeClock(); return true })()`)
  if (!ready) throw new Error(`The scene never became ready at ${url}. Is the dev server running?`)
  if (!(await evaluate('Boolean(window.__scene)'))) throw new Error('This needs the dev server (npm run dev), not a production build.')
  await sleep(1600) // let it draw its resting pose

  const screenshot = async (clip) => {
    await page('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } })
    await sleep(400)
    return (await page('Page.captureScreenshot', { format: 'png', ...(clip ? { clip } : {}) })).data
  }
  return { evaluate, screenshot, close: () => send('Target.closeTarget', { targetId }) }
}

// 1. The posters.
const metadata = {}
for (const variant of VARIANTS) {
  const site = await openSite(variant)
  const measured = await site.evaluate(MEASURE)
  await site.evaluate(ISOLATE_CANVAS)
  const { box, webp } = await site.evaluate(trimAndEncode(await site.screenshot(), WEBP_QUALITY))

  const file = `scene-${variant.name}.webp`
  writeFileSync(`${root}public/${file}`, Buffer.from(webp, 'base64'))

  // Sizes are stored in CSS pixels at the capture size.
  const width = box.width / variant.scale
  const height = box.height / variant.scale
  metadata[variant.name] = {
    src: `/${file}`,
    width: Math.round(width * 100) / 100,
    height: Math.round(height * 100) / 100,
    pixelsPerUnit: Math.round(measured.pixelsPerUnit * 1000) / 1000,
    anchorX: Math.round(((measured.centreX - box.x / variant.scale) / width) * 10000) / 10000,
    anchorY: Math.round(((measured.centreY - box.y / variant.scale) / height) * 10000) / 10000,
  }
  console.log(`${file}: ${box.width}x${box.height}px, ${(Buffer.from(webp, 'base64').length / 1024).toFixed(0)} kB`)
  await site.close()
}
writeFileSync(`${root}src/sections/Hero/scenePoster.json`, `${JSON.stringify(metadata, null, 2)}\n`)
console.log('Wrote src/sections/Hero/scenePoster.json')

// 2. The intro's pictures and proportions, embedded in index.html.
const INTRO_SCALE = 5 // the duck is tiny on screen, so capture it enlarged

/* Runs in the page. Draws the navbar logo's letters to a picture and measures how the dot sits beside them. */
const MEASURE_LOGO = `(async () => {
  const span = document.querySelector('[data-site-logo-letters]')
  const dot = document.querySelector('[data-site-logo-dot]').getBoundingClientRect()
  const style = getComputedStyle(span)
  const fontSize = parseFloat(style.fontSize)
  const spacing = (parseFloat(style.letterSpacing) || 0) / fontSize
  const font = (size) => style.fontStyle + ' ' + style.fontWeight + ' ' + size + 'px ' + style.fontFamily
  await document.fonts.load(font(fontSize), span.textContent)

  // Where the letters' ink is on the page (see inkRect in src/intro/reveal.js).
  let context = document.createElement('canvas').getContext('2d')
  context.font = font(fontSize)
  context.letterSpacing = style.letterSpacing
  let m = context.measureText(span.textContent)
  const box = span.getBoundingClientRect()
  const baseline = box.top + (box.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent
  const ink = { left: box.left - m.actualBoundingBoxLeft, top: baseline - m.actualBoundingBoxAscent, width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent }

  // The same letters, drawn large and trimmed to their ink.
  const SIZE = 128
  const canvas = document.createElement('canvas')
  context = canvas.getContext('2d')
  context.font = font(SIZE)
  context.letterSpacing = spacing * SIZE + 'px'
  m = context.measureText(span.textContent)
  canvas.width = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight)
  canvas.height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)
  context = canvas.getContext('2d')
  context.font = font(SIZE)
  context.letterSpacing = spacing * SIZE + 'px'
  context.fillStyle = style.color
  context.fillText(span.textContent, m.actualBoundingBoxLeft, m.actualBoundingBoxAscent)

  // Where to cut the letters into pieces: the gap between S and P, and the right edge of the P's stem.
  const { width: W, height: H } = canvas
  const alpha = context.getImageData(0, 0, W, H).data
  const inked = (x, y) => alpha[(y * W + x) * 4 + 3] > 24
  const columnInk = (x) => { let sum = 0; for (let y = 0; y < H; y += 1) sum += inked(x, y) ? 1 : 0; return sum }
  let gapLeft = Math.round(W * 0.5), gapRight = gapLeft, least = Infinity
  for (let x = Math.round(W * 0.3); x < Math.round(W * 0.7); x += 1) {
    const ink = columnInk(x)
    if (ink < least) { least = ink; gapLeft = gapRight = x } else if (ink === least && x === gapRight + 1) gapRight = x
  }
  // The S is cut once across the middle of its spine, at right angles to it, with the cut running out
  // level through the letter's two counters, so each half is a clean hook and no curve is clipped.
  const split = Math.round((gapLeft + gapRight + 1) / 2)
  let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0
  for (let y = Math.round(H * 0.44); y < Math.round(H * 0.6); y += 1) {
    for (let x = 0; x < split; x += 1) {
      if (!inked(x, y)) continue
      n += 1; sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y
    }
  }
  const cx = sx / n, cy = sy / n
  const angle = 0.5 * Math.atan2(2 * (sxy / n - cx * cy), sxx / n - cx * cx - (syy / n - cy * cy)) // the spine's direction
  let across = { x: -Math.sin(angle), y: Math.cos(angle) } // at right angles to it, pointing down
  if (across.y < 0) across = { x: -across.x, y: -across.y }
  const clearRow = (y, from, to) => { for (let x = Math.max(0, Math.floor(from)); x <= Math.min(split - 1, Math.ceil(to)); x += 1) if (inked(x, Math.round(y))) return false; return true }
  let sCut = null
  for (let reach = 4; reach < H * 0.4 && !sCut; reach += 0.5) {
    const upper = [cx - across.x * reach, cy - across.y * reach] // where the cut leaves the spine's top edge
    const lower = [cx + across.x * reach, cy + across.y * reach] // ...and its bottom edge
    const upperRight = upper[0] > lower[0] // which counter each side opens into
    const upperClear = upperRight ? clearRow(upper[1], upper[0], split) : clearRow(upper[1], 0, upper[0])
    const lowerClear = upperRight ? clearRow(lower[1], 0, lower[0]) : clearRow(lower[1], lower[0], split)
    if (upperClear && lowerClear) sCut = { upper, lower, upperRight }
  }

  const stemRow = Math.round(H * 0.88)
  let x = gapRight + 1
  while (x < W && !inked(x, stemRow)) x += 1
  const pLeft = x
  while (x < W && inked(x, stemRow)) x += 1
  const stemRight = x

  return {
    letters: { src: canvas.toDataURL('image/png'), width: W, height: H, gapLeft, gapRight, pLeft, stemRight, sCut },
    // All relative to the height of the letters.
    dotRatio: dot.width / ink.height,
    gapRatio: (dot.left - (ink.left + ink.width)) / ink.height,
    dropRatio: (ink.top + ink.height - dot.bottom) / ink.height,
  }
})()`

/* Runs in the page. Hides everything in the scene except the duck, and reports where it is. */
const ISOLATE_DUCK = `(() => {
  const { scene, getDuckRect } = window.__scene
  const duck = scene.getObjectByName('rubber-duck')
  duck.visible = true
  scene.traverse((object) => { if (object.isMesh || object.isSprite) object.visible = false })
  duck.traverse((object) => { if (object.isMesh && !object.userData.tapTarget) object.visible = true })
  return getDuckRect()
})()`

const round = (value) => Math.round(value * 10000) / 10000

/*
 * The intro's letters as an SVG. The picture of the letters is an alpha
 * mask, filled with the text colour, so it suits every theme. Clip paths
 * cut it into four clean pieces: the S once across its spine, the P into
 * its stem and its bowl. Each piece carries where it starts from (dx, dy,
 * r: a short way off, turned a little) and when it moves (delay): the S
 * first, the P close behind. The clips overlap a little, and each letter
 * is replaced by its whole self once its pieces are home, so no join shows.
 */

function lettersSvg({ src, width: W, height: H, gapLeft, gapRight, stemRight, sCut }) {
  const f = (value) => Math.round(value * 100) / 100
  const split = (gapLeft + gapRight + 1) / 2
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
  // The S's two halves: above and below its cut (see MEASURE_LOGO), or a level cut if none was found.
  const sHalves = (shift) => {
    if (!sCut) return [rect(-1, -1, split + 1, H / 2 + 1 + shift), rect(-1, H / 2 - shift, split + 1, H / 2 + 1 + shift)]
    const { upper, lower, upperRight } = sCut
    const up = [upper[0], upper[1] + shift]
    const down = [lower[0], lower[1] + shift]
    const top = upperRight ? [[-1, -1], [split, -1], [split, up[1]], up, down, [-1, down[1]]] : [[-1, -1], [split, -1], [split, down[1]], down, up, [-1, up[1]]]
    const upB = [upper[0], upper[1] - shift]
    const downB = [lower[0], lower[1] - shift]
    const bottom = upperRight ? [[-1, downB[1]], downB, upB, [split, upB[1]], [split, H + 1], [-1, H + 1]] : [[-1, upB[1]], upB, downB, [split, downB[1]], [split, H + 1], [-1, H + 1]]
    return [top, bottom]
  }
  const OVERLAP = 1.5 // px each piece reaches past its cut, so pieces a hair from home still look joined
  const [sTop, sBottom] = sHalves(OVERLAP)
  const pieces = [
    { name: 's-top', letter: 's', shape: sTop, from: [-0.08, -0.16, -8], delay: 0 },
    { name: 's-bottom', letter: 's', shape: sBottom, from: [-0.1, 0.16, 7], delay: 40 },
    { name: 'p-stem', letter: 'p', shape: rect(split - 0.5, -1, stemRight - split + 0.5 + OVERLAP, H + 2), from: [0.03, 0.2, -5], delay: 110 },
    { name: 'p-bowl', letter: 'p', shape: rect(stemRight - OVERLAP, -1, W - stemRight + 1 + OVERLAP, H + 2), from: [0.12, -0.14, 10], delay: 150 },
  ]
  // Each letter is swapped for its whole self the moment its last piece is home (see .intro-piece in index.html).
  const ASSEMBLE_MS = 440
  const START_MS = 30
  const homeAt = (letter) => START_MS + ASSEMBLE_MS + Math.max(...pieces.filter((piece) => piece.letter === letter).map((piece) => piece.delay))
  const letterBox = { s: rect(-1, -1, split + 1, H + 2), p: rect(split, -1, W - split + 1, H + 2) }
  const centre = (shape) => shape.reduce(([x, y], [px, py]) => [x + px / shape.length, y + py / shape.length], [0, 0])
  const polygon = (shape) => `<polygon points="${shape.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}"/>`
  const clips = [...pieces.map(({ name, shape }) => `<clipPath id="intro-cut-${name}">${polygon(shape)}</clipPath>`), ...['s', 'p'].map((letter) => `<clipPath id="intro-cut-${letter}">${polygon(letterBox[letter])}</clipPath>`)].join('')
  const letters = `width="${W}" height="${H}" fill="currentColor" mask="url(#intro-sp)"`
  const groups = pieces
    .map(({ name, letter, shape, from: [dx, dy, r], delay }) => {
      const [ox, oy] = centre(shape)
      return `<g class="intro-piece" style="--delay:${delay}ms;--home:${homeAt(letter)}ms;--dx:${f(dx * H)}px;--dy:${f(dy * H)}px;--r:${r}deg;--ox:${f(ox)}px;--oy:${f(oy)}px"><rect ${letters} clip-path="url(#intro-cut-${name})"/></g>`
    })
    .join('')
  const wholes = ['s', 'p'].map((letter) => `<rect class="intro-whole" style="--home:${homeAt(letter)}ms" ${letters} clip-path="url(#intro-cut-${letter})"/>`).join('')
  return `<svg class="intro-letters" data-intro-letters viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><mask id="intro-sp" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:alpha"><image href="${src}" width="${W}" height="${H}"/></mask>${clips}</defs>${groups}${wholes}</svg>`
}

{
  const site = await openSite({ width: 1440, height: 900, scale: INTRO_SCALE, mobile: false })
  const logo = await site.evaluate(MEASURE_LOGO)
  const rect = await site.evaluate(ISOLATE_DUCK)
  await site.evaluate(ISOLATE_CANVAS)
  const clip = { x: rect.left - 6, y: rect.top - 6, width: rect.width + 12, height: rect.height + 12, scale: 1 }
  const { box, webp } = await site.evaluate(trimAndEncode(await site.screenshot(clip), 0.92))
  await site.close()

  const htmlPath = `${root}index.html`
  const html = readFileSync(htmlPath, 'utf8')
    .replace(/<!-- intro-letters -->.*?<!-- \/intro-letters -->/s, () => `<!-- intro-letters -->${lettersSvg(logo.letters)}<!-- /intro-letters -->`)
    .replace(/(<img class="intro-duck" data-intro-duck )src="[^"]*" width="\d+" height="\d+"/, `$1src="data:image/webp;base64,${webp}" width="${box.width}" height="${box.height}"`)
    .replace(/\/\* intro-geometry \*\/.*?\/\* \/intro-geometry \*\//, `/* intro-geometry */ --dot-ratio: ${round(logo.dotRatio)}; --gap-ratio: ${round(logo.gapRatio)}; --drop-ratio: ${round(logo.dropRatio)}; /* /intro-geometry */`)
  writeFileSync(htmlPath, html)
  console.log(`index.html: letters ${logo.letters.width}x${logo.letters.height}px, duck ${box.width}x${box.height}px (${(Buffer.from(webp, 'base64').length / 1024).toFixed(1)} kB), dot ${round(logo.dotRatio)} / gap ${round(logo.gapRatio)} / drop ${round(logo.dropRatio)}`)
}

socket.close()
chrome.kill()
