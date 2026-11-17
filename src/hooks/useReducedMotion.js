import { useDisplaySettings } from './useDisplaySettings'
import { useMediaQuery } from './useMediaQuery'

/**
 * True when motion should be kept to a minimum: the visitor has asked
 * their system for that, or chose Reduced in Display settings.
 */
export function useReducedMotion() {
  const systemPrefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const { motion } = useDisplaySettings()
  return systemPrefersReduced || motion === 'reduced'
}
