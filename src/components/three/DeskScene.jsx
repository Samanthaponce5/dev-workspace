import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { BuiltInSlices } from './BuiltInSlices'
import { CameraRig } from './camera/CameraRig'
import { VIEWS } from './camera/views'
import { DeskWorld } from './DeskWorld'
import { ReadySignal } from './ReadySignal'

performance.mark('scene:bundle-evaluated')

/**
 * The WebGL canvas for the hero. It fills its parent (the whole hero) and
 * the camera fits the diorama to `frame`, the part of the canvas the
 * layout reserves for it. Rendering only runs while `active`, and the
 * pixel ratio is capped to keep the fill cost down on dense screens.
 *
 * `onReady` fires once the whole scene has been drawn; the parent keeps
 * the canvas hidden until then. `sceneStarted` says the canvas is now
 * being shown, and `introStarted` that the visitor can actually see it,
 * so the characters can begin their greeting.
 */
export function DeskScene({ scene, frame, active, animate, isMobile, sceneStarted, introStarted, onReady }) {
  const view = isMobile ? VIEWS.mobile : VIEWS.desktop
  const shadows = !isMobile

  // No frames are drawn until every shader has compiled. The GPU compiles
  // them in the background, but drawing with one that isn't finished makes
  // the page wait for it, which froze the main thread during loading.
  const [compiled, setCompiled] = useState(false)
  const markCompiled = useCallback(() => setCompiled(true), [])

  const setUpCanvas = ({ gl }) => {
    performance.mark('scene:canvas-created')
    // Label the <canvas> itself, so speech bubbles rendered beside it in
    // the DOM are still announced by screen readers.
    gl.domElement.setAttribute('role', 'img')
    gl.domElement.setAttribute('aria-label', scene.description)
    // Asking the GPU whether each shader compiled is a blocking round trip
    // per material. It is worth it while developing, not for visitors.
    gl.debug.checkShaderErrors = import.meta.env.DEV
  }

  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      frameloop={active && compiled ? 'always' : 'never'}
      shadows={shadows && 'percentage'}
      camera={{ fov: view.fov, near: 0.5, far: 80, position: [5, 3, 7] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={setUpCanvas}
      style={{ background: 'transparent' }}
    >
      <CameraRig view={view} frame={frame} />
      <BuiltInSlices>
        <DeskWorld
          scene={scene}
          animate={animate}
          parallax={!isMobile}
          shadows={shadows}
          cameraAzimuth={view.azimuth}
          sceneStarted={sceneStarted}
          introStarted={introStarted}
        />
        {/* In the same pass, so compiling starts only once the whole scene exists. */}
        <ReadySignal onCompiled={markCompiled} onReady={onReady} />
      </BuiltInSlices>
    </Canvas>
  )
}

export default DeskScene
