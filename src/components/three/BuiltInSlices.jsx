import { useDeferredValue } from 'react'

/**
 * Mounts its children in a later, low-priority pass. React builds that
 * pass a few milliseconds at a time and hands control back to the browser
 * in between, so creating the whole scene (every geometry, material and
 * texture) doesn't block the page in one long task.
 *
 * Nesting it does nothing: inside a deferred pass React returns the final
 * value straight away, so everything still arrives in one commit.
 */
export function BuiltInSlices({ children }) {
  const build = useDeferredValue(true, false)
  return build ? children : null
}
