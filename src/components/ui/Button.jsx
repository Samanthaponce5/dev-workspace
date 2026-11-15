import { cx } from '../../utils/cx'
import styles from './Button.module.css'

/**
 * Renders a link when given an `href`, otherwise a button.
 * Variants: "primary" (filled) and "ghost" (outlined).
 */
export function Button({ href, variant = 'primary', className, children, ...rest }) {
  const classes = cx(styles.button, styles[variant], className)

  if (href) {
    return (
      <a className={classes} href={href} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
