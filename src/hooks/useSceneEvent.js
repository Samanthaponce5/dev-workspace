import { useEffect } from 'react'
import { onSceneEvent } from '../utils/sceneEvents'

/** Runs `handler` whenever the named scene event is emitted. Keep `handler` stable. */
export function useSceneEvent(name, handler) {
  useEffect(() => onSceneEvent(name, handler), [name, handler])
}
