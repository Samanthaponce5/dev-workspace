import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { getSceneDuckRect } from '../../utils/sceneBridge'

const FRAMES_AFTER_COMPILE = 2

/**
 * Tells the canvas when the scene can be drawn, and then when it can be
 * shown complete.
 *
 * `onCompiled` fires once every material's shader has finished compiling.
 * The GPU does that work in the background, so the page stays responsive
 * as long as nothing is drawn in the meantime; the canvas holds its frame
 * loop until this fires. `onReady` fires a couple of full frames later.
 * Mount it after the scene's contents so they exist when compiling starts.
 */
export function ReadySignal({ onCompiled, onReady }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const compiled = useRef(false)
  const framesDrawn = useRef(0)
  const signalled = useRef(false)
  const firstFrameMarked = useRef(false)

  useEffect(() => {
    // In development only: lets scripts/capture-posters.mjs reach into the scene.
    if (import.meta.env.DEV) window.__scene = { scene, getDuckRect: getSceneDuckRect }

    let cancelled = false
    performance.mark('scene:compile-start')
    const markCompiled = () => {
      if (cancelled) return
      compiled.current = true
      performance.mark('scene:compiled')
      onCompiled()
    }
    // If compiling up front fails, fall back to drawing the scene anyway.
    gl.compileAsync(scene, camera).then(markCompiled, markCompiled)
    return () => {
      cancelled = true
    }
  }, [gl, scene, camera, onCompiled])

  useFrame(() => {
    if (!firstFrameMarked.current) {
      firstFrameMarked.current = true
      performance.mark('scene:first-frame-loop')
    }
    if (!compiled.current || signalled.current) return
    framesDrawn.current += 1
    if (framesDrawn.current >= FRAMES_AFTER_COMPILE) {
      signalled.current = true
      performance.mark('scene:ready')
      onReady()
    }
  })

  return null
}
