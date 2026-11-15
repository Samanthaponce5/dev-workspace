import { useMemo } from 'react'

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function isLowPowerDevice() {
  const { deviceMemory, hardwareConcurrency, connection } = navigator
  if (connection?.saveData) return true
  if (typeof deviceMemory === 'number' && deviceMemory < 2) return true
  if (typeof hardwareConcurrency === 'number' && hardwareConcurrency <= 2) return true
  return false
}

/**
 * Decides once whether to show the 3D scene or the static illustration.
 * The checks are cheap and don't create a WebGL context that is kept.
 */
export function useCanRender3D() {
  return useMemo(() => hasWebGL() && !isLowPowerDevice(), [])
}
