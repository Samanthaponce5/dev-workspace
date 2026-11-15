import * as THREE from 'three'
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
        <meshStandardMaterial color={palette.cup} roughness={0.8} metalness={0.3} side={THREE.DoubleSide} />
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
