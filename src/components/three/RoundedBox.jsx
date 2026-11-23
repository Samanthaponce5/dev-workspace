import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { applyCreasedNormals } from './geometry/creasedNormals'

const EPSILON = 0.00001

/* A rounded rectangle, extruded and bevelled into a box: the same construction as drei's RoundedBox. */
function roundedRectangle(width, height, radius) {
  const shape = new THREE.Shape()
  const r = radius - EPSILON
  shape.absarc(EPSILON, EPSILON, EPSILON, -Math.PI / 2, -Math.PI, true)
  shape.absarc(EPSILON, height - r * 2, EPSILON, Math.PI, Math.PI / 2, true)
  shape.absarc(width - r * 2, height - r * 2, EPSILON, Math.PI / 2, 0, true)
  shape.absarc(width - r * 2, EPSILON, EPSILON, 0, -Math.PI / 2, true)
  return shape
}

/**
 * A box with rounded edges. A drop-in for drei's RoundedBox, with the same
 * props and the same geometry, texture coordinates and shading, built
 * faster (see geometry/creasedNormals.js). The scene has over a dozen of
 * these, so it matters while the scene starts up.
 */
export function RoundedBox({ args: [width = 1, height = 1, depth = 1] = [], radius = 0.05, steps = 1, smoothness = 4, bevelSegments = 4, creaseAngle = 0.4, children, ...meshProps }) {
  const geometry = useMemo(() => {
    const extruded = new THREE.ExtrudeGeometry(roundedRectangle(width, height, radius), {
      depth: depth - radius * 2,
      bevelEnabled: true,
      bevelSegments: bevelSegments * 2,
      steps,
      bevelSize: radius - EPSILON,
      bevelThickness: radius,
      curveSegments: smoothness,
    })
    extruded.center()
    return applyCreasedNormals(extruded, creaseAngle)
  }, [width, height, depth, radius, steps, smoothness, bevelSegments, creaseAngle])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} {...meshProps}>
      {children}
    </mesh>
  )
}
