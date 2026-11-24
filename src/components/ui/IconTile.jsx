import { cx } from '../../utils/cx'
import { Icon } from './icons'
import styles from './IconTile.module.css'

/**
 * A rounded square holding one icon. "solid" is filled mint with a dark
 * icon; "soft" is a dark tile with a mint icon. It glows briefly when
 * its section scrolls into view, in order of `--i` on an ancestor.
 * `size="sm"` is a smaller tile for compact cards.
 */
export function IconTile({ name, tone = 'solid', size = 'md', className }) {
  const iconSize = size === 'sm' ? 20 : 28
  return (
    <span className={cx(styles.tile, styles[tone], size === 'sm' && styles.small, className)}>
      <Icon name={name} width={iconSize} height={iconSize} />
    </span>
  )
}
