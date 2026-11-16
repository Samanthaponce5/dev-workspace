import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False while the page is prerendered and during React's first pass over
 * that markup; true from then on. Lets a component add browser-only
 * behaviour without disagreeing with the prerendered HTML.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
