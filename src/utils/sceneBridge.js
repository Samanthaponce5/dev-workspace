/*
 * A small bridge to the rubber duck in the 3D scene.
 *
 * The page's intro needs two things from it: where the duck is on screen
 * (so the intro's duck can land on it) and a way to make it appear at
 * exactly that moment. The scene registers both when the duck mounts.
 */
let duck = null

/** Called by the scene's duck. Returns a function that unregisters it. */
export function registerSceneDuck(handle) {
  duck = handle
  return () => {
    if (duck === handle) duck = null
  }
}

/**
 * Where the scene's duck is drawn, in viewport pixels: { left, top, width,
 * height }. Null if the scene isn't ready, or if anything goes wrong; the
 * intro must never depend on getting an answer.
 */
export function getSceneDuckRect() {
  try {
    return duck?.getRect() ?? null
  } catch {
    return null
  }
}

/** Makes the scene's duck visible straight away. Safe to call at any time. */
export function showSceneDuck() {
  duck?.show()
}
