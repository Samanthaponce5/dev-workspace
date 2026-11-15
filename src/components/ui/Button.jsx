import { cx } from '../../utils/cx'
import styles from './Button.module.css'

/**
 * Renders a link when given an `href`, otherwise a button.
 * Variants: "primary" (filled lavender) and "ghost" (outlined).
 * `iconEnd` is an optional icon element shown after the label.
 */
export function Button({ href, variant = 'primary', iconEnd, className, children, ...rest }) {
  const classes = cx(styles.button, styles[variant], className)
  const content = (
    <>
      <span>{children}</span>
      {iconEnd && <span className={styles.icon}>{iconEnd}</span>}
    </>
  )

  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  )
}
