import { emitSceneEvent } from '../../utils/sceneEvents'
import styles from './SceneControls.module.css'

const ACTIONS = [
  { key: 'sam', event: 'sam:greet' },
  { key: 'andy', event: 'andy:hop' },
  { key: 'duck', event: 'duck:squeak' },
]

/**
 * Keyboard and screen-reader access to the scene's click interactions.
 * The buttons are invisible until one receives focus, then appear as a
 * small row over the scene.
 */
export function SceneControls({ labels }) {
  return (
    <ul className={styles.controls} aria-label="Desk scene interactions">
      {ACTIONS.map(({ key, event }) => (
        <li key={key}>
          <button type="button" className={styles.control} data-scene-action={key} onClick={() => emitSceneEvent(event)} data-track={`tap_${key}`}>
            {labels[key]}
          </button>
        </li>
      ))}
    </ul>
  )
}
