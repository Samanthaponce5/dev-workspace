/*
 * All copy for the site lives in this file.
 * Anything marked PLACEHOLDER is stand-in text for Samantha to replace.
 */

export const site = {
  name: 'Samantha Ponce',
  role: 'Front-End Developer',
  company: 'Podchaser',
}

/*
 * Header links, in display order. `pinned` links stay visible in the bar on
 * phones; the rest live in the menu there.
 */
export const nav = [
  { id: 'work', label: 'Work', pinned: true },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export const hero = {
  title: site.name,
  role: `${site.role} at ${site.company}`,
  /* Shown on tablet and desktop only, to keep the phone hero compact. */
  tagline: 'I build fast, accessible interfaces.',
  primaryAction: { label: 'View work', href: '#work' },
}

/* Text and settings used inside the 3D desk scene. */
export const scene = {
  /* What the curved monitor shows beside the code: a mini preview of this site and a test run. */
  monitor: {
    monogram: 'SP',
    nameLines: site.name.split(' '),
    command: '$ npm test',
    tests: ['renders the hero', 'keyboard accessible', 'quack\u2011test passed'],
  },
  /* Shown on the desk clock next to the visitor's real local time. */
  clockTemperature: '73°F',
  /* Said once on load, after Samantha has turned back to her desk. */
  /* \u2011 is a non-breaking hyphen, so "quack-test" never splits across lines. */
  duckIntro: 'She codes. I quack\u2011test.',
  /* Said in turn each time the duck is clicked. */
  duckQuotes: [
    'Have you tried explaining it to me?',
    'Quack. Did you check the console?',
    'It works on my pond.',
  ],
  description:
    'A tiny 3D model of Samantha’s desk at night: a curved monitor showing code, a laptop, a steaming cup of coffee, a glowing jellyfish lamp and a rubber duck. Samantha is typing in her chair with her dog Andy sitting beside her.',
  /* Speech bubbles shown when a character is clicked. */
  samGreeting: 'Hi there!',
  andyBark: 'Woof!',
  /* Labels for the keyboard-accessible buttons that trigger scene moments. */
  controls: {
    sam: 'Wave at Samantha',
    andy: 'Say hi to Andy',
    duck: 'Squeak the rubber duck',
  },
}

export const about = {
  eyebrow: 'About',
  title: 'Hi, I’m Samantha.',
  /* PLACEHOLDER: replace with your own intro. */
  paragraphs: [
    'I’m a front-end developer who likes turning complicated product ideas into interfaces that feel simple. Most days that means React, careful component design, and a lot of attention to how things load, move and read.',
    'Lately I’ve been working further down the stack too, building the APIs and back-end pieces my interfaces depend on. When I’m not at my desk, I’m usually out with Andy, my Shih Tzu and unofficial rubber duck.',
  ],
}

export const skills = {
  eyebrow: 'What I do',
  title: 'Front-end first, comfortable across the stack.',
  /* PLACEHOLDER descriptions: edit to match how you talk about your work. */
  groups: [
    {
      id: 'front-end',
      title: 'Front-end',
      description:
        'Interfaces that stay fast and understandable as they grow, built from components other developers enjoy working with.',
      tags: ['React', 'Complex UI', 'Performance', 'Accessibility', 'Component architecture'],
    },
    {
      id: 'back-end',
      title: 'APIs and back-end',
      description:
        'The services behind the screen: designing endpoints, handling payments, and keeping search and data access quick.',
      tags: ['Laravel', 'REST APIs', 'Billing flows', 'Elasticsearch', 'Caching'],
    },
    {
      id: 'ai-tooling',
      title: 'AI and tooling',
      description:
        'Turning promising AI experiments into features that are reliable enough to ship, and using AI tools to build faster.',
      tags: ['AI prototypes to production', 'AI-assisted development'],
    },
  ],
}

export const experience = {
  eyebrow: 'Experience',
  title: 'Where I’ve been building.',
  /* PLACEHOLDER: fill in dates, titles and summaries. */
  roles: [
    {
      id: 'podchaser',
      company: 'Podchaser',
      title: 'Front-End Developer',
      period: 'Present',
      current: true,
      summary:
        'Placeholder summary. Describe what you own at Podchaser, the kind of problems you solve, and what you’re proud of.',
    },
    {
      id: 'previous-1',
      company: 'Previous company',
      title: 'Role title',
      period: 'Year – Year',
      current: false,
      summary: 'Placeholder summary. One or two sentences about what you built and learned here.',
    },
    {
      id: 'previous-2',
      company: 'Earlier company',
      title: 'Role title',
      period: 'Year – Year',
      current: false,
      summary: 'Placeholder summary. One or two sentences about what you built and learned here.',
    },
  ],
}

export const contact = {
  eyebrow: 'Contact',
  title: 'Let’s build something.',
  intro: 'The fastest way to reach me is email. Andy screens all my messages, but he’s friendly.',
  /* PLACEHOLDER links: replace with your real email and profiles. */
  email: 'hello@example.com',
  links: [
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-profile' },
    { id: 'github', label: 'GitHub', href: 'https://github.com/your-username' },
  ],
}

export const footer = {
  note: 'Designed and built by Samantha Ponce. Andy supervised.',
}
