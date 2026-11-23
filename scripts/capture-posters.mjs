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
 * Five pieces of the real letters swirl in and lock together: the S's
 * upper curve, spine and lower curve, and the P's stem and bowl. Each
 * piece is cut from the exact logo (the picture of the letters, used as an
 * alpha mask and filled with the text colour), so its outer edges are the
 * font's own and the assembled word is the real logo, pixel for pixel.
 * Where two pieces meet, each ends in a smooth round cap as wide as the
 * stroke; the two caps overlap, and since both show the same pixels of the
 * same letter, the overlap is invisible once they are home.
 *
 * The cut points were traced from the Geist letters at the size this
 * script draws them (159 × 95) and are scaled if that size changes.
 *
 * Motion: the pieces appear together in a loose ring round the centre,
 * drift out a touch, then sweep in on cubic Bézier curves, turning a little and
 * straightening as they arrive: the S first, then the P. Each journey is
 * sampled into its own keyframes, so the whole assembly is one CSS
 * timeline. Short teal trails follow three pieces and fade early. When the
 * last piece is home, the whole letters take over in a single frame (they
 * are identical, so nothing visibly changes) and the word gives one small,
 * soft settle.
 */

const TRACED = { width: 159, height: 95 }

/* Where the S is cut: two cuts across its strokes, each with a joint point (on the stroke's centre line) and the ends of the cut, out in the counters. */
const S_CUTS = {
  upper: { joint: [21, 39], ends: [[27.7, 26.7], [14.3, 51.3]] }, // where the upper curve turns into the spine
  lower: { joint: [56.5, 53.5], ends: [[61.7, 40.5], [51.3, 66.5]] }, // where the spine turns into the lower curve
}
const S_JOINT_RADIUS = 10 // a little over half the S's stroke, so a cap spans it
const P_BARS = [10, 53.5] // the centre lines of the P's top and middle bars, where the bowl meets the stem
const P_JOINT_RADIUS = 10.5

/*
 * How each piece arrives: when it sets off and how long it travels, where
 * it starts (as letters' heights from home), which way it swirls (1
 * clockwise, -1 the other way), how far it is turned at the start
 * (degrees), the point it turns about (traced units) and whether a trail
 * follows it.
 */
const ARRIVALS = [
  { name: 's-upper', delay: 0, travel: 820, from: [-0.32, -0.3], swirl: 1, turn: -14, pivot: [34, 22], trail: true },
  { name: 's-spine', delay: 60, travel: 780, from: [-0.42, 0.12], swirl: 1, turn: 10, pivot: [39, 46] },
  { name: 's-lower', delay: 120, travel: 740, from: [0.02, 0.44], swirl: 1, turn: -14, pivot: [44, 72], trail: true },
  { name: 'p-bowl', delay: 200, travel: 760, from: [0.38, -0.28], swirl: -1, turn: 12, pivot: [130, 32], trail: true },
  { name: 'p-stem', delay: 250, travel: 710, from: [0.3, 0.38], swirl: -1, turn: 8, pivot: [96.5, 46] },
]
const DRIFT = 0.26 // the share of each journey spent drifting gently outward before the sweep in
const SAMPLES = 30

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
const driftEase = bezierEasing(0.37, 0, 0.63, 1) // a soft ease in and out
const sweepEase = bezierEasing(0.45, 0, 0.22, 1) // gathering pace, then a long gentle stop

function lettersSvg({ src, width: W, height: H, gapLeft, gapRight, stemRight }) {
  const f = (value) => Math.round(value * 100) / 100
  const split = (gapLeft + gapRight + 1) / 2
  const sx = W / TRACED.width
  const sy = H / TRACED.height
  const at = ([x, y]) => [x * sx, y * sy]

  // Each piece's region: a polygon (its share of the letter, bounded by cuts that run through the
  // counters), plus a round cap at each joint it has.
  const [u1, v1] = S_CUTS.upper.ends.map(at)
  const [u2, v2] = S_CUTS.lower.ends.map(at)
  const j1 = at(S_CUTS.upper.joint)
  const j2 = at(S_CUTS.lower.joint)
  const top = -2
  const bottom = H + 2
  const sCap = S_JOINT_RADIUS * sy
  const pCap = P_JOINT_RADIUS * sy
  const regions = {
    's-upper': { polygon: [[-2, top], [split, top], [split, u2[1]], u2, u1, v1, [-2, v1[1]]], caps: [j1], radius: sCap },
    's-spine': { polygon: [u1, u2, v2, v1], caps: [j1, j2], radius: sCap },
    's-lower': { polygon: [[-2, v1[1]], v1, v2, u2, [split, u2[1]], [split, bottom], [-2, bottom]], caps: [j2], radius: sCap },
    'p-stem': { polygon: [[split, top], [stemRight, top], [stemRight, bottom], [split, bottom]], caps: [], radius: pCap },
    // (A pixel clear of the stem's soft edge, so the bowl never carries a sliver of it; its caps cover the joins.)
    'p-bowl': { polygon: [[stemRight + 1, top], [W + 2, top], [W + 2, bottom], [stemRight + 1, bottom]], caps: P_BARS.map((y) => [stemRight, y * sy]), radius: pCap },
  }
  const clips = Object.entries(regions)
    .map(([name, { polygon, caps, radius }]) => {
      const shape = `<polygon points="${polygon.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}"/>`
      const discs = caps.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(radius)}"/>`).join('')
      return `<clipPath id="intro-cut-${name}">${shape}${discs}</clipPath>`
    })
    .join('')

  const letters = `width="${W}" height="${H}" fill="currentColor" mask="url(#intro-sp)"`
  const styles = []
  const trails = []
  const homeAt = Math.max(...ARRIVALS.map((arrival) => arrival.delay + arrival.travel))

  const pieces = ARRIVALS.map(({ name, delay, travel, from: [fx, fy], swirl, turn, pivot, trail }) => {
    const [px, py] = at(pivot)
    // The sweep in, measured from home: a cubic Bézier from where the drift ends, swinging round, to (0, 0).
    const start = [fx * H * 1.06, fy * H * 1.06]
    const loose = [fx * H * 0.9, fy * H * 0.9] // where the piece sits at first, a touch closer in
    const across = [-start[1] * swirl, start[0] * swirl]
    const c1 = [start[0] * 0.92 + across[0] * 0.55, start[1] * 0.92 + across[1] * 0.55]
    const c2 = [start[0] * 0.1 + across[0] * 0.2, start[1] * 0.1 + across[1] * 0.2]
    const curve = (s) => [0, 1].map((k) => (1 - s) ** 3 * start[k] + 3 * (1 - s) ** 2 * s * c1[k] + 3 * (1 - s) * s ** 2 * c2[k])

    const frames = []
    const trailFrames = []
    for (let i = 0; i <= SAMPLES; i += 1) {
      const t = i / SAMPLES
      let position
      let angle
      let sweep = 0
      if (t < DRIFT) {
        const d = driftEase(t / DRIFT)
        position = [loose[0] + (start[0] - loose[0]) * d, loose[1] + (start[1] - loose[1]) * d]
        angle = turn * (0.85 + 0.15 * d)
      } else {
        sweep = sweepEase((t - DRIFT) / (1 - DRIFT))
        position = curve(sweep)
        angle = turn * (1 - sweep) ** 2 // turning less and less as it nears home
      }
      const key = `${f(t * 100)}%`
      frames.push(`${key}{transform:translate(${f(position[0])}px,${f(position[1])}px) rotate(${f(angle)}deg)}`)
      const fade = t < DRIFT ? 0 : Math.min(1, sweep * 6) * Math.max(0, 1 - sweep / 0.65)
      trailFrames.push(`${key}{stroke-dashoffset:${f(0.26 - sweep)};opacity:${f(fade)}}`)
    }
    styles.push(`@keyframes intro-path-${name}{${frames.join('')}}`)
    if (trail) {
      styles.push(`@keyframes intro-trail-${name}{${trailFrames.join('')}}`)
      const abs = (point) => `${f(px + point[0])} ${f(py + point[1])}`
      trails.push(`<path class="intro-swirl-trail" pathLength="1" d="M${abs(start)}C${abs(c1)} ${abs(c2)} ${abs([0, 0])}" style="animation:intro-trail-${name} ${travel}ms linear ${delay}ms both"/>`)
    }
    return `<g class="intro-piece" style="transform-origin:${f(px)}px ${f(py)}px;animation:intro-path-${name} ${travel}ms linear ${delay}ms both,intro-appear 180ms ease-out both,intro-hand-over 1ms linear ${homeAt}ms forwards"><rect ${letters} clip-path="url(#intro-cut-${name})"/></g>`
  }).join('')

  const whole = `<rect class="intro-whole" style="animation:intro-hand-over 1ms linear ${homeAt}ms reverse forwards" ${letters}/>`
  const word = `<g class="intro-word" style="animation:intro-settle 300ms cubic-bezier(0.3, 0, 0.3, 1) ${homeAt - 40}ms">${pieces}${whole}</g>`

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
