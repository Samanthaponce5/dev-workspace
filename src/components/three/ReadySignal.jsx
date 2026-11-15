import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const FRAMES_AFTER_COMPILE = 2

/**
 * Calls `onReady` once the scene can be shown complete.
 *
 * Browsers compile shaders in the background, and three.js skips any
 * object whose shader isn't finished, so a scene revealed too early
 * appears piece by piece. This waits for every material to compile, then
 * for a couple of full frames to be drawn, before signalling. Mount it
 * after the scene's contents so they exist when compilation starts.
 */
export function ReadySignal({ onReady }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const compiled = useRef(false)
  const framesDrawn = useRef(0)
  const signalled = useRef(false)

  useEffect(() => {
    let cancelled = false
    const markCompiled = () => {
      if (!cancelled) compiled.current = true
    }
    // If compiling up front fails, fall back to showing the scene anyway.
    gl.compileAsync(scene, camera).then(markCompiled, markCompiled)
    return () => {
      cancelled = true
    }
  }, [gl, scene, camera])

  useFrame(() => {
    if (!compiled.current || signalled.current) return
    framesDrawn.current += 1
    if (framesDrawn.current >= FRAMES_AFTER_COMPILE) {
      signalled.current = true
      onReady()
    }
  })

  return null
}
