import { markIntroDone } from '../utils/intro'
import { getSceneDuckRect, showSceneDuck } from '../utils/sceneBridge'

/*
 * The intro's reveal.
 *
 * The overlay (see index.html) assembles the SP logo, bounces its lime dot
 * into place and has the tiny duck react, all in CSS, from the first
 * frame. When that has played and the page behind is ready, this plays
 * one short move: the duck dips and hops in an arc to the real duck's spot
 * on the monitor shelf; the logo shrinks and glides to the navbar logo's
 * exact position; and a curved band of teal light sweeps the overlay's
 * background away, from off the bottom-left corner of the window.
 *
 * Every target is measured from the live page at the moment the reveal
 * starts, so it is right for any screen size. If the duck's landing spot
 * isn't available the duck hops in place instead.
 */

const DIP_MS = 110 // the duck crouches...
const HOP_MS = 640 // ...then everything moves together
const SWAP_FADE_MS = 90 // the moving pieces fade over their real counterparts
const WIPE_SOFTNESS = 56 // px of feathering on the sweep's edge (see .intro-bg)
const SWEEP_TRAIL = 200 // px the band of light behind the edge reaches back (see .intro-edge)
const SWEEP_ORIGIN = { x: -0.3, y: 1.25 } // the sweep's centre, as fractions of the window: off its bottom-left corner
const FADE_MS = 200 // for the plain fade used with reduced motion

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const lerp = (from, to, t) => from + (to - from) * t
const centreOf = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

let started = false

/* The navbar logo's letters as drawn: the ink of the glyphs, not their line box. */
function inkRect(span) {
  const style = getComputedStyle(span)
  const context = document.createElement('canvas').getContext('2d')
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  context.letterSpacing = style.letterSpacing
  const metrics = context.measureText(span.textContent)
  const box = span.getBoundingClientRect()
  const contentHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
  const baseline = box.top + (box.height - contentHeight) / 2 + metrics.fontBoundingBoxAscent
  return {
    left: box.left - metrics.actualBoundingBoxLeft,
    top: baseline - metrics.actualBoundingBoxAscent,
    width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
  }
}

const isOnScreen = (rect) => rect && rect.width > 1 && rect.left >= 0 && rect.top >= 0 && rect.left + rect.width <= window.innerWidth && rect.top + rect.height <= window.innerHeight

/* Moves `element` from its own box to `target` by transform alone. */
function glide(element, from, target, t) {
  const scale = lerp(1, target.width / from.width, t)
  element.style.transform = `translate(${lerp(0, target.left - from.left, t)}px, ${lerp(0, target.top - from.top, t)}px) scale(${scale})`
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
    letters: navLetters ? inkRect(navLetters) : from.letters,
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

  // The sweep: a circle far off the bottom-left corner, so its edge crosses the window as a gentle arc,
  // from where it first touches the window until its trailing light has left the far corner.
  const sweepCentre = { x: window.innerWidth * SWEEP_ORIGIN.x, y: window.innerHeight * SWEEP_ORIGIN.y }
  const reach = reachOfWindow(sweepCentre)
  const sweepFrom = reach.nearest
  const sweepTo = reach.farthest + Math.max(WIPE_SOFTNESS, SWEEP_TRAIL)
  overlay.style.setProperty('--wipe-x', `${sweepCentre.x}px`)
  overlay.style.setProperty('--wipe-y', `${sweepCentre.y}px`)

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

    // Logo: letters and dot shrink and glide to the navbar together.
    glide(letters, from.letters, to.letters, eased)
    glide(dot, from.dot, to.dot, eased)

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
