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
  /* The big heading. The full name stays in the page title, the navbar logo and search results. */
  title: 'Sam',
  role: `${site.role} at ${site.company}`,
  /* Shown on tablet and desktop only, to keep the phone hero compact. */
  tagline: 'I build fast, accessible interfaces.',
  primaryAction: { label: 'View work', href: '#work' },
}

/* Text and settings used inside the 3D desk scene. */
export const scene = {
  /* What the curved monitor shows beside the code: a DevTools Network panel. */
  monitor: {
    tabs: ['Elements', 'Console', 'Network'],
    activeTab: 'Network',
    filters: ['All', 'Fetch/XHR', 'JS', 'CSS', 'Img'],
    activeFilter: 'Fetch/XHR',
    /* The highlighted request is drawn larger, with a green status. */
    requests: [
      { method: 'GET', path: '/api/me', status: '200' },
      { method: 'GET', path: '/api/episodes', status: '200 OK', highlight: true },
      { method: 'GET', path: '/api/search', status: '304' },
    ],
    summary: '3 requests',
  },
  /* What the laptop shows: a simplified dark-mode Q&A page. */
  laptop: {
    question: 'Why is my Three.js canvas blurry on mobile?',
    accepted: 'Accepted answer',
    snippet: 'setPixelRatio(devicePixelRatio)',
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
  intro:
    'I’ve spent five years building production interfaces. Lately I’ve been taking on more of the APIs and backend logic those interfaces depend on.',
  actions: {
    work: { label: 'See my work', href: '#work' },
    contact: { label: 'Get in touch', href: '#contact' },
  },
  /* `icon` names one in components/ui/icons.jsx. */
  points: [
    { id: 'bring', icon: 'code', label: 'What I bring:', text: 'React and complex UI.' },
    { id: 'toward', icon: 'layers', label: 'What I’m building toward:', text: 'end-to-end feature ownership.' },
    { id: 'ai', icon: 'sparkles', label: 'How I use AI:', text: 'explore faster, review and test the result.' },
  ],
}

export const skills = {
  eyebrow: 'What I do',
  title: 'Front-end first, comfortable across the stack.',
  intro: 'I build user-focused products, connect front-ends to the right data, and use AI tooling to ship faster and smarter.',
  groups: [
    {
      id: 'front-end',
      icon: 'layers',
      title: 'Front-end',
      description: 'Fast, accessible interfaces that scale and feel great to use.',
      tags: ['React', 'Redux-Saga', 'Complex UI', 'Accessibility', 'Performance'],
    },
    {
      id: 'back-end',
      icon: 'database',
      title: 'APIs and back-end',
      description: 'The services behind the UI: designing endpoints, integrating data, and keeping it reliable.',
      tags: ['REST APIs', 'Laravel', 'Integrations', 'Data access', 'Caching'],
    },
    {
      id: 'ai-tooling',
      icon: 'gear',
      title: 'AI and tooling',
      description: 'Turning AI experiments into useful, reliable features and better workflows.',
      tags: ['AI-assisted development', 'Prototyping', 'Developer workflows', 'AI features'],
    },
  ],
}

/*
 * PLACEHOLDER: put your résumé at public/resume.pdf (or change this path).
 * Until that file exists, the two résumé links lead nowhere.
 */
export const resume = {
  href: '/resume.pdf',
  newTabNote: '(opens in a new tab)',
}

export const experience = {
  eyebrow: 'Experience',
  title: 'How my scope has grown',
  intro:
    'My work at Podchaser has expanded from building React interfaces to collaborating across the stack and contributing backend changes.',
  examplesLabel: 'Examples:',
  /* In order: each stage builds on the one before it. `icon` names one in components/ui/icons.jsx. */
  stages: [
    {
      id: 'react',
      icon: 'atom',
      title: 'React interfaces',
      summary: 'Build and maintain user-facing experiences in React.',
      examples: 'search and filter controls, content discovery UI, and reusable components.',
    },
    {
      id: 'cross-stack',
      icon: 'layers',
      title: 'Cross-stack collaboration',
      summary: 'Work across the frontend and backend to connect features end to end.',
      examples: 'integrate APIs with the UI, align changes across the stack, and troubleshoot feature issues.',
    },
    {
      id: 'backend',
      icon: 'code',
      title: 'Backend contributions',
      summary: 'Make backend changes to support product features and improvements.',
      examples: 'contribute Laravel changes (e.g., endpoints and data updates) to support frontend experiences.',
    },
  ],
  currentRole: { label: 'Current role:', value: `${site.company} · ${site.role}` },
  resumeLabel: 'View Résumé',
}

export const contact = {
  eyebrow: 'Contact',
  title: 'What are you building?',
  intro: 'I’d love to hear about your team and what you’re working on.',
  linksLabel: 'Ways to reach me',
  links: [
    { id: 'email', icon: 'mail', label: 'Email', href: 'mailto:samanthaponce.dev@gmail.com' },
    { id: 'linkedin', icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/samantha-ponce-0bb6ba1a9/', external: true },
    { id: 'github', icon: 'github', label: 'GitHub', href: 'https://github.com/Samanthaponce5', external: true },
  ],
  resumeLabel: 'Résumé',
}

/* The navbar's theme switch. Each label says what pressing it will do. */
export const themeToggle = {
  toLight: 'Switch to light mode',
  toDark: 'Switch to dark mode',
}

/* The Display settings button and its panel. Each group's `id` is the setting it controls. */
export const displaySettings = {
  title: 'Display settings',
  close: 'Close display settings',
  groups: [
    {
      id: 'textSize',
      label: 'Text size',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'large', label: 'Large' },
      ],
    },
    {
      id: 'contrast',
      label: 'Contrast',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'high', label: 'High' },
      ],
    },
    {
      id: 'motion',
      label: 'Motion',
      options: [
        { value: 'system', label: 'System' },
        { value: 'reduced', label: 'Reduced' },
      ],
    },
  ],
  preview: {
    label: 'Preview',
    sampleNote: 'Sample button',
  },
  reset: 'Reset',
  apply: 'Apply',
  applied: 'Display settings applied.',
}

export const footer = {
  note: 'Designed and built by Samantha Ponce. Andy supervised.',
  backToTop: 'Back to top',
}
