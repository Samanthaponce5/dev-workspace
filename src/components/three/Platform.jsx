import { RoundedBox } from '@react-three/drei'
import { palette } from './materials'

/** The floating slab the whole room sits on, like a toy diorama base. */
export function Platform({ shadows }) {
  return (
    <group>
      <RoundedBox args={[4.8, 0.28, 3.3]} radius={0.08} smoothness={4} position={[0, -0.14, 0]} receiveShadow={shadows}>
        <meshStandardMaterial color={palette.platform} roughness={0.9} metalness={0.05} />
      </RoundedBox>
      {/* A thin lighter rim so the edge reads against the dark page. */}
      <RoundedBox args={[4.82, 0.02, 3.32]} radius={0.01} smoothness={2} position={[0, 0.0, 0]}>
        <meshStandardMaterial color={palette.platformEdge} roughness={0.8} />
      </RoundedBox>
    </group>
  )
}
