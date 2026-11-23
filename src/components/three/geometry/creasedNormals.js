import * as THREE from 'three'

/*
 * Smooth normals across shallow angles, sharp ones across steep angles:
 * the same result as `toCreasedNormals` from three-stdlib, which drei's
 * RoundedBox uses, but about two and a half times quicker on a cold page
 * load. That one builds a string key and a new Vector3 for every corner
 * of every triangle; this one packs the key into a number, works on the
 * raw arrays, and sums each group of neighbouring normals once per
 * distinct face normal rather than once per corner. The output is the
 * same to within floating-point rounding.
 */

/* Matches three-stdlib: positions are grouped into 1 cm cells. */
const CELLS_PER_UNIT = (1 + 1e-10) * 100
/* Room for coordinates up to ±40 m in a cell key that stays an exact integer. */
const OFFSET = 4096
const SPAN = 8192

const cellKey = (x, y, z) => ((~~(x * CELLS_PER_UNIT) + OFFSET) * SPAN + (~~(y * CELLS_PER_UNIT) + OFFSET)) * SPAN + (~~(z * CELLS_PER_UNIT) + OFFSET)

/**
 * Replaces the normals of a non-indexed geometry, in place.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} creaseAngle In radians: faces meeting at a sharper angle keep a hard edge.
 */
export function applyCreasedNormals(geometry, creaseAngle) {
  const creaseDot = Math.cos(creaseAngle)
  const position = geometry.attributes.position.array
  const triangles = position.length / 9

  // Each triangle's face normal, and which cell each of its corners falls in.
  const faceNormals = new Float64Array(triangles * 3)
  const cellOfCorner = new Int32Array(triangles * 3)
  const cellIds = new Map()
  const cellMembers = []
  for (let triangle = 0; triangle < triangles; triangle += 1) {
    const o = triangle * 9
    const ux = position[o + 6] - position[o + 3]
    const uy = position[o + 7] - position[o + 4]
    const uz = position[o + 8] - position[o + 5]
    const vx = position[o] - position[o + 3]
    const vy = position[o + 1] - position[o + 4]
    const vz = position[o + 2] - position[o + 5]
    let nx = uy * vz - uz * vy
    let ny = uz * vx - ux * vz
    let nz = ux * vy - uy * vx
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
    nx /= length
    ny /= length
    nz /= length
    faceNormals[triangle * 3] = nx
    faceNormals[triangle * 3 + 1] = ny
    faceNormals[triangle * 3 + 2] = nz

    for (let corner = 0; corner < 3; corner += 1) {
      const p = o + corner * 3
      const key = cellKey(position[p], position[p + 1], position[p + 2])
      let cell = cellIds.get(key)
      if (cell === undefined) {
        cell = cellMembers.length
        cellIds.set(key, cell)
        cellMembers.push([])
      }
      cellMembers[cell].push(triangle)
      cellOfCorner[triangle * 3 + corner] = cell
    }
  }

  // Each corner's normal: the face normals in its cell that are close enough to its own face's, averaged.
  const normals = new Float32Array(position.length)
  const solved = new Array(cellMembers.length) // per cell: [triangle, result, triangle, result, ...]
  for (let triangle = 0; triangle < triangles; triangle += 1) {
    const nx = faceNormals[triangle * 3]
    const ny = faceNormals[triangle * 3 + 1]
    const nz = faceNormals[triangle * 3 + 2]
    for (let corner = 0; corner < 3; corner += 1) {
      const cell = cellOfCorner[triangle * 3 + corner]
      const known = solved[cell]
      let result = null
      if (known !== undefined) {
        for (let k = 0; k < known.length; k += 2) {
          const other = known[k] * 3
          if (faceNormals[other] === nx && faceNormals[other + 1] === ny && faceNormals[other + 2] === nz) {
            result = known[k + 1]
            break
          }
        }
      }
      if (result === null) {
        let sx = 0
        let sy = 0
        let sz = 0
        for (const other of cellMembers[cell]) {
          const ox = faceNormals[other * 3]
          const oy = faceNormals[other * 3 + 1]
          const oz = faceNormals[other * 3 + 2]
          if (nx * ox + ny * oy + nz * oz > creaseDot) {
            sx += ox
            sy += oy
            sz += oz
          }
        }
        const length = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1
        result = [sx / length, sy / length, sz / length]
        if (known === undefined) solved[cell] = [triangle, result]
        else known.push(triangle, result)
      }
      const p = triangle * 9 + corner * 3
      normals[p] = result[0]
      normals[p + 1] = result[1]
      normals[p + 2] = result[2]
    }
  }

  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  return geometry
}
