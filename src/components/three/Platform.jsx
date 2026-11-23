import { RoundedBox } from './RoundedBox'
import { PLATFORM } from './dimensions'
import { useSceneTheme } from './sceneTheme'

/** The floating slab the whole room sits on, like a toy diorama base. Its colours follow the site's theme. */
export function Platform({ shadows }) {
  const { width, depth, thickness } = PLATFORM
  const theme = useSceneTheme()

  return (
    <group>
      <RoundedBox args={[width, thickness, depth]} radius={0.14} smoothness={5} position={[0, -thickness / 2, 0]} receiveShadow={shadows}>
        <meshStandardMaterial color={theme.platformSide} roughness={0.85} metalness={0.05} />
      </RoundedBox>
      {/* A brighter top face, inset so the rounded edge reads as a darker rim. */}
      <RoundedBox args={[width - 0.16, 0.02, depth - 0.16]} radius={0.01} smoothness={2} position={[0, 0.001, 0]} receiveShadow={shadows}>
        <meshStandardMaterial color={theme.platform} roughness={0.8} metalness={0.05} />
      </RoundedBox>
    </group>
  )
}
