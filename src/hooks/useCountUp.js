import { useEffect, useRef, useState } from 'react'
import { useHydrated } from './useHydrated'

const easeOutCubic = (t) => 1 - (1 - t) ** 3

/**
 * Counts a number up from 0 to `target`, once, when `start` turns true.
 *
 * The prerendered page (and React's first pass over it) shows `target`,
 * so pages without JavaScript show the real number. In the browser the
 * number waits at 0 and counts up on the first `start`, over `duration`
 * ms (after `delay` ms) with a smooth ease-out. With `reduced` motion it
 * shows `target` and never animates. It runs only once per page load:
 * scrolling past again does nothing.
 *
 * @returns {number} The number to show now.
 */
export function useCountUp(target, { start, delay = 0, duration = 900, reduced = false }) {
  const hydrated = useHydrated()
  const [count, setCount] = useState(null) // null until the count begins
  const done = useRef(false)

  useEffect(() => {
    if (reduced || !start || done.current) return undefined

    let frame = 0
    const begin = performance.now() + delay
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - begin) / duration))
      // Rounded down, so small numbers reach their last step at the end too, not early.
      setCount(Math.floor(target * easeOutCubic(progress)))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else done.current = true
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [start, reduced, target, delay, duration])

  if (reduced || !hydrated) return target
  return count ?? 0 // when the count has finished, it is the target
}
