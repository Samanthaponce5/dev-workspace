import { andyPalette as colors } from '../../three/materials'
import { cx } from '../../../utils/cx'
import styles from './characters.module.css'

function Face() {
  return (
    <>
      <ellipse cx="55" cy="40" rx="36" ry="30" fill={colors.tan} />
      <ellipse cx="55" cy="22" rx="24" ry="10" fill={colors.crown} />
      {/* Grey-brown mask: round each eye, joined over the nose, down over the muzzle */}
      <path
        d="M22 42 C23 33 36 30 46 32 C50 33 53 35 55 37 C57 35 60 33 64 32 C74 30 87 33 88 42 C88 49 78 52 71 55 C70 62 63 67 55 67 C47 67 40 62 39 55 C32 52 22 49 22 42 Z"
        fill={colors.mask}
      />
      <ellipse cx="55" cy="56" rx="13" ry="10" fill={colors.muzzle} />
      <circle cx="40" cy="42" r="7.4" fill={colors.eye} />
      <circle cx="70" cy="42" r="7.4" fill={colors.eye} />
      <circle cx="37.6" cy="39.4" r="2.4" fill="#fff" />
      <circle cx="67.6" cy="39.4" r="2.4" fill="#fff" />
      <circle cx="42.6" cy="44.8" r="1" fill="#fff" />
      <circle cx="72.6" cy="44.8" r="1" fill="#fff" />
      <ellipse cx="55" cy="50" rx="5.8" ry="4" fill={colors.nose} />
      <rect x="50" y="56" width="10" height="11" rx="5" fill={colors.tongue} />
    </>
  )
}

/**
 * Andy as a small flat illustration, sitting and facing out. Matches the
 * 3D version: round caramel head, grey-brown mask across the eyes and
 * muzzle, big dark floppy ears, white bib and paws, tongue out.
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
      <ellipse cx="55" cy="85" rx="16" ry="19" fill={colors.white} />
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
        <ellipse cx="18" cy="48" rx="11" ry="23" fill={colors.ear} transform="rotate(7 18 48)" />
        <ellipse cx="92" cy="48" rx="11" ry="23" fill={colors.ear} transform="rotate(-7 92 48)" />
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

      {/*
        Far legs first, so the body overlaps them. Each leg is placed by an
        outer group and swung by an inner one: a CSS transform on the same
        element would replace its position.
      */}
      <g transform="translate(40 52)">
        <g className={cx(styles.leg, styles.legB)}>
          <rect x="-4.5" y="0" width="9" height="20" rx="4.5" fill={colors.ear} />
        </g>
      </g>
      <g transform="translate(80 52)">
        <g className={cx(styles.leg, styles.legA)}>
          <rect x="-4.5" y="0" width="9" height="20" rx="4.5" fill={colors.ear} />
        </g>
      </g>

      <rect x="24" y="28" width="68" height="32" rx="16" fill={colors.body} />
      <ellipse cx="84" cy="50" rx="11" ry="12" fill={colors.white} />

      {/* Near legs, with white paws */}
      <g transform="translate(46 54)">
        <g className={cx(styles.leg, styles.legA)}>
          <rect x="-4.5" y="0" width="9" height="19" rx="4.5" fill={colors.tan} />
          <ellipse cx="1" cy="19" rx="7" ry="4.5" fill={colors.white} />
        </g>
      </g>
      <g transform="translate(86 54)">
        <g className={cx(styles.leg, styles.legB)}>
          <rect x="-4.5" y="0" width="9" height="19" rx="4.5" fill={colors.tan} />
          <ellipse cx="1" cy="19" rx="7" ry="4.5" fill={colors.white} />
        </g>
      </g>

      {/* Head in profile, looking where he is going */}
      <ellipse cx="88" cy="30" rx="8" ry="16" fill={colors.ear} transform="rotate(14 88 30)" />
      <ellipse cx="100" cy="27" rx="20" ry="18" fill={colors.tan} />
      <ellipse cx="98" cy="14" rx="13" ry="6.5" fill={colors.crown} />
      <path d="M100 24 C108 20 118 24 120 31 C120 38 112 42 104 40 C98 38 96 30 100 24 Z" fill={colors.mask} />
      <circle cx="106" cy="25" r="5" fill={colors.eye} />
      <circle cx="104.6" cy="23.4" r="1.6" fill="#fff" />
      <ellipse cx="119" cy="30" rx="3.6" ry="2.8" fill={colors.nose} />
      <rect x="110" y="36" width="7" height="8" rx="3.5" fill={colors.tongue} />
    </svg>
  )
}
