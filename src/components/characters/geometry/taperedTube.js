import * as THREE from 'three'

/**
 * A tube that follows a smooth curve through `points` and changes
 * thickness along its length, for things like a lock of hair.
 *
 * @param {number[][]} points Positions the tube passes through, in order.
 * @param {(t: number) => number} radiusAt Radius at `t`, from 0 (start) to 1 (end).
 */
export function createTaperedTube(points, radiusAt, { lengthSegments = 20, radialSegments = 10 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
  const frames = curve.computeFrenetFrames(lengthSegments, false)
  const positions = []
  const indices = []

  for (let ring = 0; ring <= lengthSegments; ring += 1) {
    const t = ring / lengthSegments
    const centre = curve.getPointAt(t)
    const radius = radiusAt(t)
    const across = frames.normals[ring]
    const up = frames.binormals[ring]

    for (let step = 0; step < radialSegments; step += 1) {
      const angle = (step / radialSegments) * Math.PI * 2
      const cos = Math.cos(angle) * radius
      const sin = Math.sin(angle) * radius
      positions.push(centre.x + cos * across.x + sin * up.x, centre.y + cos * across.y + sin * up.y, centre.z + cos * across.z + sin * up.z)
    }
  }

  for (let ring = 0; ring < lengthSegments; ring += 1) {
    for (let step = 0; step < radialSegments; step += 1) {
      const next = (step + 1) % radialSegments
      const a = ring * radialSegments + step
      const b = ring * radialSegments + next
      const c = (ring + 1) * radialSegments + step
      const d = (ring + 1) * radialSegments + next
      indices.push(a, b, c, b, d, c)
    }
  }

  // Close both ends with a fan around a centre point.
  const closeEnd = (t, ring, flip) => {
    const centre = curve.getPointAt(t)
    const centreIndex = positions.length / 3
    positions.push(centre.x, centre.y, centre.z)
    for (let step = 0; step < radialSegments; step += 1) {
      const a = ring * radialSegments + step
      const b = ring * radialSegments + ((step + 1) % radialSegments)
      indices.push(centreIndex, flip ? a : b, flip ? b : a)
    }
  }
  closeEnd(0, 0, false)
  closeEnd(1, lengthSegments, true)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
