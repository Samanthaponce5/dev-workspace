import { useEffect, useSyncExternalStore } from 'react'
import { dismissIntro, isIntroDone, onIntroDone } from '../utils/intro'

const FONT_WAIT_MS = 1800 // don't hold the intro for slow fonts longer than this

/** True once the page's intro overlay has gone. */
export function useIntroDone() {
  return useSyncExternalStore(onIntroDone, isIntroDone, () => true)
}

/**
 * Dismisses the intro overlay once `pageReady` is true and the web fonts
 * have arrived, so the page underneath never shifts as it is revealed.
 * There is no minimum time: on a fast load the overlay clears at once.
 */
export function useDismissIntro(pageReady) {
  useEffect(() => {
    if (!pageReady) return undefined
    let cancelled = false

    // Two frames, so the browser has painted the finished page first.
    const dismiss = () =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) dismissIntro()
        }),
      )
    const timeout = window.setTimeout(dismiss, FONT_WAIT_MS)
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
      window.clearTimeout(timeout)
      dismiss()
    })

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [pageReady])
}
