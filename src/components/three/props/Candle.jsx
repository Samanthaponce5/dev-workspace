import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { lightLevels, palette } from '../materials'
import { createCanvasTexture } from '../textures/createCanvasTexture'

const GLOW = { radius: 0.3, opacity: 0.6, color: '#ff9a45' }

/* A round patch of light: brightest in the middle, fading out to its edge. */
function useGlowTexture() {
  const target = useMemo(() => {
    const canvasTexture = createCanvasTexture(128, 128)
    canvasTexture.paint((context, width, height) => {
      const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.6)')
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.16)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)
    })
    return canvasTexture
  }, [])
  useEffect(() => () => target.dispose(), [target])
  return target.texture
}

/**
 * Lit jar candle with a gently flickering flame.
 *
 * Its warm light is in two parts. A small point light at flame height
 * lights the jar and whatever is near it. A soft glow painted on the desk
 * around the base keeps the orange pool right at the candle: a light's
 * reflection on a glossy surface otherwise slides away from its source
 * depending on where you look from.
 */
export function Candle({ position, animate = true }) {
  const flameRef = useRef(null)
  const lightRef = useRef(null)
  const glowRef = useRef(null)
  const glowTexture = useGlowTexture()

  useFrame(({ clock }) => {
    if (!flameRef.current || !lightRef.current || !glowRef.current) return
    // Two sine waves at odd ratios read as a flicker without a random jitter.
    const t = clock.elapsedTime
    const flicker = animate ? 0.85 + 0.1 * Math.sin(t * 9.1) + 0.05 * Math.sin(t * 23.7) : 0.9
    flameRef.current.scale.set(1, flicker, 1)
    lightRef.current.intensity = lightLevels.candle * flicker
    glowRef.current.material.opacity = GLOW.opacity * flicker
  })

  return (
    <group position={position}>
      {/* Warm pool on the desk, centred on the candle */}
      <mesh ref={glowRef} position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[GLOW.radius, 32]} />
        <meshBasicMaterial map={glowTexture} color={GLOW.color} transparent opacity={GLOW.opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Amber glass jar */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.07, 0.065, 0.18, 16, 1, true]} />
        <meshStandardMaterial color={palette.candleGlass} roughness={0.2} transparent opacity={0.55} emissive={palette.candleGlass} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.004, 16]} />
        <meshStandardMaterial color={palette.candleGlass} roughness={0.3} />
      </mesh>
      {/* Wax */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        <meshStandardMaterial color={palette.candleWax} roughness={0.9} emissive="#ffb070" emissiveIntensity={0.2} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.145, 0]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshStandardMaterial color={palette.flame} emissive={palette.flame} emissiveIntensity={4} toneMapped={false} />
      </mesh>
      {/* Close to the flame and short-range, so it lights the jar rather than the far end of the desk */}
      <pointLight ref={lightRef} position={[0, 0.17, 0]} intensity={lightLevels.candle} color="#ffa552" distance={0.9} decay={2} />
    </group>
  )
}
