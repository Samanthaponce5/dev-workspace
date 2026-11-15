import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { palette } from '../materials'
import { createCanvasTexture } from '../textures/createCanvasTexture'

const MUG = { radius: 0.055, height: 0.11 }

const STEAM = {
  wisps: 2,
  color: '#fff1dc', // warm white
  startBelowRim: 0.012, // wisps begin just inside the mug
  rise: 0.24, // how far each wisp travels upward
  speed: 0.16, // full rises per second
  peakOpacity: 0.95,
  width: [0.085, 0.13], // each wisp widens as it rises
  stretch: 2.1, // taller than wide
  drift: 0.02, // sideways sway as it rises
  spacing: 0.016, // the two wisps sit either side of the mug's centre
}

/*
 * One wisp: a soft ribbon that curls from side to side as it goes up,
 * bright along its middle and fading out at both ends.
 */
function useWispTexture() {
  const target = useMemo(() => {
    const canvasTexture = createCanvasTexture(64, 128)
    canvasTexture.paint((context, width, height) => {
      context.clearRect(0, 0, width, height)

      const ribbon = () => {
        context.beginPath()
        context.moveTo(32, 122)
        context.bezierCurveTo(10, 100, 54, 84, 32, 62)
        context.bezierCurveTo(12, 42, 50, 26, 36, 6)
        context.stroke()
      }
      context.lineCap = 'round'
      context.strokeStyle = '#ffffff'
      // A wide, faint pass for the soft edge, then a narrower bright core.
      context.shadowColor = 'rgba(255, 255, 255, 0.9)'
      context.shadowBlur = 9
      context.globalAlpha = 0.45
      context.lineWidth = 15
      ribbon()
      context.globalAlpha = 1
      context.lineWidth = 8
      ribbon()

      // Fade the ribbon out toward its top and its base.
      context.shadowBlur = 0
      context.globalCompositeOperation = 'destination-in'
      const fade = context.createLinearGradient(0, 0, 0, height)
      fade.addColorStop(0, 'rgba(0, 0, 0, 0)')
      fade.addColorStop(0.3, 'rgba(0, 0, 0, 1)')
      fade.addColorStop(0.8, 'rgba(0, 0, 0, 1)')
      fade.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = fade
      context.fillRect(0, 0, width, height)
      context.globalCompositeOperation = 'source-over'
    })
    return canvasTexture
  }, [])
  useEffect(() => () => target.dispose(), [target])
  return target.texture
}

/**
 * Two wisps of steam. Each starts inside the rim, rises, widens, sways
 * and fades out, then starts again; the two are half a cycle apart and
 * mirror each other, so there is always one in view. With `animate` off
 * (reduced motion) they hold still at two heights instead.
 *
 * Why ribbons rather than soft puffs: steam is white, and directly behind
 * the mug is the brightest patch of desk (the LED strip's reflection). A
 * faint round puff vanishes there at hero size. A ribbon with a bright
 * core keeps its shape and contrast when it is only a few pixels wide.
 * They are also drawn without tone mapping, so the white stays white.
 */
function Steam({ animate }) {
  const texture = useWispTexture()
  const wisps = useRef([])

  useFrame(({ clock }) => {
    wisps.current.forEach((wisp, index) => {
      if (!wisp) return
      const offset = index / STEAM.wisps
      // 0 just inside the mug, 1 where the wisp has fully faded.
      const life = animate ? (clock.elapsedTime * STEAM.speed + offset) % 1 : 0.25 + offset * 0.6
      const side = index % 2 ? -1 : 1
      const width = STEAM.width[0] + (STEAM.width[1] - STEAM.width[0]) * life
      const height = width * STEAM.stretch

      wisp.position.set(side * (STEAM.spacing + Math.sin(life * Math.PI * 1.5) * STEAM.drift), life * STEAM.rise + height / 2 - STEAM.startBelowRim, 0)
      // A negative width mirrors the ribbon, so the two wisps curl opposite ways.
      wisp.scale.set(side * width, height, 1)
      // Quick to appear, slow to fade.
      wisp.material.opacity = Math.min(life / 0.12, 1) * (1 - life) ** 1.1 * STEAM.peakOpacity
    })
  })

  return (
    <group position={[0, MUG.height, 0]}>
      {Array.from({ length: STEAM.wisps }, (_, index) => (
        <sprite
          key={index}
          ref={(node) => {
            wisps.current[index] = node
          }}
        >
          <spriteMaterial map={texture} color={STEAM.color} transparent opacity={0} depthWrite={false} toneMapped={false} />
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
