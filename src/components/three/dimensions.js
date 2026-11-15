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

/** Top surface of the riser shelf. */
export const SHELF_Y = DESK.height + DESK.riserHeight + DESK.top / 2
/** Centre line of the riser shelf, front to back. */
export const SHELF_Z = -DESK.depth / 2 + DESK.riserDepth / 2

export const CHAIR_SEAT_HEIGHT = 0.5

/** Where the chair sits; the characters in step 3 use the same spot. */
export const CHAIR_POSITION = [-0.15, 0, 0.95]

/** The whole room is lowered so the desk sits near the camera target. */
export const WORLD_OFFSET_Y = -0.75
