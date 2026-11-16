import { cx } from '../../utils/cx'
import { Icon } from './icons'
import styles from './IconTile.module.css'

/**
 * A rounded square holding one icon. "solid" is filled mint with a dark
 * icon; "soft" is a dark tile with a mint icon. It glows briefly when
 * its section scrolls into view, in order of `--i` on an ancestor.
 */
export function IconTile({ name, tone = 'solid', className }) {
  return (
    <span className={cx(styles.tile, styles[tone], className)}>
      <Icon name={name} width={28} height={28} />
    </span>
  )
}
