import { palette } from '../materials'

const PEN_OFFSETS = [
  [0, 0],
  [0.02, 0.018],
  [-0.022, 0.012],
  [0.01, -0.022],
  [-0.014, -0.016],
]

/** Black mesh pencil cup with a handful of coloured pens. */
export function PencilCup({ position, shadows }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.07, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.05, 0.045, 0.14, 16, 1, true]} />
        <meshStandardMaterial color={palette.cup} roughness={0.8} metalness={0.3} side={2} />
      </mesh>
      <mesh position={[0, 0.002, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.004, 16]} />
        <meshStandardMaterial color={palette.cup} roughness={0.8} />
      </mesh>
      {PEN_OFFSETS.map(([x, z], index) => (
        <mesh key={index} position={[x, 0.11, z]} rotation={[x * 3, 0, z * 3]}>
          <cylinderGeometry args={[0.005, 0.005, 0.2, 6]} />
          <meshStandardMaterial color={palette.pens[index % palette.pens.length]} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

/** Clear water bottle with a blue cap. */
export function WaterBottle({ position, shadows }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.13, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.045, 0.05, 0.26, 16]} />
        <meshStandardMaterial color={palette.bottle} roughness={0.15} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.038, 0.043, 0.19, 16]} />
        <meshStandardMaterial color="#7fb0ff" roughness={0.2} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0.275, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.03, 12]} />
        <meshStandardMaterial color={palette.bottle} roughness={0.15} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.025, 12]} />
        <meshStandardMaterial color={palette.bottleCap} roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Short drinking glass, half full. */
export function Glass({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.04, 0.034, 0.11, 16, 1, true]} />
        <meshStandardMaterial color={palette.glass} roughness={0.1} transparent opacity={0.3} side={2} />
      </mesh>
      <mesh position={[0, 0.003, 0]}>
        <cylinderGeometry args={[0.034, 0.034, 0.006, 16]} />
        <meshStandardMaterial color={palette.glass} roughness={0.1} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.035, 0.032, 0.05, 16]} />
        <meshStandardMaterial color="#8db6ff" roughness={0.2} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}
