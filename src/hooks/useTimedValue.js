import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * State that clears itself, for things like speech bubbles.
 *
 * `show(value)` displays a value; it returns to null after `defaultMs`,
 * or after the value's own `durationMs` if it has one. Calling `show`
 * again, even with the same content, restarts the timer.
 *
 * Every showing is stamped with a fresh `id`. Use it as a React key (or
 * a restart key) so anything tied to one showing, such as a CSS fade-out
 * that was scheduled when it appeared, starts over instead of carrying on
 * from the previous one.
 */
export function useTimedValue(defaultMs) {
  const [value, setValue] = useState(null)
  const nextId = useRef(1)

  const show = useCallback((next) => {
    setValue({ ...next, id: nextId.current })
    nextId.current += 1
  }, [])

  useEffect(() => {
    if (value === null) return undefined
    const id = window.setTimeout(() => setValue(null), value.durationMs ?? defaultMs)
    return () => window.clearTimeout(id)
  }, [value, defaultMs])

  return [value, show]
}
