/*
 * Shared measurements for the diorama, in scene units (roughly metres).
 * Kept apart from the components so Fast Refresh keeps working and so
 * props can be placed relative to the desk without importing it.
 */
export const DESK = {
  width: 3.4,
  depth: 1.5,
  height: 1.0,
  top: 0.05,
  riserHeight: 0.22,
  riserDepth: 0.42,
}

export const PLATFORM = { width: 4.8, depth: 3.3, thickness: 0.34 }

/** Top surface of the riser shelf. */
export const SHELF_Y = DESK.height + DESK.riserHeight + DESK.top / 2
/** Centre line of the riser shelf, front to back. */
export const SHELF_Z = -DESK.depth / 2 + DESK.riserDepth / 2

export const CHAIR_SEAT_HEIGHT = 0.5
/** Top of the seat cushion, where a seated character's hips rest. */
export const CHAIR_SEAT_TOP = CHAIR_SEAT_HEIGHT + 0.05

export const CHAIR_POSITION = [-0.15, 0, 0.96]
export const ANDY_POSITION = [0.68, 0, 1.3]

/** The whole room is lowered so the desk sits near the world origin. */
export const WORLD_OFFSET_Y = -0.75

const MONITOR_TOP = 2.3
const SAM_TOP = 1.9
const halfDeskW = DESK.width / 2
const halfDeskD = DESK.depth / 2
const halfPlatW = PLATFORM.width / 2
const halfPlatD = PLATFORM.depth / 2

const corners = (halfW, halfD, y) => [
  [-halfW, y, -halfD],
  [halfW, y, -halfD],
  [-halfW, y, halfD],
  [halfW, y, halfD],
]
const lowered = (points) => points.map(([x, y, z]) => [x, y + WORLD_OFFSET_Y, z])

const tallThings = [
  [-1.15, MONITOR_TOP, SHELF_Z],
  [1.15, MONITOR_TOP, SHELF_Z],
  [CHAIR_POSITION[0], SAM_TOP, CHAIR_POSITION[2]],
]

/*
 * Points the camera fits into view, in world space.
 * `room` is everything including the platform; `desk` is the furniture
 * and characters only, used where the platform is allowed to run off
 * the sides of a narrow screen.
 */
export const FIT_POINTS = {
  room: lowered([...corners(halfPlatW, halfPlatD, 0), ...corners(halfPlatW, halfPlatD, -PLATFORM.thickness), ...tallThings]),
  desk: lowered([
    ...corners(halfDeskW, halfDeskD, DESK.height),
    ...corners(halfDeskW, halfDeskD, 0),
    ...tallThings,
    [CHAIR_POSITION[0], 0, CHAIR_POSITION[2] + 0.45],
    [ANDY_POSITION[0] + 0.15, 0, ANDY_POSITION[2] + 0.2],
  ]),
}
