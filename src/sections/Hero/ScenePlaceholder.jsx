import styles from './ScenePlaceholder.module.css'

const toPercent = (value) => `${value * 100}%`

/**
 * Holds the diorama's place while the 3D scene loads: a soft pool of the
 * hero's own light in the stage slot. It fades out as the scene fades in.
 */
export function ScenePlaceholder({ frame, hidden }) {
  const style = frame
    ? { left: toPercent(frame.x), top: toPercent(frame.y), width: toPercent(frame.width), height: toPercent(frame.height) }
    : undefined

  return (
    <div className={styles.placeholder} style={style} data-hidden={hidden || undefined} aria-hidden="true">
      <div className={styles.glow} />
      {!hidden && <span className="visually-hidden">Loading the 3D desk scene</span>}
    </div>
  )
}
