import { RoundedBox } from '@react-three/drei'
import { DESK } from './dimensions'
import { palette } from './materials'
import { useWoodTexture } from './textures/useWoodTexture'

/** Black wood-grain desk with a raised shelf along the back. */
export function Desk({ shadows }) {
  const wood = useWoodTexture(palette.deskWood, palette.deskGrain)
  const { width, depth, height, top, riserHeight, riserDepth } = DESK
  const riserZ = -depth / 2 + riserDepth / 2

  return (
    <group>
      {/* Desk top */}
      <RoundedBox
        args={[width, top, depth]}
        radius={0.015}
        smoothness={3}
        position={[0, height - top / 2, 0]}
        castShadow={shadows}
        receiveShadow={shadows}
      >
        <meshStandardMaterial map={wood} roughness={0.55} metalness={0.1} />
      </RoundedBox>

      {/* Riser shelf at the back */}
      <RoundedBox
        args={[width, top, riserDepth]}
        radius={0.015}
        smoothness={3}
        position={[0, height + riserHeight, riserZ]}
        castShadow={shadows}
        receiveShadow={shadows}
      >
        <meshStandardMaterial map={wood} roughness={0.55} metalness={0.1} />
      </RoundedBox>

      {/* Riser supports */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - 0.06), height + riserHeight / 2 - top / 2, riserZ]} castShadow={shadows}>
          <boxGeometry args={[0.04, riserHeight - top, riserDepth - 0.04]} />
          <meshStandardMaterial color={palette.metalDark} roughness={0.5} metalness={0.5} />
        </mesh>
      ))}

      {/* Legs: slim steel frame */}
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x * (width / 2 - 0.08), (height - top) / 2, z * (depth / 2 - 0.08)]} castShadow={shadows}>
          <boxGeometry args={[0.06, height - top, 0.06]} />
          <meshStandardMaterial color={palette.metalDark} roughness={0.45} metalness={0.6} />
        </mesh>
      ))}

      {/* Cross bar at the back */}
      <mesh position={[0, 0.22, -depth / 2 + 0.08]}>
        <boxGeometry args={[width - 0.16, 0.05, 0.04]} />
        <meshStandardMaterial color={palette.metalDark} roughness={0.45} metalness={0.6} />
      </mesh>
    </group>
  )
}
