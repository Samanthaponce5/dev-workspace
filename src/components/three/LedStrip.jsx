import { DESK } from './dimensions'
import { useSceneTheme } from './sceneTheme'

/**
 * Two glowing LED strips: one across the back of the riser behind the
 * monitor, one tucked under the shelf. They are emissive bars; the actual
 * light they throw comes from the point lights in Lighting.jsx. Their
 * colour and brightness follow the site's theme.
 */
export function LedStrip() {
  const theme = useSceneTheme()
  const backY = DESK.height + DESK.riserHeight + 0.06
  const backZ = -DESK.depth / 2 + 0.02
  const underY = DESK.height + DESK.riserHeight - DESK.top - 0.012
  const underZ = -DESK.depth / 2 + DESK.riserDepth - 0.05

  return (
    <group>
      <mesh position={[0, backY, backZ]}>
        <boxGeometry args={[DESK.width - 0.3, 0.025, 0.025]} />
        <meshStandardMaterial color={theme.led} emissive={theme.led} emissiveIntensity={theme.ledGlow} toneMapped={false} />
      </mesh>
      <mesh position={[0, underY, underZ]}>
        <boxGeometry args={[DESK.width - 0.3, 0.02, 0.02]} />
        <meshStandardMaterial color={theme.led} emissive={theme.led} emissiveIntensity={theme.ledGlow} toneMapped={false} />
      </mesh>
    </group>
  )
}
