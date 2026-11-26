import { useRef } from 'react'
import { Heading, Section, Tag } from '../../components/ui'
import { CodeIcon, Icon } from '../../components/ui/icons'
import { skills } from '../../content/content'
import { useBranchesSeen } from './useBranchesSeen'
import { useFlowLines } from './useFlowLines'
import { useSpotlight } from './useSpotlight'
import styles from './Work.module.css'

/* The circle the diagram's lines start from, with three small chevrons leading into it. */
function Source({ ref }) {
  return (
    <div className={styles.source}>
      <span className={styles.chevrons} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span ref={ref} className={styles.sourceRing}>
        <CodeIcon width={26} height={26} />
      </span>
    </div>
  )
}

/* The connecting lines, drawn in SVG over the diagram. Purely decorative. */
function Lines({ lines, active, ids, seen }) {
  if (!lines) return null
  return (
    <svg className={styles.lines} data-mode={lines.mode} aria-hidden="true" focusable="false">
      <path className={styles.glow} d={lines.trunk} pathLength="1" />
      <path className={styles.line} d={lines.trunk} pathLength="1" />
      <path className={styles.pulse} d={lines.trunk} pathLength="1" />
      {lines.branches.map((branch, index) => (
        <g key={ids[index]} className={styles.branchLines} style={{ '--i': index }} data-on={active === ids[index] || undefined} data-seen={seen.has(index) || undefined}>
          <path className={styles.glow} d={branch.d} pathLength="1" />
          <path className={styles.line} d={branch.d} pathLength="1" />
          <path className={styles.pulse} d={branch.d} pathLength="1" />
          <circle className={styles.end} cx={branch.end.x} cy={branch.end.y} r="3.5" />
        </g>
      ))}
    </svg>
  )
}

/**
 * "What I do": a branching diagram. A line of light runs from a code
 * circle under the heading and splits three ways, to front-end, APIs and
 * back-end, and AI and tooling. When the section scrolls into view a
 * pulse travels the lines and each branch appears as it arrives; on
 * phones, where the branches are stacked taller than the screen, each one
 * draws out as it is scrolled to (see useBranchesSeen.js).
 * Hovering, tapping or focusing a branch picks it out and dims the rest.
 *
 * The lines are measured from where the circles really are (see
 * useFlowLines.js), so they follow the layout at every width: across on
 * wide screens, down and three ways on tablets, down the side on phones.
 */
export function Work() {
  const flowRef = useRef(null)
  const sourceRef = useRef(null)
  const nodeRefs = useRef([])
  const lines = useFlowLines(flowRef, sourceRef, nodeRefs)
  const { active, handlersFor } = useSpotlight()
  const seen = useBranchesSeen(flowRef)
  const ids = skills.groups.map((group) => group.id)

  return (
    <Section id="work" eyebrow={skills.eyebrow} title={skills.title} intro={skills.intro} split className={styles.section} headerExtra={<Source ref={sourceRef} />}>
      <div ref={flowRef} className={styles.flow} data-active={active ?? undefined}>
        <Lines lines={lines} active={active} ids={ids} seen={seen} />
        <ul className={styles.branches}>
          {skills.groups.map((group, index) => (
            <li
              key={group.id}
              className={styles.branch}
              style={{ '--i': index }}
              data-on={active === group.id || undefined}
              data-branch
              data-seen={seen.has(index) || undefined}
              tabIndex={0}
              aria-labelledby={`skill-${group.id}`}
              {...handlersFor(group.id)}
            >
              <span
                ref={(node) => {
                  nodeRefs.current[index] = node
                }}
                className={styles.node}
              >
                <Icon name={group.icon} width={26} height={26} />
              </span>
              <div className={styles.text}>
                <Heading level={3} size="md" id={`skill-${group.id}`} className={styles.title}>
                  {group.title}
                </Heading>
                <p className={styles.description}>{group.description}</p>
                <ul className={styles.tags} aria-label={`${group.title} skills`}>
                  {group.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
