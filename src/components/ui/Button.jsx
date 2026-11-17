import { cx } from '../../utils/cx'
import styles from './Button.module.css'

/**
 * Renders a link when given an `href`, otherwise a button.
 * Variants: "primary" (filled mint) and "ghost" (outlined).
 * `iconEnd` is an optional icon element shown after the label.
 * `sample` renders something that only looks like the button, for showing
 * the style without offering a control that does nothing.
 */
export function Button({ href, variant = 'primary', iconEnd, sample = false, className, children, ...rest }) {
  const classes = cx(styles.button, styles[variant], className)
  const content = (
    <>
      <span>{children}</span>
      {iconEnd && <span className={styles.icon}>{iconEnd}</span>}
    </>
  )

  if (sample) {
    return (
      <span className={cx(classes, styles.sample)} {...rest}>
        {content}
      </span>
    )
  }

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
