import { useEffect, useState } from 'react'

/**
 * State that clears itself. Whatever is set returns to null after
 * `durationMs`; setting a new value restarts the timer.
 * Used for speech bubbles that should disappear on their own.
 */
export function useTimedValue(durationMs) {
  const [value, setValue] = useState(null)

  useEffect(() => {
    if (value === null) return undefined
    const id = window.setTimeout(() => setValue(null), durationMs)
    return () => window.clearTimeout(id)
  }, [value, durationMs])

  return [value, setValue]
}
