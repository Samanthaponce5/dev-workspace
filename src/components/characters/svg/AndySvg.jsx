import { andyPalette as colors } from '../../three/materials'
import { cx } from '../../../utils/cx'
import styles from './characters.module.css'

function Face() {
  return (
    <>
      <ellipse cx="55" cy="40" rx="35" ry="28" fill={colors.tan} />
      <ellipse cx="55" cy="23" rx="23" ry="10" fill={colors.crown} />
      {/* Darker fur across the eyes and over the muzzle */}
      <path d="M26 40 C30 30 44 30 55 34 C66 30 80 30 84 40 C84 50 72 54 68 62 C62 70 48 70 42 62 C38 54 26 50 26 40 Z" fill={colors.mask} />
      <ellipse cx="55" cy="55" rx="13" ry="9" fill={colors.muzzle} />
      <circle cx="40" cy="42" r="5.8" fill={colors.eye} />
      <circle cx="70" cy="42" r="5.8" fill={colors.eye} />
      <circle cx="42" cy="40" r="1.9" fill="#fff" />
      <circle cx="72" cy="40" r="1.9" fill="#fff" />
      <ellipse cx="55" cy="50" rx="5" ry="3.6" fill={colors.nose} />
      <rect x="50.5" y="56" width="9" height="9" rx="4.5" fill={colors.tongue} />
      <ellipse cx="55" cy="67" rx="7" ry="4.5" fill={colors.white} />
    </>
  )
}

/**
 * Andy as a small flat illustration, sitting and facing out. Matches the
 * 3D version: tan crown, darker fur round the eyes and muzzle, dark
 * floppy ears, white chest and paws, tongue out.
 *
 * `pose` picks his motion once he is on screen: "tilt" (head tilt) or
 * "wave" (one paw). His tail wags in both.
 */
export function AndySvg({ pose = 'tilt', className }) {
  return (
    <svg viewBox="0 0 110 112" className={cx(styles.character, className)} data-pose={pose} aria-hidden="true" focusable="false">
      <g className={styles.tail}>
        <ellipse cx="86" cy="66" rx="9" ry="13" fill={colors.tan} transform="rotate(24 86 66)" />
      </g>

      <ellipse cx="55" cy="82" rx="27" ry="24" fill={colors.body} />
      <ellipse cx="55" cy="84" rx="14" ry="18" fill={colors.white} />
      <ellipse cx="29" cy="100" rx="9" ry="6" fill={colors.white} />
      <ellipse cx="81" cy="100" rx="9" ry="6" fill={colors.white} />
      <ellipse cx="66" cy="104" rx="8.5" ry="5.5" fill={colors.white} />
      {/* The paw that waves */}
      <g transform="translate(44 96)">
        <g className={styles.paw}>
          <rect x="-5" y="-2" width="10" height="12" rx="5" fill={colors.tan} />
          <ellipse cx="0" cy="9" rx="8.5" ry="5.5" fill={colors.white} />
        </g>
      </g>

      <g className={styles.dogHead}>
        <ellipse cx="19" cy="46" rx="9.5" ry="21" fill={colors.ear} transform="rotate(8 19 46)" />
        <ellipse cx="91" cy="46" rx="9.5" ry="21" fill={colors.ear} transform="rotate(-8 91 46)" />
        <Face />
      </g>
    </svg>
  )
}

/**
 * Andy trotting, seen from the side, for the strip along the bottom of
 * the Experience section. His legs swing and his body bobs in CSS.
 */
export function AndyTrotSvg({ className }) {
  return (
    <svg viewBox="0 0 124 84" className={cx(styles.character, styles.trotter, className)} aria-hidden="true" focusable="false">
      <g className={styles.tail}>
        <ellipse cx="22" cy="26" rx="8" ry="13" fill={colors.tan} transform="rotate(-28 22 26)" />
      </g>

      {/* Far legs first, so the body overlaps them */}
      <g className={cx(styles.leg, styles.legB)} transform="translate(40 52)">
        <rect x="-4.5" y="0" width="9" height="20" rx="4.5" fill={colors.mask} />
      </g>
      <g className={cx(styles.leg, styles.legA)} transform="translate(80 52)">
        <rect x="-4.5" y="0" width="9" height="20" rx="4.5" fill={colors.mask} />
      </g>

      <rect x="24" y="28" width="68" height="32" rx="16" fill={colors.body} />
      <ellipse cx="84" cy="50" rx="11" ry="12" fill={colors.white} />

      {/* Near legs, with white paws */}
      <g className={cx(styles.leg, styles.legA)} transform="translate(46 54)">
        <rect x="-4.5" y="0" width="9" height="19" rx="4.5" fill={colors.tan} />
        <ellipse cx="1" cy="19" rx="7" ry="4.5" fill={colors.white} />
      </g>
      <g className={cx(styles.leg, styles.legB)} transform="translate(86 54)">
        <rect x="-4.5" y="0" width="9" height="19" rx="4.5" fill={colors.tan} />
        <ellipse cx="1" cy="19" rx="7" ry="4.5" fill={colors.white} />
      </g>

      {/* Head in profile, looking where he is going */}
      <ellipse cx="88" cy="30" rx="8" ry="16" fill={colors.ear} transform="rotate(14 88 30)" />
      <ellipse cx="100" cy="27" rx="20" ry="18" fill={colors.tan} />
      <ellipse cx="98" cy="14" rx="13" ry="6.5" fill={colors.crown} />
      <path d="M100 24 C108 20 118 24 120 31 C120 38 112 42 104 40 C98 38 96 30 100 24 Z" fill={colors.mask} />
      <circle cx="106" cy="25" r="4.2" fill={colors.eye} />
      <circle cx="107.4" cy="23.6" r="1.4" fill="#fff" />
      <ellipse cx="119" cy="30" rx="3.6" ry="2.8" fill={colors.nose} />
      <rect x="110" y="36" width="7" height="8" rx="3.5" fill={colors.tongue} />
    </svg>
  )
}
