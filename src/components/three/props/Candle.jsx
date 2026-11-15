import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { lightLevels, palette } from '../materials'

/** Lit jar candle with a gently flickering flame and warm light. */
export function Candle({ position, animate = true }) {
  const flameRef = useRef(null)
  const lightRef = useRef(null)

  useFrame(({ clock }) => {
    if (!animate || !flameRef.current || !lightRef.current) return
    const t = clock.elapsedTime
    // Two sine waves at odd ratios read as a flicker without a random jitter.
    const flicker = 0.85 + 0.1 * Math.sin(t * 9.1) + 0.05 * Math.sin(t * 23.7)
    flameRef.current.scale.set(1, flicker, 1)
    lightRef.current.intensity = lightLevels.candle * flicker
  })

  return (
    <group position={position}>
      {/* Amber glass jar */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.07, 0.065, 0.18, 16, 1, true]} />
        <meshStandardMaterial color={palette.candleGlass} roughness={0.2} transparent opacity={0.55} emissive={palette.candleGlass} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.004, 16]} />
        <meshStandardMaterial color={palette.candleGlass} roughness={0.3} />
      </mesh>
      {/* Wax */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        <meshStandardMaterial color={palette.candleWax} roughness={0.9} emissive="#ffb070" emissiveIntensity={0.15} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, 0.145, 0]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshStandardMaterial color={palette.flame} emissive={palette.flame} emissiveIntensity={4} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.2, 0]} intensity={lightLevels.candle} color="#ffa552" distance={1.4} decay={2} />
    </group>
  )
}
