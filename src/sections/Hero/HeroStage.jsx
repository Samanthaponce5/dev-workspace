import { cx } from '../../utils/cx'
import styles from './HeroStage.module.css'

/**
 * The area the 3D desk scene occupies. For now it only draws the floor
 * glow the diorama will float above; the canvas mounts here in step 2.
 */
export function HeroStage({ className }) {
  return (
    <div className={cx(styles.stage, className)} aria-hidden="true">
      <div className={styles.glow} />
    </div>
  )
}
