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
 * The intro's letters as an SVG. The picture of the letters is an alpha
 * mask, filled with the text colour, so it suits every theme. Clip paths
 * cut it into seven pieces that follow the letters' own strokes: the S
 * into its upper hook, upper curve, spine, lower curve and lower hook, the
 * P into its stem and bowl. Where a cut crosses a stroke it is a gentle
 * curve, so each piece ends rounded and its neighbour's end cups it.
 *
 * Each piece swirls in: it is carried round the word's centre (--a) while
 * it closes in from further out (--dx, --dy) and turns a little on its
 * own (--r), so its path is a curve, not a line. Two faint echoes follow
 * it, a few milliseconds behind, as a trail. Each letter is replaced by
 * its whole self the moment its last piece is home, so no join shows.
 */

/* The S's cut points, as fractions of the S's width and the letters' height (worked out from the Geist S). */
const S_POINTS = {
  topCut: [0.494, -0.02], // through the top curve...
  topCounter: [0.494, 0.295], // ...ending in the upper counter
  upperBack: [0.321, 0.274], // across the upper curve where it turns into the spine...
  upperFront: [0.185, 0.611], // ...ending in the lower counter
  lowerBack: [0.889, 0.442], // across the spine where it turns into the lower curve...
  lowerFront: [0.543, 0.663],
  bottomCounter: [0.494, 0.663], // through the bottom curve
  bottomCut: [0.494, 1.02],
}

/* The cuts that cross a stroke, and how far each bows (as a share of its length). */
const CURVED_CUTS = { 'topCut-topCounter': 0.16, 'upperBack-upperFront': -0.14, 'lowerBack-lowerFront': 0.14, 'bottomCounter-bottomCut': -0.16 }

/* The S's five pieces, as loops of named points (or [x, y] fractions). */
const S_PIECES = {
  'upper-hook': ['topCut', [1, -0.02], [1, 0.442], 'lowerBack', 'topCounter'],
  'upper-curve': [[-0.02, -0.02], 'topCut', 'topCounter', 'upperBack', 'upperFront', [-0.02, 0.611]],
  spine: ['upperBack', 'topCounter', 'lowerBack', 'lowerFront', 'upperFront'],
  'lower-curve': ['lowerBack', [1, 0.442], [1, 1.02], 'bottomCut', 'bottomCounter', 'lowerFront'],
  'lower-hook': [[-0.02, 0.611], 'upperFront', 'lowerFront', 'bottomCounter', 'bottomCut', [-0.02, 1.02]],
}

/*
 * How each piece arrives: in the order they move (--delay), the swirl round
 * the centre (a, degrees; all the same way, so they move as one), how far
 * out they start (out, letters' heights; straight out from the word's
 * centre unless `from` gives a direction) and their own turn (r, degrees).
 */
const ARRIVALS = [
  { name: 'upper-curve', delay: 0, a: -56, out: 0.95, r: 24 },
  { name: 'p-bowl', delay: 40, a: -50, out: 0.9, r: 20 },
  { name: 'spine', delay: 80, a: -60, out: 1.05, r: 26 },
  { name: 'lower-curve', delay: 120, a: -54, out: 0.92, r: 22 },
  { name: 'p-stem', delay: 160, a: -48, out: 0.95, r: 18, from: [-0.35, 1] }, // from below, so its path doesn't cross the bowl's
  { name: 'upper-hook', delay: 200, a: -58, out: 0.85, r: 24 },
  { name: 'lower-hook', delay: 240, a: -52, out: 0.95, r: 22 },
]
const SWIRL_MS = 700
const TRAIL = [
  { lag: 40, peak: 0.22 },
  { lag: 80, peak: 0.1 },
]

/* Points along a gentle curve from a to b (not including a and b), bowing to the left of a→b by `bow` of its length. */
function bowed(a, b, bow, steps = 10) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const length = Math.hypot(b[0] - a[0], b[1] - a[1])
  const control = [mid[0] + ((a[1] - b[1]) / length) * bow * length, mid[1] + ((b[0] - a[0]) / length) * bow * length]
  return Array.from({ length: steps - 1 }, (_, i) => {
    const t = (i + 1) / steps
    return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * control[0] + t ** 2 * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * control[1] + t ** 2 * b[1]]
  })
}

/* A loop of points, with every curved cut drawn as its curve (the same curve, traversed either way, for the two pieces that share it). */
function outline(loop, resolve, cuts) {
  const points = []
  loop.forEach((spec, i) => {
    const next = loop[(i + 1) % loop.length]
    const here = resolve(spec)
    points.push(here)
    if (typeof spec !== 'string' || typeof next !== 'string') return
    if (cuts[`${spec}-${next}`] !== undefined) points.push(...bowed(here, resolve(next), cuts[`${spec}-${next}`]))
    else if (cuts[`${next}-${spec}`] !== undefined) points.push(...bowed(resolve(next), here, cuts[`${next}-${spec}`]).reverse())
  })
  return points
}

/*
 * The same outline pushed out evenly by `reach` px all round, so
 * neighbouring pieces overlap a little and never show a hairline between
 * them, even as they settle, without any piece carrying a visible sliver
 * of its neighbour while it is in flight.
 */
function grown(points, reach) {
  const area = points.reduce((sum, [x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length]
    return sum + x * ny - nx * y
  }, 0)
  const side = area > 0 ? 1 : -1 // which way is outside, given the loop's direction
  const unit = ([x, y]) => {
    const length = Math.hypot(x, y) || 1
    return [x / length, y / length]
  }
  return points.map((point, i) => {
    const before = points[(i - 1 + points.length) % points.length]
    const after = points[(i + 1) % points.length]
    const [ax, ay] = unit([point[0] - before[0], point[1] - before[1]])
    const [bx, by] = unit([after[0] - point[0], after[1] - point[1]])
    const n1 = [ay * side, -ax * side]
    const n2 = [by * side, -bx * side]
    const [mx, my] = unit([n1[0] + n2[0], n1[1] + n2[1]])
    const stretch = reach / Math.max(0.35, mx * n1[0] + my * n1[1])
    return [point[0] + mx * stretch, point[1] + my * stretch]
  })
}

function lettersSvg({ src, width: W, height: H, gapLeft, gapRight, stemRight }) {
  const f = (value) => Math.round(value * 100) / 100
  const split = (gapLeft + gapRight + 1) / 2
  const sPoint = (spec) => {
    const [fx, fy] = typeof spec === 'string' ? S_POINTS[spec] : spec
    return [fx * split, fy * H]
  }
  const pPoints = { stemTop: [stemRight, -2], stemBottom: [stemRight, H + 2] }
  const pPoint = (spec) => (typeof spec === 'string' ? pPoints[spec] : spec)
  const shapes = {
    ...Object.fromEntries(Object.entries(S_PIECES).map(([name, loop]) => [name, outline(loop, sPoint, CURVED_CUTS)])),
    'p-stem': outline([[split, -2], 'stemTop', 'stemBottom', [split, H + 2]], pPoint, { 'stemTop-stemBottom': 0.05 }),
    'p-bowl': outline(['stemTop', [W + 2, -2], [W + 2, H + 2], 'stemBottom'], pPoint, { 'stemTop-stemBottom': 0.05 }),
  }
  const letterOf = (name) => (name.startsWith('p-') ? 'p' : 's')
  const centreOf = (points) => points.reduce(([x, y], [px, py]) => [x + px / points.length, y + py / points.length], [0, 0])
  const word = [W / 2, H / 2]
  const homeAt = (letter) => SWIRL_MS + Math.max(...ARRIVALS.filter((arrival) => letterOf(arrival.name) === letter).map((arrival) => arrival.delay))
  const letterBox = { s: [[-2, -2], [split, -2], [split, H + 2], [-2, H + 2]], p: [[split, -2], [W + 2, -2], [W + 2, H + 2], [split, H + 2]] }

  const polygon = (points) => `<polygon points="${points.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}"/>`
  const clips = [
    ...Object.entries(shapes).map(([name, points]) => `<clipPath id="intro-cut-${name}">${polygon(grown(points, 1.5))}</clipPath>`),
    ...['s', 'p'].map((letter) => `<clipPath id="intro-cut-${letter}">${polygon(letterBox[letter])}</clipPath>`),
  ].join('')
  const letters = `width="${W}" height="${H}" fill="currentColor" mask="url(#intro-sp)"`

  const piece = ({ name, delay, a, out, r, from }, className, extra = '') => {
    const [px, py] = centreOf(shapes[name])
    let [ux, uy] = from ?? [px - word[0], py - word[1]]
    const length = Math.hypot(ux, uy) || 1
    ;[ux, uy] = [ux / length, uy / length]
    return `<g class="intro-orbit" style="--delay:${delay}ms;--a:${a}deg"><g class="${className}" style="--delay:${delay}ms;--home:${homeAt(letterOf(name))}ms;--dx:${f(ux * out * H)}px;--dy:${f(uy * out * H)}px;--r:${r}deg;--ox:${f(px)}px;--oy:${f(py)}px${extra}"><rect ${letters} clip-path="url(#intro-cut-${name})"/></g></g>`
  }
  const trails = TRAIL.flatMap(({ lag, peak }) => ARRIVALS.map((arrival) => piece({ ...arrival, delay: arrival.delay + lag }, 'intro-piece intro-echo', `;--peak:${peak}`))).join('')
  const pieces = ARRIVALS.map((arrival) => piece(arrival, 'intro-piece')).join('')
  const wholes = ['s', 'p'].map((letter) => `<rect class="intro-whole" style="--home:${homeAt(letter)}ms" ${letters} clip-path="url(#intro-cut-${letter})"/>`).join('')

  // Three thin arcs of light that swirl round the word with the pieces, then fade.
  const arc = (from, to, rx, ry) => {
    const at = (deg) => [word[0] + rx * Math.cos((deg * Math.PI) / 180), word[1] + ry * Math.sin((deg * Math.PI) / 180)]
    const [x0, y0] = at(from)
    const [x1, y1] = at(to)
    return `<path pathLength="1" d="M${f(x0)} ${f(y0)}A${f(rx)} ${f(ry)} 0 0 1 ${f(x1)} ${f(y1)}"/>`
  }
  const arcs = `<g class="intro-arcs" style="--cx:${f(word[0])}px;--cy:${f(word[1])}px">${arc(195, 250, W * 0.6, H * 0.78)}${arc(15, 70, W * 0.62, H * 0.8)}${arc(100, 140, W * 0.55, H * 0.72)}</g>`

  return `<svg class="intro-letters" data-intro-letters viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="--cx:${f(word[0])}px;--cy:${f(word[1])}px"><defs><mask id="intro-sp" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" style="mask-type:alpha"><image href="${src}" width="${W}" height="${H}"/></mask>${clips}</defs>${arcs}${trails}${pieces}${wholes}</svg>`
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
