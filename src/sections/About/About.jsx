import { AndySvg } from '../../components/characters/svg/AndySvg'
import { SamSvg } from '../../components/characters/svg/SamSvg'
import { ScrollMoment, Section } from '../../components/ui'
import { about } from '../../content/content'
import styles from './About.module.css'

/** A short introduction. Beside it, she waves and Andy tilts his head. */
export function About() {
  return (
    <Section id="about" eyebrow={about.eyebrow} title={about.title}>
      <div className={styles.layout}>
        <div className={styles.prose}>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <ScrollMoment className={styles.pair}>
          <SamSvg pose="wave" className={styles.sam} />
          <AndySvg pose="tilt" className={styles.andy} />
        </ScrollMoment>
      </div>
    </Section>
  )
}
