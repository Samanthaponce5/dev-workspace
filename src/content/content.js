/*
 * All copy for the site lives in this file.
 * Anything marked PLACEHOLDER is stand-in text for Samantha to replace.
 */

export const site = {
  name: 'Samantha Ponce',
  role: 'Front-End Developer',
  company: 'Podchaser',
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'What I do' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export const hero = {
  eyebrow: 'Front-End Developer · Growing Into Full-Stack',
  title: site.name,
  intro:
    'I’m a Front-End Developer at Podchaser, building fast, accessible interfaces and growing into Full-Stack work. I care about the small details that make software feel good to use.',
  primaryAction: { label: 'See my work', href: '#work' },
  secondaryAction: { label: 'Say hi', href: '#contact' },
}

/* Text and settings used inside the 3D desk scene. */
export const scene = {
  monitorLines: [site.name, site.role],
  /* Shown on the desk clock next to the visitor's real local time. */
  clockTemperature: '73°F',
  duckQuotes: [
    'Have you tried explaining it to me?',
    'Quack. Did you check the console?',
    'It works on my pond.',
  ],
  description:
    'A tiny 3D model of Samantha’s desk at night: a curved monitor showing code, a laptop, a glowing jellyfish lamp, a rubber duck, and Samantha typing with her dog Andy beside her chair.',
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
