import { Button, Container, Eyebrow } from '../../components/ui'
import { hero } from '../../content/content'
import { HeroStage } from './HeroStage'
import styles from './Hero.module.css'

/* The name is shown as two lines so it never wraps awkwardly on any screen. */
const [firstName, ...rest] = hero.title.split(' ')
const lastName = rest.join(' ')

/**
 * Opening section. The desk scene sits on a stage next to the text on
 * desktop and above it on phones. Each text block fades up in sequence
 * using the --enter-step custom property as its animation delay.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
      <Container className={styles.layout}>
        <div className={styles.intro}>
          <div className={styles.enter} style={{ '--enter-step': 0 }}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </div>

          <h1 id="hero-heading" className={`${styles.name} ${styles.enter}`} style={{ '--enter-step': 1 }}>
            <span className={styles.nameLine}>{firstName}</span>{' '}
            <span className={styles.nameLine}>{lastName}</span>
          </h1>

          <p className={`${styles.lede} ${styles.enter}`} style={{ '--enter-step': 2 }}>
            {hero.intro}
          </p>

          <div className={`${styles.actions} ${styles.enter}`} style={{ '--enter-step': 3 }}>
            <Button href={hero.primaryAction.href} className={styles.action}>
              {hero.primaryAction.label}
            </Button>
            <Button href={hero.secondaryAction.href} variant="ghost" className={styles.action}>
              {hero.secondaryAction.label}
            </Button>
          </div>
        </div>

        <HeroStage className={styles.stage} />
      </Container>
    </section>
  )
}
