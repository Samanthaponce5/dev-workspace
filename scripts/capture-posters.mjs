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
  const stemRow = Math.round(H * 0.88)
  let x = gapRight + 1
  while (x < W && !inked(x, stemRow)) x += 1
  const pLeft = x
  while (x < W && inked(x, stemRow)) x += 1
  const stemRight = x

  return {
    letters: { src: canvas.toDataURL('image/png'), width: W, height: H, gapLeft, gapRight, pLeft, stemRight },
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
 * The intro's letters as an SVG.
 *
 * Five rounded pieces swirl in and join: the S's upper curve, spine and
 * lower curve, and the P's stem and bowl. Each piece is a stroke drawn
 * along the letter's centre line at the letter's own thickness, with
 * round ends, so every exposed end is smooth. (The centre lines below
 * were traced from the Geist letters at the size this script draws them,
 * 159 × 95; they are scaled if that size changes.)
 *
 * Each piece travels its own cubic Bézier curve into place, turning a
 * little and straightening as it arrives, with smooth acceleration and a
 * gentle stop. Its motion is sampled into a keyframe list here, so the
 * whole assembly is one CSS timeline. Short teal trails follow three of
 * the pieces and fade before the letters meet.
 *
 * The finished logo is the real one: once the pieces are home, the exact
 * letters (the picture of them, as an alpha mask filled with the text
 * colour) fade in over them in a very short crossfade, and the pieces,
 * still solid underneath so the letters never look see-through, go.
 */

const TRACED = { width: 159, height: 95 }

/*
 * name, the centre line (in traced units), its thickness, the point it
 * turns about, and how it arrives: where it starts (from: as letters'
 * heights from home), which way it swirls (1 clockwise, -1 the other way),
 * how far it is turned at the start (degrees) and when it sets off.
 */
const PIECES = [
  { name: 's-upper', d: 'M63 24C63 13.5 52.5 9 37 9C20.5 9 12.5 15 12.5 24C12.5 31.5 15.5 36 21 39', width: 20, pivot: [34, 22], from: [-0.3, -0.36], swirl: 1, turn: -16, delay: 0, trail: true },
  { name: 'p-bowl', d: 'M97 10H122.5C139 10 148 18.5 148 32C148 45.5 139 53.5 122.5 53.5H97', width: 19.5, pivot: [128, 32], from: [0.42, -0.3], swirl: -1, turn: 14, delay: 65, trail: true },
  { name: 's-spine', d: 'M21 39C31 44.5 44 48.5 56.5 53.5', width: 19.5, pivot: [39, 46], from: [-0.46, 0.08], swirl: -1, turn: 12, delay: 130 },
  { name: 's-lower', d: 'M56.5 53.5C62.5 56.5 65 61.5 65 68.5C65 78.5 54.5 85 38.5 85C22.5 85 12.5 80 12 72', width: 20, pivot: [44, 72], from: [0.26, 0.4], swirl: 1, turn: -16, delay: 195, trail: true },
  { name: 'p-stem', d: 'M96.5 12V81', width: 22, pivot: [96.5, 46], from: [-0.06, 0.5], swirl: -1, turn: 10, delay: 260 },
]
const TRAVEL_MS = 700
const HANDOFF_MS = 960 // every piece is home by now (the last sets off at 260 ms)
const CROSSFADE_MS = 70 // the exact letters fade in over the pieces...
const PIECES_OUT_MS = 50 // ...which then go, unseen beneath them
const SAMPLES = 24

/* The easing of each journey: smooth acceleration, then a long gentle stop (cubic-bezier(0.5, 0.05, 0.3, 1)). */
function ease(t) {
  const [x1, y1, x2, y2] = [0.5, 0.05, 0.3, 1]
  const coord = (a, b, s) => 3 * a * s * (1 - s) ** 2 + 3 * b * s ** 2 * (1 - s) + s ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2
    if (coord(x1, x2, mid) < t) lo = mid
    else hi = mid
  }
  return coord(y1, y2, (lo + hi) / 2)
}

function lettersSvg({ src, width: W, height: H, gapLeft, gapRight }) {
  const f = (value) => Math.round(value * 100) / 100
  const split = (gapLeft + gapRight + 1) / 2
  const sx = W / TRACED.width
  const sy = H / TRACED.height
  const scaleD = (d) => d.replace(/([MLHVC])([^MLHVC]*)/g, (_, command, args) => {
    const numbers = args.trim().split(/[\s,]+/).filter(Boolean).map(Number)
    const scaled = numbers.map((value, i) => (command === 'H' ? value * sx : command === 'V' ? value * sy : i % 2 === 0 ? value * sx : value * sy))
    return command + scaled.map(f).join(' ')
  })

  const styles = []
  const trails = []
  const pieces = PIECES.map(({ name, d, width, pivot: [px0, py0], from: [fx, fy], swirl, turn, delay, trail }) => {
    const [px, py] = [px0 * sx, py0 * sy]
    // The journey, measured from home: a cubic Bézier from the start, swinging round, to (0, 0).
    const start = [fx * H, fy * H]
    const across = [-start[1] * swirl, start[0] * swirl] // at right angles to the way in: the swirl
    const c1 = [start[0] * 0.9 + across[0] * 0.55, start[1] * 0.9 + across[1] * 0.55]
    const c2 = [start[0] * 0.12 + across[0] * 0.18, start[1] * 0.12 + across[1] * 0.18]
    const at = (s) => [0, 1].map((k) => (1 - s) ** 3 * start[k] + 3 * (1 - s) ** 2 * s * c1[k] + 3 * (1 - s) * s ** 2 * c2[k])

    const frames = Array.from({ length: SAMPLES + 1 }, (_, i) => {
      const progress = ease(i / SAMPLES)
      const [x, y] = at(progress)
      const angle = turn * (1 - progress) ** 2 // turning less and less as it nears home
      return `${f((i / SAMPLES) * 100)}%{transform:translate(${f(x)}px,${f(y)}px) rotate(${f(angle)}deg)}`
    })
    styles.push(`@keyframes intro-path-${name}{${frames.join('')}}`)

    if (trail) {
      const trailFrames = Array.from({ length: SAMPLES + 1 }, (_, i) => {
        const progress = ease(i / SAMPLES)
        const fade = Math.max(0, 1 - progress / 0.7)
        return `${f((i / SAMPLES) * 100)}%{stroke-dashoffset:${f(0.24 - progress)};opacity:${f(Math.min(1, progress * 8) * fade)}}`
      })
      styles.push(`@keyframes intro-trail-${name}{${trailFrames.join('')}}`)
      const abs = (point) => `${f(px + point[0])} ${f(py + point[1])}`
      trails.push(
        `<path class="intro-swirl-trail" pathLength="1" d="M${abs(start)}C${abs(c1)} ${abs(c2)} ${abs([0, 0])}" style="animation:intro-trail-${name} ${TRAVEL_MS}ms linear ${delay}ms both"/>`,
      )
    }

    return `<g class="intro-piece" style="transform-origin:${f(px)}px ${f(py)}px;animation:intro-path-${name} ${TRAVEL_MS}ms linear ${delay}ms both,intro-appear 160ms ease-out ${delay}ms both,intro-fade-out ${PIECES_OUT_MS}ms linear ${HANDOFF_MS + CROSSFADE_MS}ms forwards"><path d="${scaleD(d)}" stroke-width="${f(width * sy)}"/></g>`
  }).join('')

  const letterBox = { s: [[-2, -2], [split, -2], [split, H + 2], [-2, H + 2]], p: [[split, -2], [W + 2, -2], [W + 2, H + 2], [split, H + 2]] }
  const polygon = (points) => `<polygon points="${points.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}"/>`
  const clips = ['s', 'p'].map((letter) => `<clipPath id="intro-cut-${letter}">${polygon(letterBox[letter])}</clipPath>`).join('')
  const letters = `width="${W}" height="${H}" fill="currentColor" mask="url(#intro-sp)"`
  const wholes = ['s', 'p'].map((letter) => `<rect class="intro-whole" style="animation:intro-fade-in ${CROSSFADE_MS}ms linear ${HANDOFF_MS}ms both" ${letters} clip-path="url(#intro-cut-${letter})"/>`).join('')

  return `<svg class="intro-letters" data-intro-letters viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${styles.join('')}</style><defs><mask id="intro-sp" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:alpha"><image href="${src}" width="${W}" height="${H}"/></mask>${clips}</defs>${trails.join('')}${pieces}${wholes}</svg>`
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
