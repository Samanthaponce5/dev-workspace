/*
 * The page's intro overlay: the SP logo that covers the first moments of
 * a visit. Its markup and styles are in index.html so it can paint before
 * any JavaScript has loaded; this module only takes it away.
 */
const FADE_MS = 280 // matches the transition on #intro in index.html
const overlay = () => document.getElementById('intro')

let done = overlay() === null
const listeners = new Set()

/** Fades the overlay out and removes it. Safe to call more than once. */
export function dismissIntro() {
  if (done) return
  done = true
  const element = overlay()
  if (element) {
    element.classList.add('is-done')
    window.setTimeout(() => element.remove(), FADE_MS + 60)
  }
  listeners.forEach((listener) => listener())
}

/** True once the overlay has been dismissed (or was never there). */
export const isIntroDone = () => done

/** Calls `listener` when the overlay is dismissed. Returns an unsubscribe function. */
export function onIntroDone(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Clears the overlay after `ms` whatever happens, so a failed load can't leave it up. */
export function armIntroFailsafe(ms = 9000) {
  window.setTimeout(dismissIntro, ms)
}
