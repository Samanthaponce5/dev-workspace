import { samPalette as colors } from '../../three/materials'
import { cx } from '../../../utils/cx'
import styles from './characters.module.css'

/**
 * Mini-Samantha as a small flat illustration, for the moments further
 * down the page. Same look as the 3D version (and the same palette):
 * centre-parted hair with a low ponytail, navy top, jeans, white shoes.
 *
 * `pose` picks what her right arm does once the illustration is on
 * screen: "wave" or "point". The motion itself is CSS (see
 * characters.module.css) and is switched off under reduced motion.
 */
export function SamSvg({ pose = 'wave', className }) {
  return (
    <svg viewBox="0 0 120 170" className={cx(styles.character, className)} data-pose={pose} aria-hidden="true" focusable="false">
      {/* Low ponytail, behind her shoulder */}
      <path d="M33 62 C16 60 10 78 16 94 C19 102 27 100 27 92 C27 82 34 76 36 68 Z" fill={colors.hair} />

      {/* Legs and shoes */}
      <rect x="44" y="118" width="14" height="40" rx="7" fill={colors.jeans} />
      <rect x="62" y="118" width="14" height="40" rx="7" fill={colors.jeans} />
      <ellipse cx="50" cy="160" rx="10.5" ry="6" fill={colors.shoes} />
      <ellipse cx="70" cy="160" rx="10.5" ry="6" fill={colors.shoes} />

      {/* Left arm, resting */}
      <rect x="74" y="90" width="11" height="30" rx="5.5" fill={colors.top} />
      <circle cx="79.5" cy="121" r="6" fill={colors.skin} />

      {/* Top, tucked into the jeans */}
      <rect x="40" y="84" width="40" height="40" rx="14" fill={colors.top} />
      <rect x="41" y="113" width="38" height="14" rx="6" fill={colors.jeans} />

      {/* Right arm: the one that waves or points. It turns about the shoulder. */}
      <g transform="translate(43 91)">
        <g className={styles.arm}>
          <rect x="-5.5" y="0" width="11" height="29" rx="5.5" fill={colors.top} />
          <circle cx="0" cy="31" r="6" fill={colors.skin} />
        </g>
      </g>

      <g className={styles.head}>
        {/* Hair, then the face on top with a peak at the centre parting */}
        <ellipse cx="60" cy="49" rx="33" ry="31" fill={colors.hair} />
        <path d="M60 29 C45 32 34 44 33 60 C33 76 45 84 60 84 C75 84 87 76 87 60 C86 44 75 32 60 29 Z" fill={colors.skin} />
        {/* Slim cheek strands */}
        <path d="M35 52 C33 62 35 70 39 77" fill="none" stroke={colors.hair} strokeWidth="3" strokeLinecap="round" />
        <path d="M85 52 C87 62 85 70 81 77" fill="none" stroke={colors.hair} strokeWidth="3" strokeLinecap="round" />

        <ellipse cx="42" cy="69" rx="5.5" ry="3.2" fill={colors.blush} opacity="0.55" />
        <ellipse cx="78" cy="69" rx="5.5" ry="3.2" fill={colors.blush} opacity="0.55" />

        <g className={styles.eyes}>
          <circle cx="49" cy="59" r="6.2" fill={colors.eye} />
          <circle cx="71" cy="59" r="6.2" fill={colors.eye} />
          <circle cx="51" cy="57" r="2" fill="#fff" />
          <circle cx="73" cy="57" r="2" fill="#fff" />
        </g>
        <path d="M43 49 Q49 46 55 49" fill="none" stroke={colors.brow} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M65 49 Q71 46 77 49" fill="none" stroke={colors.brow} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M55 71 Q60 75 65 71" fill="none" stroke={colors.mouth} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}
