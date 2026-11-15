import { palette } from '../materials'

/* Leaf angles for the spiky plant: [rotation around Y, lean outward]. */
const LEAVES = [
  [0, 0.55],
  [0.9, 0.7],
  [1.8, 0.5],
  [2.6, 0.75],
  [3.5, 0.6],
  [4.3, 0.8],
  [5.2, 0.5],
  [5.9, 0.7],
]

/** Spiky green plant in a terracotta pot. */
export function PottedPlant({ position, shadows }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.08, 0.06, 0.18, 14]} />
        <meshStandardMaterial color={palette.terracotta} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.02, 14]} />
        <meshStandardMaterial color={palette.soil} roughness={1} />
      </mesh>
      {LEAVES.map(([turn, lean], index) => (
        <group key={index} position={[0, 0.17, 0]} rotation={[0, turn, 0]}>
          <mesh position={[0, 0.16, 0]} rotation={[0, 0, -lean]} castShadow={shadows}>
            <coneGeometry args={[0.028, 0.34, 5]} />
            <meshStandardMaterial color={index % 2 ? palette.leaf : palette.leafLight} roughness={0.7} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const MOSS_BUMPS = [
  [0, 0.02, 0, 0.055],
  [0.05, 0.015, 0.03, 0.045],
  [-0.05, 0.015, 0.02, 0.04],
  [0.02, 0.012, -0.05, 0.045],
  [-0.03, 0.012, -0.04, 0.04],
]

/** Small grey-blue planter with moss and a succulent. */
export function Succulent({ position, shadows }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} castShadow={shadows}>
        <boxGeometry args={[0.22, 0.12, 0.16]} />
        <meshStandardMaterial color={palette.planter} roughness={0.9} />
      </mesh>
      {MOSS_BUMPS.map(([x, y, z, radius], index) => (
        <mesh key={index} position={[x, 0.12 + y, z]}>
          <sphereGeometry args={[radius, 10, 8]} />
          <meshStandardMaterial color={index % 2 ? palette.succulent : palette.leaf} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}
