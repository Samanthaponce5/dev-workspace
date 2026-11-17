import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { palette } from '../materials'
import { useSceneTheme } from '../sceneTheme'

const LAMP = { radius: 0.085, height: 0.34 }
const TENTACLES = [0, 1.3, 2.5, 3.8, 5.0]
const BELL_RADIUS = 0.03
const EDGE = 1.18 // how much larger than the jellyfish its outline is

/*
 * The jellyfish's outline, when the theme gives it one: a slightly larger
 * copy of each part, drawn inside out, so only a thin rim shows round
 * the edge of the part in front of it.
 */
function Edge({ color, children }) {
  if (!color) return null
  return (
    <mesh scale={EDGE}>
      {children}
      <meshBasicMaterial color={color} side={THREE.BackSide} />
    </mesh>
  )
}

/**
 * Glowing cylindrical lamp with a tiny jellyfish drifting up and down.
 *
 * The jellyfish is solid and the water and glass around it are see-through
 * layers that don't write to the depth buffer. That order matters: if the
 * water wrote depth, the jellyfish would vanish whenever it drifted nearer
 * the camera than the middle of the lamp, because see-through objects are
 * drawn back to front by their centres.
 *
 * Its colours follow the site's theme (see sceneTheme.js): in Dark a
 * glowing pink jellyfish in blue water; in Light a pearl-white one with
 * a silver-grey edge in faintly smoky water.
 */
export function JellyfishLamp({ position, animate = true }) {
  const jellyRef = useRef(null)
  const theme = useSceneTheme()

  useFrame(({ clock }) => {
    if (!animate || !jellyRef.current) return
    const t = clock.elapsedTime
    jellyRef.current.position.y = 0.19 + Math.sin(t * 0.9) * 0.075
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
        <meshStandardMaterial
          color={theme.lampWater}
          emissive={theme.lampWater}
          emissiveIntensity={theme.lampWaterGlow}
          transparent
          opacity={theme.lampWaterOpacity}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Jellyfish: a bell plus trailing tentacles */}
      <group ref={jellyRef} name="jellyfish" position={[0, 0.17, 0]}>
        <mesh>
          <sphereGeometry args={[BELL_RADIUS, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={theme.jelly} emissive={theme.jelly} emissiveIntensity={theme.jellyGlow} toneMapped={false} />
        </mesh>
        <Edge color={theme.jellyEdge}>
          <sphereGeometry args={[BELL_RADIUS, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </Edge>
        {TENTACLES.map((angle) => (
          <group key={angle} position={[Math.cos(angle) * 0.016, -0.03, Math.sin(angle) * 0.016]}>
            <mesh>
              <cylinderGeometry args={[0.002, 0.003, 0.06, 4]} />
              <meshStandardMaterial color={theme.jelly} emissive={theme.jelly} emissiveIntensity={theme.jellyTentacleGlow} />
            </mesh>
            <Edge color={theme.jellyEdge}>
              <cylinderGeometry args={[0.002, 0.003, 0.06, 4]} />
            </Edge>
          </group>
        ))}
      </group>

      {/* Glass shell */}
      <mesh position={[0, LAMP.height / 2 + 0.03, 0]}>
        <cylinderGeometry args={[LAMP.radius, LAMP.radius, LAMP.height, 20, 1, true]} />
        <meshStandardMaterial color={theme.lampGlass} roughness={0.1} metalness={0.1} transparent opacity={theme.lampGlassOpacity} depthWrite={false} />
      </mesh>

      <pointLight position={[0, LAMP.height / 2 + 0.05, 0]} intensity={theme.lampLightLevel} color={theme.lampLight} distance={1.2} decay={2} />
    </group>
  )
}
