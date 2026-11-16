import { fitScene } from '../../components/three/camera/fitMath'
import { VIEWS } from '../../components/three/camera/views'
import posters from './scenePoster.json'
import styles from './ScenePoster.module.css'

/**
 * A still image of the finished desk scene, drawn exactly where the live
 * scene appears. It is what visitors see if the live scene is slow to
 * load (the live scene then fades in over it, `late`), and instead of
 * the scene when WebGL is missing or the device is low-power.
 *
 * The image was captured from the real scene by `npm run posters`, which
 * also recorded how large the scene was drawn (pixelsPerUnit) and where
 * the middle of the stage fell inside the picture (anchor). Running the
 * same fitting maths as the camera for the current layout gives the scale
 * and position that line the picture up with the live scene.
 *
 * `onSettled` fires when the image has loaded, or failed to.
 */
export function ScenePoster({ frame, isMobile, hidden = false, late = false, label, onSettled }) {
  if (!frame) return null

  const poster = isMobile ? posters.mobile : posters.desktop
  const view = isMobile ? VIEWS.mobile : VIEWS.desktop
  const { containerWidth, containerHeight } = frame

  const { pixelsPerUnit } = fitScene(view, frame.width * containerWidth, frame.height * containerHeight)
  const scale = pixelsPerUnit / poster.pixelsPerUnit
  const width = poster.width * scale
  const height = poster.height * scale
  const left = (frame.x + frame.width / 2) * containerWidth - poster.anchorX * width
  const top = (frame.y + frame.height / 2) * containerHeight - poster.anchorY * height

  return (
    <img
      className={styles.poster}
      src={poster.src}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={poster.width}
      height={poster.height}
      style={{ left, top, width, height }}
      data-hidden={hidden || undefined}
      data-late={late || undefined}
      draggable={false}
      fetchPriority="high"
      onLoad={onSettled}
      onError={onSettled}
    />
  )
}
