import { lazy, Suspense } from 'react'
import { scene } from '../../content/content'
import { useCanRender3D } from '../../hooks/useCanRender3D'
import { useInView } from '../../hooks/useInView'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePageVisible } from '../../hooks/usePageVisible'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cx } from '../../utils/cx'
import { HeroFallback } from './HeroFallback'
import styles from './HeroStage.module.css'

/* three.js is only downloaded when the scene is going to be shown. */
const DeskScene = lazy(() => import('../../components/three/DeskScene'))

/**
 * Hosts the 3D desk diorama. Falls back to a static illustration when
 * WebGL is missing or the device is low-power, and pauses rendering
 * whenever the stage scrolls off screen or the tab is hidden.
 */
export function HeroStage({ className }) {
  const canRender3D = useCanRender3D()
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const pageVisible = usePageVisible()
  const [stageRef, inView] = useInView({ rootMargin: '120px' })

  return (
    <div ref={stageRef} className={cx(styles.stage, className)} role="img" aria-label={scene.description}>
      <div className={styles.glow} />
      {canRender3D ? (
        <Suspense fallback={<HeroFallback loading />}>
          <div className={styles.canvas}>
            <DeskScene scene={scene} active={inView && pageVisible} animate={!reducedMotion} isMobile={isMobile} />
          </div>
        </Suspense>
      ) : (
        <HeroFallback />
      )}
    </div>
  )
}
