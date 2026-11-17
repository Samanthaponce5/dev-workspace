import { CheckIcon } from '../ui/icons'
import styles from './OptionGroup.module.css'

/**
 * One setting: a label and a row of options, of which exactly one is
 * chosen. The options are native radio buttons, so arrow keys move
 * between them and Tab moves on to the next setting. The chosen one is
 * filled in and carries a tick, so it does not rely on colour alone.
 */
export function OptionGroup({ id, label, options, value, onChange }) {
  const labelId = `${id}-label`

  return (
    <div className={styles.group} role="radiogroup" aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.face}>
              <CheckIcon className={styles.tick} width={16} height={16} />
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
