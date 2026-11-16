import { useSyncExternalStore } from 'react'

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
 * Whether to show the 3D scene or the still image. Decided once, when the
 * page loads, so the 3D bundle can start downloading before anything has
 * rendered. The checks are cheap and don't keep a WebGL context alive.
 * Always false while the page is being prerendered at build time.
 */
export const canRender3D = typeof document !== 'undefined' && hasWebGL() && !isLowPowerDevice()

const subscribe = () => () => {}
const getSnapshot = () => canRender3D
// The prerendered HTML is written for the common case, a browser that can show the scene.
const getServerSnapshot = () => true

/** The same answer for components. Matches the prerendered HTML first, then corrects itself before paint. */
export function useCanRender3D() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
