import * as THREE from 'three'

const { smoothstep } = THREE.MathUtils

const easeOutCubic = (x) => 1 - (1 - x) ** 3
const easeInOutQuad = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)

/*
 * Timelines for Mini-Samantha's two greetings, in seconds.
 *
 * Intro (plays once, when the scene first appears): she starts out facing
 * the visitor, waves, then turns to the desk and starts typing.
 * Hover (any time afterwards): she spins the chair round from the desk,
 * waves, and swivels back.
 */
export const INTRO = {
  delay: 0, // she waves the moment the intro has cleared; no fixed wait
  raise: 0.4, // time to lift her arm
  waveEnd: 1.9, // wave finished; her speech bubble goes away
  returnEnd: 2.8, // back at the keyboard, which is the duck's cue to speak
}
export const HOVER = {
  spinEnd: 1.25,
  waveEnd: 3.1,
  returnEnd: 4.0,
}

/** The speech bubble starts fading this long before it goes. */
const BUBBLE_FADE = 0.36

const FULL_TURN = Math.PI * 2

/** Chair angle that faces the visitor, given the camera's angle round the desk. */
export const facingAngle = (cameraAzimuth) => Math.PI + cameraAzimuth

/** The pose she holds while working. `angle` is the chair's swivel. */
export function setWorkingPose(pose) {
  pose.angle = 0
  pose.typing = 1
  pose.wave = 0
  pose.bounce = 0
  pose.bubble = false
  pose.bubbleLeaving = false
}

function hop(sinceStart, animate) {
  const progress = sinceStart / 0.45
  return animate && progress > 0 && progress < 1 ? Math.sin(progress * Math.PI) * 0.035 : 0
}

/*
 * Both functions write the pose for time `t` into `pose` and return true
 * once the greeting has finished. `bubble` says whether her speech bubble
 * is up, and `bubbleLeaving` that it should be fading out. With `animate` false (reduced motion)
 * they hold still poses and change state without turning or bouncing.
 */

/** `t` is negative while waiting for the scene to appear. */
export function writeIntroPose(pose, t, face, animate) {
  if (t >= INTRO.returnEnd) return true

  pose.typing = 0
  pose.bounce = 0

  if (t < INTRO.waveEnd) {
    pose.angle = face
    pose.wave = t < 0 ? 0 : smoothstep(t, 0, INTRO.raise)
    pose.bounce = hop(t, animate)
    pose.bubble = t >= 0
    pose.bubbleLeaving = t > INTRO.waveEnd - BUBBLE_FADE
    return false
  }

  const progress = easeInOutQuad((t - INTRO.waveEnd) / (INTRO.returnEnd - INTRO.waveEnd))
  // Carry on round the same way; a full turn is the same as facing the desk.
  pose.angle = animate ? face + progress * (FULL_TURN - face) : 0
  pose.wave = 1 - smoothstep(progress, 0, 0.35)
  pose.typing = smoothstep(progress, 0.6, 1)
  pose.bubble = false
  return false
}

export function writeHoverPose(pose, t, face, animate) {
  if (t >= HOVER.returnEnd) return true

  // One extra full turn on the way round makes it a proper chair spin.
  const faceAfterSpin = face + (animate ? FULL_TURN : 0)
  const backAtDesk = animate ? FULL_TURN * 2 : FULL_TURN
  pose.bounce = 0

  if (t < HOVER.spinEnd) {
    pose.angle = (animate ? easeOutCubic(t / HOVER.spinEnd) : 1) * faceAfterSpin
    pose.typing = 1 - smoothstep(t, 0, 0.25)
    pose.wave = smoothstep(t, HOVER.spinEnd - 0.45, HOVER.spinEnd)
    pose.bubble = false
  } else if (t < HOVER.waveEnd) {
    pose.angle = faceAfterSpin
    pose.typing = 0
    pose.wave = 1
    pose.bounce = hop(t - HOVER.spinEnd, animate)
    pose.bubble = true
    pose.bubbleLeaving = t > HOVER.waveEnd - BUBBLE_FADE
  } else {
    const progress = easeInOutQuad((t - HOVER.waveEnd) / (HOVER.returnEnd - HOVER.waveEnd))
    pose.angle = animate ? faceAfterSpin + progress * (backAtDesk - faceAfterSpin) : 0
    pose.wave = 1 - smoothstep(progress, 0, 0.4)
    pose.typing = smoothstep(progress, 0.6, 1)
    pose.bubble = false
  }
  return false
}
