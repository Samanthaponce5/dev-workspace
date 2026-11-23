import { RoundedBox } from './RoundedBox'
import { CHAIR_SEAT_HEIGHT as SEAT_HEIGHT, CHAIR_SEAT_TOP } from './dimensions'
import { palette } from './materials'

const BACK = { width: 0.56, height: 0.62, lean: -0.12 }
const STAR_ARMS = 5

function ChairBase({ shadows }) {
  return (
    <>
      <mesh position={[0, 0.05, 0]} castShadow={shadows}>
        <cylinderGeometry args={[0.05, 0.07, 0.08, 12]} />
        <meshStandardMaterial color={palette.chairBlack} roughness={0.7} />
      </mesh>
      {Array.from({ length: STAR_ARMS }, (_, index) => (
        <group key={index} rotation={[0, (index / STAR_ARMS) * Math.PI * 2, 0]}>
          <mesh position={[0.18, 0.05, 0]} rotation={[0, 0, -0.08]} castShadow={shadows}>
            <boxGeometry args={[0.34, 0.035, 0.05]} />
            <meshStandardMaterial color={palette.chairBlack} roughness={0.7} />
          </mesh>
          <mesh position={[0.34, 0.03, 0]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshStandardMaterial color="#1d1e24" roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Gas lift */}
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.36, 10]} />
        <meshStandardMaterial color={palette.metalDark} roughness={0.4} metalness={0.7} />
      </mesh>
    </>
  )
}

/**
 * Black-and-white racing-style gaming chair, no logos. The five-star base
 * stays put while the seat, back and arms sit in a swivel group that
 * `swivelRef` can rotate. Children are placed on the seat cushion and
 * turn with it.
 */
export function Chair({ position = [0, 0, 0], rotation = [0, 0, 0], swivelRef, shadows, children }) {
  const black = <meshStandardMaterial color={palette.chairBlack} roughness={0.7} />
  const white = <meshStandardMaterial color={palette.chairWhite} roughness={0.6} />

  return (
    <group position={position} rotation={rotation}>
      <ChairBase shadows={shadows} />

      <group ref={swivelRef}>
        {/* Seat with side bolsters */}
        <RoundedBox args={[0.56, 0.1, 0.56]} radius={0.04} smoothness={4} position={[0, SEAT_HEIGHT, 0]} castShadow={shadows} receiveShadow={shadows}>
          {black}
        </RoundedBox>
        {[-1, 1].map((side) => (
          <RoundedBox key={side} args={[0.1, 0.08, 0.5]} radius={0.03} smoothness={3} position={[side * 0.26, SEAT_HEIGHT + 0.06, 0]} castShadow={shadows}>
            {black}
          </RoundedBox>
        ))}

        {/* Backrest, leaning back slightly */}
        <group position={[0, SEAT_HEIGHT + 0.05, -0.27]} rotation={[BACK.lean, 0, 0]}>
          <RoundedBox args={[BACK.width, BACK.height, 0.1]} radius={0.04} smoothness={4} position={[0, BACK.height / 2, 0]} castShadow={shadows}>
            {black}
          </RoundedBox>
          {/* White stripes on both faces of the backrest */}
          {[-1, 1].flatMap((side) =>
            [0.052, -0.052].map((face) => (
              <mesh key={`${side}${face}`} position={[side * 0.1, BACK.height / 2, face]}>
                <boxGeometry args={[0.075, BACK.height - 0.16, 0.004]} />
                {white}
              </mesh>
            )),
          )}
          {/* Shoulder wings */}
          {[-1, 1].map((side) => (
            <RoundedBox key={side} args={[0.09, 0.34, 0.14]} radius={0.03} smoothness={3} position={[side * 0.29, BACK.height * 0.62, 0.02]} castShadow={shadows}>
              {black}
            </RoundedBox>
          ))}
          {/* Headrest */}
          <RoundedBox args={[0.38, 0.16, 0.1]} radius={0.04} smoothness={4} position={[0, BACK.height + 0.05, 0]} castShadow={shadows}>
            {black}
          </RoundedBox>
        </group>

        {/* Armrests */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.34, SEAT_HEIGHT, 0.02]}>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              {black}
            </mesh>
            <RoundedBox args={[0.08, 0.04, 0.3]} radius={0.015} smoothness={3} position={[0, 0.22, 0]} castShadow={shadows}>
              {black}
            </RoundedBox>
          </group>
        ))}

        <group position={[0, CHAIR_SEAT_TOP, 0]}>{children}</group>
      </group>
    </group>
  )
}
