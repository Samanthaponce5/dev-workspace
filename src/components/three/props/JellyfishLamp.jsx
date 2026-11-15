import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { lightLevels, palette } from '../materials'

const LAMP = { radius: 0.085, height: 0.34 }
const TENTACLES = [0, 1.3, 2.5, 3.8, 5.0]

/** Glowing cylindrical lamp with a tiny jellyfish drifting up and down. */
export function JellyfishLamp({ position, animate = true }) {
  const jellyRef = useRef(null)

  useFrame(({ clock }) => {
    if (!animate || !jellyRef.current) return
    const t = clock.elapsedTime
    jellyRef.current.position.y = 0.17 + Math.sin(t * 1.1) * 0.05
    jellyRef.current.rotation.y = t * 0.4
    // Bell pulses as it "swims".
    const pulse = 1 + Math.sin(t * 2.2) * 0.06
    jellyRef.current.scale.set(pulse, 1 / pulse, pulse)
  })

  return (
    <group position={position}>
      {/* Base and cap */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[LAMP.radius + 0.01, LAMP.radius + 0.015, 0.03, 20]} />
        <meshStandardMaterial color={palette.metalDark} roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, LAMP.height + 0.04, 0]}>
        <cylinderGeometry args={[LAMP.radius + 0.01, LAMP.radius + 0.01, 0.025, 20]} />
        <meshStandardMaterial color={palette.metalDark} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Glowing water column */}
      <mesh position={[0, LAMP.height / 2 + 0.03, 0]}>
        <cylinderGeometry args={[LAMP.radius - 0.012, LAMP.radius - 0.012, LAMP.height - 0.02, 20]} />
        <meshStandardMaterial color={palette.lampWater} emissive={palette.lampWater} emissiveIntensity={0.9} transparent opacity={0.5} roughness={0.2} />
      </mesh>

      {/* Jellyfish: a bell plus trailing tentacles */}
      <group ref={jellyRef} position={[0, 0.17, 0]}>
        <mesh>
          <sphereGeometry args={[0.03, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={palette.jelly} emissive={palette.jelly} emissiveIntensity={1.4} transparent opacity={0.9} toneMapped={false} />
        </mesh>
        {TENTACLES.map((angle) => (
          <mesh key={angle} position={[Math.cos(angle) * 0.016, -0.03, Math.sin(angle) * 0.016]}>
            <cylinderGeometry args={[0.002, 0.003, 0.06, 4]} />
            <meshStandardMaterial color={palette.jelly} emissive={palette.jelly} emissiveIntensity={1} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {/* Glass shell */}
      <mesh position={[0, LAMP.height / 2 + 0.03, 0]}>
        <cylinderGeometry args={[LAMP.radius, LAMP.radius, LAMP.height, 20, 1, true]} />
        <meshStandardMaterial color={palette.lampGlass} roughness={0.1} metalness={0.1} transparent opacity={0.22} />
      </mesh>

      <pointLight position={[0, LAMP.height / 2 + 0.05, 0]} intensity={lightLevels.lamp} color="#5b8cff" distance={1.6} decay={2} />
    </group>
  )
}
