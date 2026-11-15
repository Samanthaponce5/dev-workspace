import { lazy, Suspense, useCallback, useState } from 'react'
import { scene } from '../../content/content'
import { useCanRender3D } from '../../hooks/useCanRender3D'
import { useDismissIntro, useIntroDone } from '../../hooks/useIntroDone'
import { useInView } from '../../hooks/useInView'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePageVisible } from '../../hooks/usePageVisible'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRelativeFrame } from '../../hooks/useRelativeFrame'
import { SceneControls } from './SceneControls'
import { ScenePoster } from './ScenePoster'
import styles from './HeroScene.module.css'

/* three.js is only downloaded when the scene is going to be shown. */
const DeskScene = lazy(() => import('../../components/three/DeskScene'))

/**
 * The hero's 3D layer. Covers the whole hero and fits the diorama to the
 * stage slot.
 *
 * Loading: a still image of the finished scene (the poster) is shown in
 * the scene's exact position straight away. The live canvas stays
 * invisible until it has drawn a complete frame, then fades in over the
 * poster, so visitors never see an empty or half-built desk and nothing
 * shifts. The page's intro overlay is dismissed as soon as either the
 * poster or the live scene is showing.
 *
 * The characters' greeting starts only when the live scene is showing and
 * the intro overlay has gone, so nobody misses it.
 *
 * When WebGL is missing or the device is low-power, the poster is all
 * that is shown. Rendering pauses whenever the hero scrolls off screen or
 * the tab is hidden.
 */
export function HeroScene({ containerRef, stageRef }) {
  const canRender3D = useCanRender3D()
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const pageVisible = usePageVisible()
  const introDone = useIntroDone()
  const frame = useRelativeFrame(containerRef, stageRef)
  const [sceneRef, inView] = useInView({ rootMargin: '120px' })

  const [live, setLive] = useState(false) // the 3D scene has drawn a complete frame
  const [posterSettled, setPosterSettled] = useState(false) // the still image has loaded (or failed)
  const markLive = useCallback(() => setLive(true), [])
  const settlePoster = useCallback(() => setPosterSettled(true), [])

  useDismissIntro(live || posterSettled)

  return (
    <div ref={sceneRef} className={styles.scene}>
      <ScenePoster
        frame={frame}
        isMobile={isMobile}
        hidden={live}
        label={canRender3D ? undefined : scene.description}
        onSettled={settlePoster}
      />

      {canRender3D && (
        <>
          <div className={styles.canvas} data-ready={live || undefined}>
            {/* Wait for the stage to be measured so the camera is right on its first frame. */}
            {frame && (
              <Suspense fallback={null}>
                <DeskScene
                  scene={scene}
                  frame={frame}
                  active={inView && pageVisible}
                  animate={!reducedMotion}
                  isMobile={isMobile}
                  sceneStarted={live}
                  introStarted={live && introDone}
                  onReady={markLive}
                />
              </Suspense>
            )}
          </div>
          {live && <SceneControls labels={scene.controls} />}
        </>
      )}
    </div>
  )
}
