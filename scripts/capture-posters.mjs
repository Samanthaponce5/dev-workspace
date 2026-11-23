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
 * Five pieces of the real letters come together: the S's top arc, middle
 * sweep and bottom arc, and the P's bowl (the loop, with the top of the
 * stem) and the short foot of its stem. Each piece is cut from the exact
 * logo (the picture of the letters, used as an alpha mask and filled with
 * the text colour), so its outer edges are the font's own and the
 * assembled word is the real logo, pixel for pixel. Where two pieces meet,
 * each ends in a smooth round cap as wide as the stroke; the caps overlap,
 * and since both show the same pixels of the same letter, the overlap is
 * invisible once they are home.
 *
 * (The P used to be cut into its whole stem and its bowl, which left a
 * long bare bar floating on its own. It is now cut across the stem just
 * below the bowl, so both pieces read as parts of a P.)
 *
 * The S's cut points were traced from the Geist letters at the size this
 * script draws them (159 × 95) and are scaled if that size changes; the
 * P's are measured from the letters themselves.
 *
 * Motion: one movement for every piece. At first the word is shown a
 * little larger and turned back round its centre, already in its pieces;
 * then it winds forward, every piece gliding in along the same spiral
 * (a curve round the word's centre, closing in) and turning gently; once
 * they are square, each slides straight along its stroke into its
 * neighbour and eases to a stop: the S home first, the P just after.
 * Each piece's journey is sampled into its own keyframes, so the assembly
 * is one CSS timeline in viewBox units, the same at every size. Faint teal trails follow three
 * pieces and fade well before they land. As each letter's last piece
 * arrives, the whole letter takes over in a single frame (identical, so
 * nothing visibly changes), and the word gives one tiny, soft settle.
 */

const TRACED = { width: 159, height: 95 }

/*
 * Where the S is cut (traced units): straight across its stroke at the two
 * places it runs straight up and down, the left side of the upper curve
 * and the right side of the lower one. So its pieces are the top arc, the
 * middle sweep and the bottom arc, and each join slides straight together.
 * Each cut runs from the outside edge across the stroke at `y`, then round
 * through the counter (`via`) to clear the other parts of the letter.
 */
const S_CUTS = {
  upper: { joint: [12.5, 29], y: 29, via: [32, 32.5] }, // the left side of the upper curve; the top arc keeps its end (the terminal, down to y 31)
  lower: { joint: [64, 65], y: 65, via: [42, 58] }, // the right side of the lower curve; the bottom arc keeps its end (the terminal, up from y 61)
}
const S_JOINT_RADIUS = 11.8 // a touch over half the S's stroke there (23), so a cap spans it, soft edges and all
const P_STEM_CUT = 0.695 // where the P's stem is cut, as a share of the letters' height: just below the bowl

/*
 * The pieces: the point each turns about (traced units), how far it also
 * starts from its neighbour along the stroke they share (traced units, so
 * no two pieces touch at first, and the last of the way in is a straight
 * slide down the stroke: the ends meet cleanly, never askew), when it sets
 * off and when it is home (ms), and whether a trail follows it. The S's
 * pieces land first; the P's take a little longer, so they are still
 * closing in as the S joins up.
 */
const PIECES = [
  { name: 's-upper', pivot: [36, 15], apart: [0, -24], delay: 0, home: 820, trail: true }, // up, off the middle sweep
  { name: 's-spine', pivot: [38, 46], apart: [0, 0], delay: 20, home: 800 },
  { name: 's-lower', pivot: [40, 79], apart: [0, 24], delay: 40, home: 840, trail: true }, // down, off the middle sweep
  { name: 'p-bowl', pivot: [122, 31], apart: [0, -7], delay: 30, home: 930, trail: true },
  { name: 'p-stem', pivot: [97, 80], apart: [0, 21], delay: 60, home: 950 }, // down the stem, away from the bowl
]
const SETTLED = 0.62 // the share of each journey by which the swirl and turn are done...
const SLIDE = 0.3 // ...and the share before the straight slide begins, so the ends only meet once the pieces are square
const WIND = 34 // how far back round the word's centre the pieces start (degrees)
const SPREAD = 1.28 // how much further out from the centre they start
const LEAN = 0.4 // how much of the wind each piece also turns on its own
const APPEAR_MS = 200
const SAMPLES = 32

/* A cubic-bezier() easing, solved for x. */
function bezierEasing(x1, y1, x2, y2) {
  const coord = (a, b, s) => 3 * a * s * (1 - s) ** 2 + 3 * b * s ** 2 * (1 - s) + s ** 3
  return (t) => {
    let lo = 0
    let hi = 1
    for (let i = 0; i < 40; i += 1) {
      const mid = (lo + hi) / 2
      if (coord(x1, x2, mid) < t) lo = mid
      else hi = mid
    }
    return coord(y1, y2, (lo + hi) / 2)
  }
}
const glide = bezierEasing(0.55, 0.05, 0.35, 1) // almost still as the pieces appear, a smooth glide, then a long gentle stop
const swirl = bezierEasing(0.5, 0.05, 0.3, 1)

/* A smooth path through points (Catmull-Rom, written as cubic Béziers). */
function smoothPath(points, f) {
  let d = `M${f(points[0][0])} ${f(points[0][1])}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const [p0, p1, p2, p3] = [points[i - 1] ?? points[i], points[i], points[i + 1], points[i + 2] ?? points[i + 1]]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

function lettersSvg({ src, width: W, height: H, gapLeft, gapRight, pLeft, stemRight }) {
  const f = (value) => Math.round(value * 100) / 100
  const split = (gapLeft + gapRight + 1) / 2
  const sx = W / TRACED.width
  const sy = H / TRACED.height
  const at = ([x, y]) => [x * sx, y * sy]

  // Each piece's region: a polygon (its share of the letter, bounded by cuts that run through the
  // counters or straight across a stroke), plus a round cap at each joint it has.
  const j1 = at(S_CUTS.upper.joint)
  const j2 = at(S_CUTS.lower.joint)
  const top = -2
  const bottom = H + 2
  const right = W + 2
  const sCap = S_JOINT_RADIUS * sy
  const [upperY, lowerY] = [S_CUTS.upper.y * sy, S_CUTS.lower.y * sy]
  const [upperVia, lowerVia] = [at(S_CUTS.upper.via), at(S_CUTS.lower.via)]
  const stemJoint = [(pLeft + stemRight) / 2, P_STEM_CUT * H]
  const stemCap = (stemRight - pLeft) / 2 + 0.3 // just wider than the stem, soft edges included
  const regions = {
    's-upper': { polygon: [[-2, top], [split, top], [split, upperVia[1]], upperVia, [upperVia[0], upperY], [-2, upperY]], caps: [j1], radius: sCap },
    's-spine': { polygon: [[-2, upperY], [upperVia[0], upperY], upperVia, [split, upperVia[1]], [split, lowerY], [lowerVia[0], lowerY], lowerVia, [-2, lowerVia[1]]], caps: [j1, j2], radius: sCap },
    's-lower': { polygon: [[-2, lowerVia[1]], lowerVia, [lowerVia[0], lowerY], [split, lowerY], [split, bottom], [-2, bottom]], caps: [j2], radius: sCap },
    'p-bowl': { polygon: [[split, top], [right, top], [right, stemJoint[1]], [split, stemJoint[1]]], caps: [stemJoint], radius: stemCap },
    'p-stem': { polygon: [[split, stemJoint[1]], [right, stemJoint[1]], [right, bottom], [split, bottom]], caps: [stemJoint], radius: stemCap },
    // The whole letters, for the hand-over.
    s: { polygon: [[-2, top], [split, top], [split, bottom], [-2, bottom]], caps: [] },
    p: { polygon: [[split, top], [right, top], [right, bottom], [split, bottom]], caps: [] },
  }
  const clips = Object.entries(regions)
    .map(([name, { polygon, caps, radius }]) => {
      const shape = `<polygon points="${polygon.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}"/>`
      const discs = caps.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(radius)}"/>`).join('')
      return `<clipPath id="intro-cut-${name}">${shape}${discs}</clipPath>`
    })
    .join('')

  const letters = `width="${W}" height="${H}" fill="currentColor" mask="url(#intro-sp)"`
  const centre = [W / 2, H / 2]
  const letterOf = (name) => name[0]
  const homeOf = (letter) => Math.max(...PIECES.filter((piece) => letterOf(piece.name) === letter).map((piece) => piece.home))
  const styles = []
  const trails = []

  const pieces = PIECES.map(({ name, pivot, apart, delay, home, trail }) => {
    const [px, py] = at(pivot)
    const travel = home - delay
    // Where the pivot is: wound back round the word's centre and spread out (easing to nothing by
    // w = 1), and slid apart along its stroke (easing to nothing by a = 1).
    const place = (w, a) => {
      const angle = (-WIND * (1 - w) * Math.PI) / 180
      const scale = 1 + (SPREAD - 1) * (1 - w)
      const [dx, dy] = [px - centre[0], py - centre[1]]
      const wound = [centre[0] + scale * (dx * Math.cos(angle) - dy * Math.sin(angle)) - px, centre[1] + scale * (dx * Math.sin(angle) + dy * Math.cos(angle)) - py]
      return [wound[0] + apart[0] * sx * (1 - a), wound[1] + apart[1] * sy * (1 - a)]
    }
    const frames = []
    const trailFrames = []
    const route = []
    for (let i = 0; i <= SAMPLES; i += 1) {
      const t = i / SAMPLES
      const e = glide(Math.max(0, (t - SLIDE) / (1 - SLIDE)))
      const w = swirl(Math.min(1, t / SETTLED))
      const [x, y] = place(w, e)
      const key = `${f(t * 100)}%`
      frames.push(`${key}{transform:translate(${f(x)}px,${f(y)}px) rotate(${f(-WIND * LEAN * (1 - w))}deg)}`)
      route.push([px + x, py + y])
    }
    // The trail's bright end keeps pace with the piece (by distance along its route); it is faint, and
    // gone by the time the piece is most of the way home.
    const lengths = route.map((point, i) => (i === 0 ? 0 : Math.hypot(point[0] - route[i - 1][0], point[1] - route[i - 1][1])))
    const total = lengths.reduce((sum, length) => sum + length, 0)
    let travelled = 0
    route.forEach((_, i) => {
      travelled += lengths[i]
      const along = travelled / total
      const fade = Math.min(1, along / 0.1) * Math.max(0, 1 - along / 0.7)
      trailFrames.push(`${f((i / SAMPLES) * 100)}%{stroke-dashoffset:${f(0.34 - along)};opacity:${f(fade)}}`)
    })
    styles.push(`@keyframes intro-path-${name}{${frames.join('')}}`)
    if (trail) {
      styles.push(`@keyframes intro-trail-${name}{${trailFrames.join('')}}`)
      trails.push(`<path class="intro-swirl-trail" pathLength="1" d="${smoothPath(route.filter((_, i) => i % 2 === 0 || i === SAMPLES), f)}" style="animation:intro-trail-${name} ${travel}ms linear ${delay}ms both"/>`)
    }
    const handOver = homeOf(letterOf(name))
    return `<g class="intro-piece" style="transform-origin:${f(px)}px ${f(py)}px;animation:intro-path-${name} ${travel}ms linear ${delay}ms both,intro-appear ${APPEAR_MS}ms ease-out both,intro-hand-over 1ms linear ${handOver}ms forwards"><rect ${letters} clip-path="url(#intro-cut-${name})"/></g>`
  }).join('')

  const wholes = ['s', 'p'].map((letter) => `<rect class="intro-whole" style="animation:intro-hand-over 1ms linear ${homeOf(letter)}ms reverse forwards" ${letters} clip-path="url(#intro-cut-${letter})"/>`).join('')
  const done = Math.max(homeOf('s'), homeOf('p'))
  const word = `<g class="intro-word" style="animation:intro-settle 300ms cubic-bezier(0.3, 0, 0.3, 1) ${done - 30}ms">${pieces}${wholes}</g>`

  return `<svg class="intro-letters" data-intro-letters viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${styles.join('')}</style><defs><mask id="intro-sp" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:alpha"><image href="${src}" width="${W}" height="${H}"/></mask>${clips}</defs>${trails.join('')}${word}</svg>`
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
