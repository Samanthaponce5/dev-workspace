import { markIntroDone } from '../utils/intro'
import { getSceneDuckRect, showSceneDuck } from '../utils/sceneBridge'

/*
 * The intro's reveal.
 *
 * The overlay (see index.html) assembles the SP logo, bounces its dot
 * into place and has the tiny duck react, all in CSS, from the first
 * frame. When that has played and the page behind is ready, this plays
 * one short move: the duck dips and hops in an arc to the real duck's spot
 * on the monitor shelf; the logo shrinks and glides along a curve to the
 * navbar logo's exact position, leaving a thin trail of light; and the
 * page rises into view under a glowing arc, like the edge of a planet.
 *
 * Every target is measured from the live page at the moment the reveal
 * starts, so it is right for any screen size. If the duck's landing spot
 * isn't available the duck hops in place instead.
 */

const DIP_MS = 110 // the duck crouches...
const HOP_MS = 640 // ...then everything moves together
const SWAP_FADE_MS = 90 // the moving pieces fade over their real counterparts
const WIPE_SOFTNESS = 56 // px of feathering on the sweep's edge (see .intro-bg)
const SWEEP_TRAIL = 170 // px the light behind the rim reaches back (see .intro-edge)
const SWEEP_DEPTH = 0.9 // how far below the window the sweep's centre is, as a share of its width: the larger, the flatter the arc
const TRAIL_LENGTH = 0.28 // of the logo's path, how much the trail behind it covers
const FADE_MS = 200 // for the plain fade used with reduced motion

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const lerp = (from, to, t) => from + (to - from) * t
const centreOf = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

let started = false

const isOnScreen = (rect) => rect && rect.width > 1 && rect.left >= 0 && rect.top >= 0 && rect.left + rect.width <= window.innerWidth && rect.top + rect.height <= window.innerHeight

/* A point on a quadratic curve. */
const curve = (a, control, b, t) => (1 - t) ** 2 * a + 2 * (1 - t) * t * control + t ** 2 * b

/*
 * The logo's flight bends: it rises first and then sweeps across, rather
 * than sliding straight to the corner. This is the bend's control point
 * for a flight from `start` to `end`.
 */
const bendOf = (start, end) => ({ x: start.x + (end.x - start.x) * 0.25, y: end.y + (start.y - end.y) * 0.15 })

/*
 * The logo's flight, as one piece: where the letters' and the dot's
 * top-left corners are, and how much each is scaled, `t` of the way
 * there. The letters follow the bend; the dot keeps its place beside them,
 * scaled with them, plus a share of any last fraction of a pixel it needs
 * to land exactly on the navbar dot.
 */
function logoFlight(from, to) {
  const start = { x: from.letters.left, y: from.letters.top }
  const end = { x: to.letters.left, y: to.letters.top }
  const bend = bendOf(start, end)
  const growth = to.letters.width / from.letters.width
  const offset = { x: from.dot.left - from.letters.left, y: from.dot.top - from.letters.top }
  const miss = { x: to.dot.left - (end.x + offset.x * growth), y: to.dot.top - (end.y + offset.y * growth) }
  return (t) => {
    const letters = { x: curve(start.x, bend.x, end.x, t), y: curve(start.y, bend.y, end.y, t), scale: lerp(1, growth, t) }
    const dot = { x: letters.x + offset.x * letters.scale + miss.x * t, y: letters.y + offset.y * letters.scale + miss.y * t, scale: lerp(1, to.dot.width / from.dot.width, t) }
    return { letters, dot }
  }
}

/* Puts `element` (transform-origin 0 0) with its top-left corner at `place`, scaled. */
function place(element, from, { x, y, scale }) {
  element.style.transform = `translate(${x - from.left}px, ${y - from.top}px) scale(${scale})`
}

/* The trail: a short tail of light along the dot's flight, ending where the dot is now, fading as it lands. */
function prepareTrail(overlay, flight, from) {
  const paths = overlay.querySelectorAll('.intro-trail path')
  if (!paths.length) return () => {}
  const radius = from.dot.width / 2
  const points = Array.from({ length: 33 }, (_, i) => {
    const { dot } = flight(i / 32)
    return `${(dot.x + radius * dot.scale).toFixed(1)} ${(dot.y + radius * dot.scale).toFixed(1)}`
  })
  for (const path of paths) {
    path.setAttribute('d', `M${points.join(' L')}`)
    path.setAttribute('pathLength', '1')
    path.style.strokeDasharray = `${TRAIL_LENGTH} 2`
  }
  const draw = (t) => {
    for (const path of paths) {
      path.style.strokeDashoffset = `${TRAIL_LENGTH - t}`
      path.style.opacity = String(Math.min(1, t * 6) * (1 - t ** 3))
    }
  }
  draw(0)
  return draw
}

/*
 * Resolves once the overlay's own animations (the logo assembling, the dot
 * landing, the duck's reaction) have played. The duck's idle bob repeats
 * forever, so it doesn't count. With reduced motion there are none.
 */
function assembled(overlay) {
  if (typeof overlay.getAnimations !== 'function') return Promise.resolve()
  const playing = overlay.getAnimations({ subtree: true }).filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
  return Promise.all(playing.map((animation) => animation.finished.catch(() => {})))
}

/* How far a point is from the nearest and the farthest parts of the window. */
function reachOfWindow(point) {
  const { innerWidth: width, innerHeight: height } = window
  const nearest = Math.hypot(Math.max(0 - point.x, 0, point.x - width), Math.max(0 - point.y, 0, point.y - height))
  const farthest = Math.max(...[0, width].flatMap((x) => [0, height].map((y) => Math.hypot(x - point.x, y - point.y))))
  return { nearest, farthest }
}

function finish(overlay) {
  // The real navbar logo and the real duck appear in the same frame the moving ones arrive.
  document.documentElement.classList.remove('intro-pending')
  showSceneDuck()
  overlay.dataset.state = 'done'
  window.setTimeout(() => overlay.remove(), SWAP_FADE_MS + 40)
  markIntroDone()
}

/**
 * Plays the reveal once. Later calls do nothing.
 *
 * @param {object} [options]
 * @param {boolean} [options.toShelf=true] Land the duck on the scene's duck.
 *   Pass false when the live scene isn't showing (the still image already
 *   has a duck on the shelf), and the duck hops in place.
 * @param {boolean} [options.reducedMotion=false] Use a quick fade instead.
 */
export function revealIntro({ toShelf = true, reducedMotion = false } = {}) {
  if (started) return
  started = true

  const overlay = document.getElementById('intro')
  if (!overlay) {
    document.documentElement.classList.remove('intro-pending')
    showSceneDuck()
    markIntroDone()
    return
  }
  if (reducedMotion) {
    performance.mark('intro:reveal-start')
    document.documentElement.classList.remove('intro-pending')
    showSceneDuck()
    overlay.dataset.state = 'fading'
    window.setTimeout(() => {
      overlay.remove()
      markIntroDone()
    }, FADE_MS)
    return
  }

  // The logo finishes assembling first. On a slow connection it has long since; on a fast one the
  // page can be ready while the dot is still landing, and this waits out the few hundred ms left.
  assembled(overlay).then(() => play(overlay, toShelf))
}

function play(overlay, toShelf) {
  performance.mark('intro:reveal-start')
  const letters = overlay.querySelector('.intro-letters')
  const dot = overlay.querySelector('.intro-dot')
  const duck = overlay.querySelector('.intro-duck')
  const navLetters = document.querySelector('[data-site-logo-letters]')
  const navDot = document.querySelector('[data-site-logo-dot]')

  // Stop the idle animation first, so the starting boxes are the resting ones.
  overlay.dataset.state = 'revealing'
  const from = { letters: letters.getBoundingClientRect(), dot: dot.getBoundingClientRect(), duck: duck.getBoundingClientRect() }
  const to = {
    letters: navLetters ? navLetters.getBoundingClientRect() : from.letters, // the letters' box is their ink (see logoShape.js)
    dot: navDot ? navDot.getBoundingClientRect() : from.dot,
  }

  const shelf = toShelf ? getSceneDuckRect() : null
  const landing = isOnScreen(shelf) ? shelf : null
  const duckStart = centreOf(from.duck)
  const duckEnd = landing ? centreOf(landing) : duckStart
  const duckScale = landing ? landing.height / from.duck.height : 1
  // A hop in place rises by its own height; a hop to the shelf arcs higher the farther it travels.
  const travel = Math.hypot(duckEnd.x - duckStart.x, duckEnd.y - duckStart.y)
  const arc = landing ? Math.max(70, travel * 0.3) : from.duck.height * 1.1
  const control = { x: (duckStart.x + duckEnd.x) / 2, y: Math.min(duckStart.y, duckEnd.y) - arc }

  // The sweep: a circle centred well below the window, so its edge rises from the bottom as a broad arc,
  // from where it first touches the window until its trailing light has left the top corners.
  const sweepCentre = { x: window.innerWidth / 2, y: window.innerHeight + window.innerWidth * SWEEP_DEPTH }
  const reach = reachOfWindow(sweepCentre)
  const sweepFrom = reach.nearest
  const sweepTo = reach.farthest + Math.max(WIPE_SOFTNESS, SWEEP_TRAIL)
  overlay.style.setProperty('--wipe-x', `${sweepCentre.x}px`)
  overlay.style.setProperty('--wipe-y', `${sweepCentre.y}px`)

  const flight = logoFlight(from, to)
  const drawTrail = prepareTrail(overlay, flight, from)

  const startedAt = performance.now()
  const frame = (now) => {
    const elapsed = now - startedAt

    if (elapsed < DIP_MS) {
      const dip = Math.sin((elapsed / DIP_MS) * Math.PI * 0.5)
      duck.style.transform = `translateY(${dip * 0.08 * from.duck.height}px) scale(${1 + dip * 0.1}, ${1 - dip * 0.14})`
      requestAnimationFrame(frame)
      return
    }

    const t = Math.min((elapsed - DIP_MS) / HOP_MS, 1)
    const eased = easeInOut(t)

    // Duck: along a curve from the logo to the shelf, shrinking as it goes.
    const along = (a, b, c) => (1 - eased) ** 2 * a + 2 * (1 - eased) * eased * b + eased ** 2 * c
    const x = along(duckStart.x, control.x, duckEnd.x)
    const y = along(duckStart.y, control.y, duckEnd.y)
    duck.style.transform = `translate(${x - duckStart.x}px, ${y - duckStart.y}px) scale(${lerp(1, duckScale, eased)})`

    // Logo: letters and dot shrink and fly to the navbar together, trailing light.
    const logo = flight(eased)
    place(letters, from.letters, logo.letters)
    place(dot, from.dot, logo.dot)
    drawTrail(eased)

    // The sweep keeps pace with the duck, a little ahead: it starts as he leaves and has cleared the page just before he lands.
    overlay.style.setProperty('--wipe-r', `${lerp(sweepFrom, sweepTo, easeInOut(Math.min(t * 1.12, 1)) ** 0.85)}px`)

    if (t < 1) {
      requestAnimationFrame(frame)
      return
    }
    performance.mark('intro:reveal-end')
    finish(overlay)
  }
  requestAnimationFrame(frame)
}
