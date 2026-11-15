import { RoundedBox } from '@react-three/drei'
import { CHAIR_SEAT_HEIGHT as SEAT_HEIGHT } from './dimensions'
import { palette } from './materials'

/**
 * Black-and-white racing-style gaming chair. Built from rounded boxes with
 * white stripe inserts on the seat and backrest. No logos.
 */
export function Chair({ position = [0, 0, 0], rotation = [0, 0, 0], shadows }) {
  const black = <meshStandardMaterial color={palette.chairBlack} roughness={0.7} />
  const white = <meshStandardMaterial color={palette.chairWhite} roughness={0.6} />

  return (
    <group position={position} rotation={rotation}>
      {/* Five-star base with wheels */}
      <mesh position={[0, 0.05, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.05, 0.07, 0.08, 12]} />
        {black}
      </mesh>
      {Array.from({ length: 5 }, (_, index) => {
        const angle = (index / 5) * Math.PI * 2
        return (
          <group key={index} rotation={[0, angle, 0]}>
            <mesh position={[0.18, 0.05, 0]} rotation={[0, 0, -0.08]} castShadow={shadows}>
              <boxGeometry args={[0.34, 0.035, 0.05]} />
              {black}
            </mesh>
            <mesh position={[0.34, 0.03, 0]}>
              <sphereGeometry args={[0.035, 10, 8]} />
              <meshStandardMaterial color="#1d1e24" roughness={0.4} metalness={0.3} />
            </mesh>
          </group>
        )
      })}

      {/* Gas lift */}
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.36, 10]} />
        <meshStandardMaterial color={palette.metalDark} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Seat with side bolsters */}
      <RoundedBox args={[0.56, 0.1, 0.56]} radius={0.04} smoothness={4} position={[0, SEAT_HEIGHT, 0]} castShadow={shadows} receiveShadow={shadows}>
        {black}
      </RoundedBox>
      <mesh position={[0, SEAT_HEIGHT + 0.051, 0.02]}>
        <boxGeometry args={[0.2, 0.004, 0.44]} />
        {white}
      </mesh>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[0.1, 0.08, 0.5]} radius={0.03} smoothness={3} position={[side * 0.26, SEAT_HEIGHT + 0.07, 0]} castShadow={shadows}>
          {black}
        </RoundedBox>
      ))}

      {/* Backrest, leaning back slightly */}
      <group position={[0, SEAT_HEIGHT + 0.05, -0.25]} rotation={[-0.12, 0, 0]}>
        <RoundedBox args={[0.56, 0.78, 0.1]} radius={0.04} smoothness={4} position={[0, 0.39, 0]} castShadow={shadows}>
          {black}
        </RoundedBox>
        {/* White stripes on both faces of the backrest */}
        {[-1, 1].flatMap((side) =>
          [0.052, -0.052].map((face) => (
            <mesh key={``} position={[side * 0.1, 0.4, face]}>
              <boxGeometry args={[0.07, 0.6, 0.004]} />
              {white}
            </mesh>
          )),
        )}
        {/* Shoulder wings */}
        {[-1, 1].map((side) => (
          <RoundedBox key={side} args={[0.09, 0.4, 0.14]} radius={0.03} smoothness={3} position={[side * 0.29, 0.5, 0.02]} castShadow={shadows}>
            {black}
          </RoundedBox>
        ))}
        {/* Headrest */}
        <RoundedBox args={[0.4, 0.2, 0.1]} radius={0.04} smoothness={4} position={[0, 0.86, 0.01]} castShadow={shadows}>
          {black}
        </RoundedBox>
        <mesh position={[0, 0.86, 0.062]}>
          <boxGeometry args={[0.18, 0.1, 0.004]} />
          {white}
        </mesh>
      </group>

      {/* Armrests */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.33, SEAT_HEIGHT, 0.02]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.04, 0.2, 0.04]} />
            {black}
          </mesh>
          <RoundedBox args={[0.08, 0.04, 0.3]} radius={0.015} smoothness={3} position={[0, 0.22, 0]} castShadow={shadows}>
            {black}
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}
