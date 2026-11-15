import { Canvas } from '@react-three/fiber'
import { CameraRig } from './camera/CameraRig'
import { VIEWS } from './camera/views'
import { DeskWorld } from './DeskWorld'
import { ReadySignal } from './ReadySignal'

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

  // Label the <canvas> itself, so speech bubbles rendered beside it in the
  // DOM are still announced by screen readers.
  const describeCanvas = ({ gl }) => {
    gl.domElement.setAttribute('role', 'img')
    gl.domElement.setAttribute('aria-label', scene.description)
  }

  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      shadows={shadows}
      camera={{ fov: view.fov, near: 0.5, far: 80, position: [5, 3, 7] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={describeCanvas}
      style={{ background: 'transparent' }}
    >
      <CameraRig view={view} frame={frame} />
      <DeskWorld
        scene={scene}
        animate={animate}
        parallax={!isMobile}
        shadows={shadows}
        cameraAzimuth={view.azimuth}
        sceneStarted={sceneStarted}
        introStarted={introStarted}
      />
      <ReadySignal onReady={onReady} />
    </Canvas>
  )
}

export default DeskScene
