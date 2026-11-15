import { Canvas } from '@react-three/fiber'
import { DeskWorld } from './DeskWorld'

const CAMERA = {
  desktop: { position: [5.5, 3.4, 7.0], fov: 26 },
  mobile: { position: [4.6, 2.8, 5.8], fov: 32 },
}
const TARGET = [0.25, -0.05, 0.35]

/**
 * The WebGL canvas for the hero. Rendering only runs while `active`
 * (the stage is on screen and the tab is visible). Pixel ratio is capped
 * to keep the fill cost down on high-density screens.
 */
export function DeskScene({ scene, active, animate, isMobile }) {
  const camera = isMobile ? CAMERA.mobile : CAMERA.desktop
  const shadows = !isMobile

  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      shadows={shadows}
      camera={{ position: camera.position, fov: camera.fov, near: 0.5, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera: cam }) => cam.lookAt(...TARGET)}
      style={{ background: 'transparent' }}
    >
      <DeskWorld scene={scene} animate={animate} parallax={!isMobile} shadows={shadows} simplified={isMobile} />
    </Canvas>
  )
}

export default DeskScene
