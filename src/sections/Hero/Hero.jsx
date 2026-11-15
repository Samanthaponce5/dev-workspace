import { Button, Container, Eyebrow, Heading } from '../../components/ui'
import { hero } from '../../content/content'
import styles from './Hero.module.css'

/** Opening section: name, one-line intro and the two main actions. */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className={styles.hero}>
      <Container className={styles.layout}>
        <div className={styles.intro}>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <Heading level={1} id="hero-heading">
            {hero.title}
          </Heading>
          <p className={styles.lede}>{hero.intro}</p>
          <div className={styles.actions}>
            <Button href={hero.primaryAction.href}>{hero.primaryAction.label}</Button>
            <Button href={hero.secondaryAction.href} variant="ghost">
              {hero.secondaryAction.label}
            </Button>
          </div>
        </div>
        {/* The 3D desk scene mounts here in step 2. */}
      </Container>
    </section>
  )
}
