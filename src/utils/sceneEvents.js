/*
 * A tiny event bus between the page and the 3D scene.
 *
 * The scene is rendered by a separate React renderer (React Three Fiber),
 * so page components can't reach it through props or context. Page-side
 * controls emit named events; scene components subscribe to them.
 */
const listeners = new Map()

/** Subscribes to a scene event. Returns a function that unsubscribes. */
export function onSceneEvent(name, handler) {
  if (!listeners.has(name)) listeners.set(name, new Set())
  const handlers = listeners.get(name)
  handlers.add(handler)
  return () => handlers.delete(handler)
}

/** Notifies every subscriber of the named event. */
export function emitSceneEvent(name) {
  listeners.get(name)?.forEach((handler) => handler())
}
