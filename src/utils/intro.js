/*
 * State for the page's intro overlay (the SP logo and duck that cover the
 * first moments of a visit). Its markup and styles are in index.html so
 * it can paint before any JavaScript has loaded; src/intro/reveal.js
 * plays the reveal; this module only records when it has finished.
 */
// While prerendering at build time there is no document; the built page always starts with the intro up.
let done = typeof document !== 'undefined' && document.getElementById('intro') === null
const listeners = new Set()

/** True once the intro has finished (or was never there). */
export const isIntroDone = () => done

/** Calls `listener` when the intro finishes. Returns an unsubscribe function. */
export function onIntroDone(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/* The longest the letters can take to assemble, in case their animations can't be read. */
const LETTERS_LATEST_MS = 1600

/**
 * Resolves once the intro's letters have swirled together and settled
 * (their dot, sparks and duck may still be moving). The letters are SVG,
 * which the browser animates on the main thread, so heavy work started
 * before then (the 3D scene setting up) makes them stall for a moment;
 * work that can wait should wait for this. Resolves at once when there is
 * no intro (skipped, prerendering) or nothing animating (reduced motion).
 */
export function lettersAssembled() {
  if (typeof document === 'undefined') return Promise.resolve()
  const letters = document.querySelector('#intro .intro-letters')
  if (!letters || typeof letters.getAnimations !== 'function') return Promise.resolve()
  const playing = letters.getAnimations({ subtree: true }).filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
  const settled = Promise.all(playing.map((animation) => animation.finished.catch(() => {})))
  const latest = new Promise((resolve) => window.setTimeout(resolve, Math.max(0, LETTERS_LATEST_MS - performance.now())))
  return Promise.race([settled, latest])
}

/** Marks the intro as finished and tells everyone waiting on it. Safe to call twice. */
export function markIntroDone() {
  if (done) return
  done = true
  performance.mark('intro:done')
  listeners.forEach((listener) => listener())
}
