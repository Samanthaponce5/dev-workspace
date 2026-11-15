import * as THREE from 'three'
import { FIT_POINTS } from '../dimensions'

const deg = THREE.MathUtils.degToRad

/*
 * Camera setups for the two hero layouts.
 *   azimuth    angle around the desk; 0 is straight in front of it
 *   elevation  angle above the horizon
 *   margin     breathing room around the fitted points (1 = none)
 *   defaultFrame  where to put the scene before the layout is measured
 */
export const VIEWS = {
  // Three-quarter view; the whole platform stays in frame.
  desktop: {
    azimuth: deg(38),
    elevation: deg(24),
    fov: 26,
    margin: 1.1,
    widthPoints: FIT_POINTS.room,
    heightPoints: FIT_POINTS.room,
    defaultFrame: { x: 0.37, y: 0.05, width: 0.61, height: 0.93 },
  },
  // More head-on so the desk fills a narrow screen; the platform may run
  // off the sides but its front corner stays above the bottom edge.
  mobile: {
    azimuth: deg(27),
    elevation: deg(22),
    fov: 30,
    margin: 1.14,
    widthPoints: FIT_POINTS.desk,
    heightPoints: FIT_POINTS.room,
    defaultFrame: { x: 0, y: 0.45, width: 1, height: 0.53 },
  },
}
