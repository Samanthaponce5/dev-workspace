import { useMediaQuery } from './useMediaQuery'

/** True when the visitor has asked their system to minimise motion. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
