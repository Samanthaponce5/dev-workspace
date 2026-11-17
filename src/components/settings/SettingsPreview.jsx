import { displaySettings, hero, skills } from '../../content/content'
import { Button, Card, Heading, Tag } from '../ui'
import { ArrowRightIcon } from '../ui/icons'
import styles from './SettingsPreview.module.css'

const sampleGroup = skills.groups[0]
const SAMPLE_TAGS = 2

/**
 * A small Work card showing what the text size and contrast being
 * considered look like, before they are applied to the site. The two
 * data attributes switch the design tokens for this card alone (see
 * styles/tokens.css). Its button is a lookalike, labelled as a sample.
 */
export function SettingsPreview({ textSize, contrast }) {
  return (
    <Card className={styles.preview} role="group" aria-label={displaySettings.preview.label} data-text-size={textSize} data-contrast={contrast}>
      <span className={styles.label} aria-hidden="true">
        {displaySettings.preview.label}
      </span>
      <Heading level={3}>{sampleGroup.title}</Heading>
      <ul className={styles.tags}>
        {sampleGroup.tags.slice(0, SAMPLE_TAGS).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </ul>
      <div className={styles.sample}>
        <Button sample variant="ghost" className={styles.sampleButton} iconEnd={<ArrowRightIcon />}>
          {hero.primaryAction.label}
        </Button>
        <span className={styles.note}>{displaySettings.preview.sampleNote}</span>
      </div>
    </Card>
  )
}
