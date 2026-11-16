import { useSyncExternalStore } from 'react'
import { isIntroDone, onIntroDone } from '../utils/intro'

/** True once the page's intro has finished and the landing page is in view. */
export function useIntroDone() {
  return useSyncExternalStore(onIntroDone, isIntroDone, () => true)
}
