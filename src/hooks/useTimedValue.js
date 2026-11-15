import { useEffect, useState } from 'react'

/**
 * State that clears itself. Whatever is set returns to null after
 * `defaultMs`, or after the value's own `durationMs` if it has one.
 * Setting a new value restarts the timer.
 * Used for speech bubbles that should disappear on their own.
 */
export function useTimedValue(defaultMs) {
  const [value, setValue] = useState(null)

  useEffect(() => {
    if (value === null) return undefined
    const id = window.setTimeout(() => setValue(null), value.durationMs ?? defaultMs)
    return () => window.clearTimeout(id)
  }, [value, defaultMs])

  return [value, setValue]
}
