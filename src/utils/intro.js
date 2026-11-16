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

/** Marks the intro as finished and tells everyone waiting on it. Safe to call twice. */
export function markIntroDone() {
  if (done) return
  done = true
  performance.mark('intro:done')
  listeners.forEach((listener) => listener())
}
