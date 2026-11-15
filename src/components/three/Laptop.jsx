import { RoundedBox } from '@react-three/drei'
import { DESK } from './dimensions'
import { palette } from './materials'
import { useLaptopScreenTexture } from './textures/useLaptopScreenTexture'

const BASE = { width: 0.78, depth: 0.54, thickness: 0.025 }
const LID = { height: 0.5, thickness: 0.016, tilt: -1.78 } // radians, leaning back a little
// Corner radius must stay below half the lid's thickness, or the lid bulges past the screen.
const LID_RADIUS = 0.006
const SCREEN_GAP = 0.0015 // the screen sits this far proud of the lid

/** Dark-grey laptop open on the desk in front of the monitor, showing a Q&A page. */
export function Laptop({ position = [0, 0, 0], content, shadows }) {
  const screenTexture = useLaptopScreenTexture(content)
  const y = DESK.height + BASE.thickness / 2

  return (
    <group position={[position[0], y, position[2]]}>
      <RoundedBox args={[BASE.width, BASE.thickness, BASE.depth]} radius={0.01} smoothness={3} castShadow={shadows} receiveShadow={shadows}>
        <meshStandardMaterial color={palette.laptopBody} roughness={0.4} metalness={0.6} />
      </RoundedBox>

      {/* Keyboard well and trackpad */}
      <mesh position={[0, BASE.thickness / 2 + 0.002, -0.04]}>
        <boxGeometry args={[BASE.width - 0.12, 0.004, 0.2]} />
        <meshStandardMaterial color={palette.laptopKeys} roughness={0.8} />
      </mesh>
      <mesh position={[0, BASE.thickness / 2 + 0.002, 0.16]}>
        <boxGeometry args={[0.24, 0.003, 0.14]} />
        <meshStandardMaterial color="#45484f" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Lid, hinged at the back edge */}
      <group position={[0, BASE.thickness / 2, -BASE.depth / 2 + 0.01]} rotation={[LID.tilt, 0, 0]}>
        <RoundedBox args={[BASE.width, LID.thickness, LID.height]} radius={LID_RADIUS} smoothness={3} position={[0, 0, LID.height / 2]} castShadow={shadows}>
          <meshStandardMaterial color={palette.laptopBody} roughness={0.4} metalness={0.6} />
        </RoundedBox>
        {/* Lit screen on the inside of the lid */}
        <mesh position={[0, -LID.thickness / 2 - SCREEN_GAP, LID.height / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[BASE.width - 0.06, LID.height - 0.06]} />
          <meshStandardMaterial map={screenTexture} emissiveMap={screenTexture} emissive="#ffffff" emissiveIntensity={0.9} color="#000000" roughness={0.6} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}
