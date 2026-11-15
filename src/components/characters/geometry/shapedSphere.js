import * as THREE from 'three'

const direction = new THREE.Vector3()
const point = new THREE.Vector3()
const normal = new THREE.Vector3()
const other = new THREE.Vector3()
const color = new THREE.Color()

/* The seam column appears twice in a sphere's grid; give both copies the same normal. */
function smoothSeam(geometry, widthSegments, heightSegments) {
  const normals = geometry.attributes.normal
  const rowLength = widthSegments + 1
  for (let row = 0; row <= heightSegments; row += 1) {
    const first = row * rowLength
    const last = first + widthSegments
    normal.fromBufferAttribute(normals, first).add(other.fromBufferAttribute(normals, last)).normalize()
    normals.setXYZ(first, normal.x, normal.y, normal.z)
    normals.setXYZ(last, normal.x, normal.y, normal.z)
  }
}

/**
 * Builds one smooth, closed mesh by moving every point of a sphere.
 *
 * Start from a unit sphere; for each of its points, `place` decides where
 * that point ends up and `paint` (optional) decides its colour. Because
 * the whole surface comes from two small functions, shapes such as a head
 * with cheeks, or hair with a parting, flow together with no joins.
 *
 * @param {object} options
 * @param {(direction: THREE.Vector3, target: THREE.Vector3) => void} options.place
 *   Receives a unit vector from the centre and writes the final position.
 * @param {(direction: THREE.Vector3, target: THREE.Color) => void} [options.paint]
 *   Writes a vertex colour. Use a material with `vertexColors` to see it.
 * @param {number} [options.widthSegments]
 * @param {number} [options.heightSegments]
 */
export function createShapedSphere({ place, paint, widthSegments = 64, heightSegments = 48 }) {
  const geometry = new THREE.SphereGeometry(1, widthSegments, heightSegments)
  // Turn the sphere so its seam runs down the back, out of sight.
  geometry.rotateY(-Math.PI / 2)

  const positions = geometry.attributes.position
  const colors = paint ? new Float32Array(positions.count * 3) : null

  for (let index = 0; index < positions.count; index += 1) {
    direction.fromBufferAttribute(positions, index).normalize()
    if (colors) {
      paint(direction, color)
      colors[index * 3] = color.r
      colors[index * 3 + 1] = color.g
      colors[index * 3 + 2] = color.b
    }
    place(direction, point)
    positions.setXYZ(index, point.x, point.y, point.z)
  }

  if (colors) geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.deleteAttribute('uv')
  geometry.computeVertexNormals()
  smoothSeam(geometry, widthSegments, heightSegments)
  return geometry
}

/** A soft bump centred on `centre`: 1 at the centre, fading to 0 around `width` away. */
export function bump(direction, centre, width) {
  return Math.exp(-direction.distanceToSquared(centre) / (width * width))
}
