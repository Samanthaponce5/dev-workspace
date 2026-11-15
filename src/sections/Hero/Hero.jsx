import { useRef } from 'react'
import { Button, Container } from '../../components/ui'
import { ArrowRightIcon } from '../../components/ui/icons'
import { hero } from '../../content/content'
import { cx } from '../../utils/cx'
import { HeroScene } from './HeroScene'
import styles from './Hero.module.css'

/* The name is shown as two lines so it never wraps awkwardly on any screen. */
const [firstName, ...rest] = hero.title.split(' ')
const lastName = rest.join(' ')

/**
 * Opening section. The 3D scene is drawn on a canvas that covers the whole
 * hero, so the diorama and its glow are never clipped by a box. The empty
 * "stage" element only marks where the layout wants the desk to appear;
 * the scene's camera fits the diorama to that slot.
 */
export function Hero() {
  const heroRef = useRef(null)
  const stageRef = useRef(null)

  return (
    <section ref={heroRef} id="top" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.backdrop} aria-hidden="true" />
      <HeroScene containerRef={heroRef} stageRef={stageRef} />

      <Container wide className={styles.layout}>
        <div className={styles.intro}>
          <h1 id="hero-heading" className={cx(styles.name, styles.enter)} style={{ '--enter-step': 0 }}>
            <span className={styles.nameLine}>{firstName}</span>{' '}
            <span className={styles.nameLine}>{lastName}</span>
          </h1>

          <p className={cx(styles.role, styles.enter)} style={{ '--enter-step': 1 }}>
            {hero.role}
          </p>

          <p className={cx(styles.tagline, styles.enter)} style={{ '--enter-step': 2 }}>
            {hero.tagline}
          </p>

          <div className={cx(styles.actions, styles.enter)} style={{ '--enter-step': 3 }}>
            <Button href={hero.primaryAction.href} iconEnd={<ArrowRightIcon className={styles.arrow} />}>
              {hero.primaryAction.label}
            </Button>
          </div>
        </div>

        <div ref={stageRef} className={styles.stage} aria-hidden="true" />
      </Container>
    </section>
  )
}
