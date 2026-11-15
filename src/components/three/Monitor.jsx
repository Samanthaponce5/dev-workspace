import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { DESK } from './dimensions'
import { lightLevels, palette } from './materials'
import { useCodeScreenTexture } from './textures/useCodeScreenTexture'

const SCREEN = {
  width: 2.3,
  height: 0.78,
  radius: 3.2, // curvature radius; smaller is more curved
  bezel: 0.035,
  standHeight: 0.18,
}

const NAME_DELAY_MS = 2200

/**
 * Curved ultrawide monitor on the riser shelf. The screen is a slice of a
 * cylinder viewed from the inside so it curves toward the viewer.
 */
export function Monitor({ lines, shadows }) {
  const [showName, setShowName] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setShowName(true), NAME_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [])

  // Viewed from inside the cylinder the UVs run right-to-left, so mirror.
  const screenTexture = useCodeScreenTexture({ showName, lines, mirrorX: true })

  const { width, height, radius, bezel, standHeight } = SCREEN
  const arc = width / radius
  const thetaStart = Math.PI - arc / 2

  const shelfTop = DESK.height + DESK.riserHeight + DESK.top / 2
  const screenCenterY = shelfTop + standHeight + height / 2
  const screenZ = -DESK.depth / 2 + DESK.riserDepth / 2 - 0.02
  // The cylinder axis sits in front of the screen, toward the viewer.
  const axisZ = screenZ + radius

  const geometries = useMemo(
    () => ({
      screen: new THREE.CylinderGeometry(radius, radius, height, 48, 1, true, thetaStart, arc),
      bezel: new THREE.CylinderGeometry(
        radius + 0.004,
        radius + 0.004,
        height + bezel * 2,
        48,
        1,
        true,
        thetaStart - bezel / radius,
        arc + (2 * bezel) / radius,
      ),
      back: new THREE.CylinderGeometry(
        radius + 0.06,
        radius + 0.06,
        height + bezel * 2,
        48,
        1,
        true,
        thetaStart - bezel / radius,
        arc + (2 * bezel) / radius,
      ),
    }),
    [radius, height, thetaStart, arc, bezel],
  )
  useEffect(() => () => Object.values(geometries).forEach((geometry) => geometry.dispose()), [geometries])

  return (
    <group>
      <group position={[0, screenCenterY, axisZ]}>
        <mesh geometry={geometries.screen}>
          <meshStandardMaterial
            map={screenTexture}
            emissiveMap={screenTexture}
            emissive="#ffffff"
            emissiveIntensity={1.15}
            color="#000000"
            roughness={0.35}
            side={THREE.BackSide}
            toneMapped={false}
          />
        </mesh>
        <mesh geometry={geometries.bezel}>
          <meshStandardMaterial color={palette.monitorBody} roughness={0.6} metalness={0.2} side={THREE.BackSide} />
        </mesh>
        <mesh geometry={geometries.back} castShadow={shadows}>
          <meshStandardMaterial color={palette.monitorBody} roughness={0.6} metalness={0.2} />
        </mesh>
      </group>

      {/* Stand: a slim neck and a flat foot */}
      <mesh position={[0, shelfTop + standHeight / 2, screenZ + 0.06]} castShadow={shadows}>
        <boxGeometry args={[0.16, standHeight, 0.05]} />
        <meshStandardMaterial color={palette.metalDark} roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, shelfTop + 0.012, screenZ + 0.12]} castShadow={shadows}>
        <boxGeometry args={[0.6, 0.024, 0.22]} />
        <meshStandardMaterial color={palette.metalDark} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Screen light spilling onto the desk and the person at it */}
      <pointLight position={[0, screenCenterY, screenZ + 0.6]} intensity={lightLevels.monitor} color="#9fb4ff" distance={3.2} decay={2} />
    </group>
  )
}
