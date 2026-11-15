import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { palette } from '../materials'
import { createCanvasTexture } from '../textures/createCanvasTexture'

const MUG = { radius: 0.055, height: 0.11 }
const WISP_COUNT = 3
const RISE_HEIGHT = 0.2
const RISE_SPEED = 0.26 // full rises per second

/* A soft white dot that fades to nothing at its edge. */
function useSoftDotTexture() {
  const target = useMemo(() => {
    const canvasTexture = createCanvasTexture(64, 64)
    canvasTexture.paint((context, width, height) => {
      const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.45)')
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
 * A few faint wisps that rise from the cup, drift, widen and fade.
 * Deliberately sparse: it should read as warmth, not as an effect.
 */
function Steam({ animate }) {
  const texture = useSoftDotTexture()
  const wisps = useRef([])

  useFrame(({ clock }) => {
    wisps.current.forEach((wisp, index) => {
      if (!wisp) return
      const offset = index / WISP_COUNT
      // 0 at the coffee's surface, 1 where the wisp has fully faded.
      const life = animate ? (clock.elapsedTime * RISE_SPEED + offset) % 1 : offset + 0.3
      const drift = Math.sin(life * 5 + index * 2.1) * 0.014
      const size = 0.04 + life * 0.06

      wisp.position.set(drift, life * RISE_HEIGHT, Math.cos(life * 4 + index) * 0.008)
      wisp.scale.set(size, size * 1.5, 1)
      wisp.material.opacity = Math.sin(Math.min(life, 1) * Math.PI) * 0.22
    })
  })

  return (
    <group position={[0, MUG.height + 0.01, 0]}>
      {Array.from({ length: WISP_COUNT }, (_, index) => (
        <sprite
          key={index}
          ref={(node) => {
            wisps.current[index] = node
          }}
        >
          <spriteMaterial map={texture} transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/** Cream mug of hot coffee with a handle and rising steam. */
export function CoffeeMug({ position, animate = true, shadows }) {
  return (
    <group position={position}>
      <mesh position={[0, MUG.height / 2, 0]} castShadow={shadows}>
        <cylinderGeometry args={[MUG.radius, MUG.radius * 0.9, MUG.height, 20]} />
        <meshStandardMaterial color={palette.mug} roughness={0.35} />
      </mesh>
      {/* Coffee surface, just below the rim */}
      <mesh position={[0, MUG.height + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[MUG.radius - 0.008, 20]} />
        <meshStandardMaterial color={palette.coffee} roughness={0.25} />
      </mesh>
      {/* Handle */}
      <mesh position={[MUG.radius + 0.012, MUG.height / 2, 0]}>
        <torusGeometry args={[0.03, 0.009, 8, 16]} />
        <meshStandardMaterial color={palette.mug} roughness={0.35} />
      </mesh>
      <Steam animate={animate} />
    </group>
  )
}
