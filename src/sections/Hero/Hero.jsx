import { useRef } from 'react'
import { Button, Container, Tag } from '../../components/ui'
import { ArrowRightIcon, Icon } from '../../components/ui/icons'
import { hero } from '../../content/content'
import { HeroScene } from './HeroScene'
import styles from './Hero.module.css'

/**
 * Opening section. The 3D scene is drawn on a canvas that covers the whole
 * hero, so the diorama and its glow are never clipped by a box. The empty
 * "stage" element only marks where the layout wants the desk to appear;
 * the scene's camera fits the diorama to that slot.
 *
 * Nothing here animates in: the page's intro overlay (see index.html)
 * covers the first moments, and everything is already in place when it
 * clears.
 */
export function Hero() {
  const heroRef = useRef(null)
  const stageRef = useRef(null)

  return (
    <section ref={heroRef} id="top" aria-labelledby="hero-heading" className={styles.hero} data-hero>
      <div className={styles.backdrop} aria-hidden="true" />
      <HeroScene containerRef={heroRef} stageRef={stageRef} />

      <Container wide className={styles.layout}>
        <div className={styles.intro}>
          <h1 id="hero-heading" className={styles.name}>
            {hero.title}
          </h1>

          <p className={styles.role}>{hero.role}</p>

          <p className={styles.tagline}>{hero.tagline}</p>

          <ul className={styles.tools} aria-label={hero.toolsLabel}>
            {hero.tools.map((tool) => (
              <Tag key={tool.label} className={styles.tool}>
                <Icon name={tool.icon} width={15} height={15} />
                {tool.label}
              </Tag>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button href={hero.primaryAction.href} iconEnd={<ArrowRightIcon className={styles.arrow} />}>
              {hero.primaryAction.label}
            </Button>
          </div>
        </div>

        <div ref={stageRef} className={styles.stage} aria-hidden="true" data-hero-stage />
      </Container>
    </section>
  )
}
