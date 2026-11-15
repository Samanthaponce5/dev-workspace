import { RoundedBox } from '@react-three/drei'
import { palette } from '../materials'
import { useClockTexture } from '../textures/useClockTexture'

const SIZE = { width: 0.42, height: 0.16, depth: 0.1 }

/** Small wooden digital clock showing the visitor's local time. */
export function Clock({ position, temperature, shadows }) {
  const faceTexture = useClockTexture(temperature)

  return (
    <group position={position}>
      <RoundedBox args={[SIZE.width, SIZE.height, SIZE.depth]} radius={0.012} smoothness={3} position={[0, SIZE.height / 2, 0]} castShadow={shadows}>
        <meshStandardMaterial color={palette.clockWood} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, SIZE.height / 2, SIZE.depth / 2 + 0.001]}>
        <planeGeometry args={[SIZE.width - 0.03, SIZE.height - 0.04]} />
        <meshStandardMaterial
          map={faceTexture}
          emissiveMap={faceTexture}
          emissive="#ffffff"
          emissiveIntensity={1.3}
          color={palette.clockFace}
          roughness={0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
