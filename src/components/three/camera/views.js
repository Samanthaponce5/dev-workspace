import * as THREE from 'three'
import { FIT_POINTS } from '../dimensions'

const deg = THREE.MathUtils.degToRad

/*
 * Camera setups for the two hero layouts.
 *   azimuth    angle around the desk; 0 is straight in front of it
 *   elevation  angle above the horizon
 *   marginX/Y  breathing room around the fitted points (1 = none)
 */
export const VIEWS = {
  // Three-quarter view; the whole platform stays in frame.
  desktop: {
    azimuth: deg(38),
    elevation: deg(24),
    fov: 26,
    marginX: 1.1,
    marginY: 1.1,
    widthPoints: FIT_POINTS.room,
    heightPoints: FIT_POINTS.room,
  },
  // More head-on and from a little higher, so the desk fills a narrow
  // screen. The platform may run off the sides, and its front corner may
  // dip slightly into the fade at the bottom of the hero.
  mobile: {
    azimuth: deg(27),
    elevation: deg(27),
    fov: 30,
    marginX: 1.11,
    marginY: 0.97,
    widthPoints: FIT_POINTS.desk,
    heightPoints: FIT_POINTS.room,
  },
}
