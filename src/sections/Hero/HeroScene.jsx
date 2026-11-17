import { useCallback, useEffect, useState } from 'react'
import { scene } from '../../content/content'
import { canRender3D, useCanRender3D } from '../../hooks/useCanRender3D'
import { useInView } from '../../hooks/useInView'
import { useIntroDone } from '../../hooks/useIntroDone'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePageVisible } from '../../hooks/usePageVisible'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRelativeFrame } from '../../hooks/useRelativeFrame'
import { revealIntro } from '../../intro/reveal'
import { isIntroDone } from '../../utils/intro'
import { SceneControls } from './SceneControls'
import { ScenePoster } from './ScenePoster'
import styles from './HeroScene.module.css'

/*
 * The 3D bundle starts downloading the moment this file is evaluated,
 * alongside the first render, rather than waiting for the hero to mount.
 * (index.html also preloads it, so on a slow connection it is usually
 * already on its way.)
 */
const liveScene = { Component: null, failed: false }
const liveSceneSettled = canRender3D
  ? import('../../components/three/DeskScene').then(
      (module) => {
        liveScene.Component = module.default
      },
      () => {
        liveScene.failed = true // offline, or the file could not be fetched: the still image takes over
      },
    )
  : null

/* How long after the page opened to keep waiting for the live scene before revealing with the still image. */
const LIVE_WAIT_MS = 4500
/* The still image is only fetched this long before it might be needed, so it never competes with the 3D bundle. */
const POSTER_LEAD_MS = 1500
/* The reveal lands the logo on the navbar's text, so it gives the fonts this long to arrive first. */
const FONT_WAIT_MS = 700

/*
 * Where the scene's bundle has got to: 'loading', then 'loaded' (and
 * `liveScene.Component` can be rendered) or 'failed'. This is plain state
 * rather than React.lazy with Suspense, because React deliberately waits
 * about 300ms before replacing a Suspense fallback, which delayed the
 * canvas for no reason.
 */
const liveSceneStatus = () => (liveScene.Component ? 'loaded' : liveScene.failed ? 'failed' : 'loading')

function useLiveSceneStatus() {
  const [status, setStatus] = useState(liveSceneStatus)
  useEffect(() => {
    let cancelled = false
    liveSceneSettled?.then(() => {
      if (!cancelled) setStatus(liveSceneStatus())
    })
    return () => {
      cancelled = true
    }
  }, [])
  return status
}

/*
 * True while the hero is scrolled out of sight above the window, which
 * is how the page opens from a link to a section further down. Only
 * watched while `watching` is true.
 */
function useScrolledPast(elementRef, watching) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    if (!watching) return undefined
    const check = () => setPast(elementRef.current.getBoundingClientRect().bottom <= 0)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [elementRef, watching])
  return past
}

/* True after `ms` have passed since the page opened. */
function useElapsedSinceLoad(ms) {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setElapsed(true), Math.max(0, ms - performance.now()))
    return () => window.clearTimeout(id)
  }, [ms])
  return elapsed
}

/* True once the web fonts are in, or `ms` after mounting, whichever is first. */
function useFontsSettled(ms) {
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    let cancelled = false
    const settle = () => {
      if (!cancelled) setSettled(true)
    }
    const id = window.setTimeout(settle, ms)
    ;(document.fonts?.ready ?? Promise.resolve()).then(settle)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [ms])
  return settled
}

/**
 * The hero's 3D layer. Covers the whole hero and fits the diorama to the
 * stage slot.
 *
 * Loading: the canvas mounts at its final size behind the intro overlay
 * and renders there. As soon as it has drawn one complete frame, the
 * intro's reveal plays over a landing page that is already assembled, and
 * the characters' greeting starts the moment the reveal clears.
 *
 * If WebGL is missing, the device is low-power, the scene's download
 * fails, or the live scene is taking unusually long, the reveal goes
 * ahead with a still image of the finished scene in the same position.
 * A live scene that turns up later fades in over that image without
 * moving anything, and the greeting plays then.
 *
 * If the page opens on a section further down, the hero is out of sight
 * and the scene is not being drawn, so the reveal does not wait for it.
 *
 * Rendering pauses whenever the hero scrolls off screen or the tab is
 * hidden.
 */
export function HeroScene({ containerRef, stageRef }) {
  const can3D = useCanRender3D()
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const pageVisible = usePageVisible()
  const introDone = useIntroDone()
  const frame = useRelativeFrame(containerRef, stageRef)
  const [sceneRef, inView] = useInView({ rootMargin: '120px' })
  const sceneStatus = useLiveSceneStatus()
  const sceneFailed = sceneStatus === 'failed'
  const heroOutOfSight = useScrolledPast(containerRef, !introDone)
  const waitedTooLong = useElapsedSinceLoad(LIVE_WAIT_MS)
  const posterMayBeNeeded = useElapsedSinceLoad(LIVE_WAIT_MS - POSTER_LEAD_MS)
  const fontsSettled = useFontsSettled(FONT_WAIT_MS)

  // `live`: the 3D scene has drawn a complete frame. `late`: it did so after the intro had already cleared.
  const [{ live, late }, setScene] = useState({ live: false, late: false })
  const [posterSettled, setPosterSettled] = useState(false)
  const markLive = useCallback(() => setScene({ live: true, late: isIntroDone() }), [])
  const settlePoster = useCallback(() => setPosterSettled(true), [])

  useEffect(() => {
    if (introDone || !fontsSettled) return
    if (heroOutOfSight) revealIntro({ toShelf: false, reducedMotion })
    else if (live) revealIntro({ toShelf: true, reducedMotion })
    else if ((!canRender3D || sceneFailed || waitedTooLong) && posterSettled) revealIntro({ toShelf: false, reducedMotion })
  }, [introDone, fontsSettled, heroOutOfSight, live, sceneFailed, waitedTooLong, posterSettled, reducedMotion])

  const showing = live && introDone

  return (
    <div ref={sceneRef} className={styles.scene}>
      {/* On a normal load the live scene is ready first and the still image is never downloaded. */}
      {(!can3D || ((posterMayBeNeeded || sceneFailed) && !(live && !late))) && (
        <ScenePoster
          frame={frame}
          isMobile={isMobile}
          hidden={live}
          late={late}
          label={can3D && !sceneFailed ? undefined : scene.description}
          onSettled={settlePoster}
        />
      )}

      {can3D && (
        <>
          <div className={styles.canvas} data-ready={live || undefined} data-late={late || undefined}>
            {/* Wait for the stage to be measured so the camera is right on its first frame. */}
            {sceneStatus === 'loaded' && frame && (
              <liveScene.Component
                scene={scene}
                frame={frame}
                active={inView && pageVisible}
                animate={!reducedMotion}
                isMobile={isMobile}
                sceneStarted={showing}
                introStarted={showing}
                onReady={markLive}
              />
            )}
          </div>
          {showing && <SceneControls labels={scene.controls} />}
        </>
      )}
    </div>
  )
}
