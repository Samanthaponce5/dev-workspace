/*
 * All copy for the site lives in this file.
 * Anything marked PLACEHOLDER is stand-in text for Samantha to replace.
 */

export const site = {
  /* First name only, everywhere on the site. */
  name: 'Samantha',
  /* The letters of the logo (drawn, see components/layout/logoShape.js), for its accessible name. */
  initials: 'SP',
  role: 'Front-End Developer',
  /* Podchaser was acquired by Acast; written the same way as on the résumé. */
  company: 'Acast / Podchaser',
}

/*
 * Header links, in display order. `pinned` links stay visible in the bar on
 * phones; the rest live in the menu there.
 */
export const nav = [
  { id: 'work', label: 'Skills', pinned: true },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export const hero = {
  /* The big heading. The full name stays in the page title, the navbar logo and search results. */
  title: 'Sam',
  role: 'Front-End Software Engineer',
  /* Shown on tablet and desktop only, to keep the phone hero compact. */
  tagline: 'I build and upgrade production React apps.',
  /* The core tools, at a glance. Each skill appears once on the site: the rest are under What I do. `icon` names one in components/ui/icons.jsx. */
  toolsLabel: 'Tools I use most',
  tools: [
    { label: 'React', icon: 'atom' },
    { label: 'JavaScript', icon: 'code' },
    { label: 'Redux-Saga', icon: 'cycle' },
    { label: 'Jest', icon: 'flask' },
    { label: 'Node.js', icon: 'server' },
    { label: 'HTML & CSS', icon: 'layers' },
  ],
  primaryAction: { label: 'View skills', href: '/work' },
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
  eyebrow: 'About me',
  /* The highlight is shown in the accent colour. */
  title: {
    lead: 'Five years of production React,',
    highlight: 'from new features to major upgrades.',
  },
  intro:
    'I’m based in New York, working on a large React and Redux product: I build data-heavy pages like search, charts and tables, keep the codebase current, and track bugs to their root cause, whether that’s in the UI, the API data or the build.',
  statsLabel: 'At a glance',
  /* A number counts up when first seen; a word fades in. No invented figures. */
  stats: [
    { id: 'years', value: 5, suffix: '+', label: 'Years of experience' },
    /* Samantha's own figure: approximate code changes merged at Acast / Podchaser. */
    { id: 'merged', value: 700, suffix: '+', label: 'Code changes merged' },
    { id: 'upgrade', value: '17 → 19', label: 'React upgrade I led' },
  ],
  notes: [
    {
      id: 'bring',
      icon: 'target',
      title: 'What I bring',
      text: 'Patient, methodical debugging. I follow a problem until I find what actually causes it, then add the test that keeps it fixed.',
    },
    {
      id: 'growing',
      icon: 'chart',
      title: 'What I’m growing into',
      text: 'Deeper system design and architecture, and owning more of each feature, from the API to the screen.',
    },
    {
      id: 'how',
      icon: 'compass',
      title: 'How I work',
      text: 'Clear requirements, thoughtful iteration, and code that stays easy to change. AI tools speed up exploration; review and testing stay with me.',
    },
  ],
}

export const skills = {
  eyebrow: 'What I do',
  title: 'Front-end first, comfortable across the stack.',
  intro: 'Where I spend my time, and the tools I reach for.',
  /* The tags leave out the core tools the hero already shows, so no skill is listed twice. */
  groups: [
    {
      id: 'front-end',
      icon: 'layers',
      title: 'Front-end',
      description: 'Interfaces that stay fast and accessible as the product grows, built from reusable components.',
      tags: ['React Router', 'Next.js', 'React Testing Library', 'Accessibility', 'Responsive design'],
    },
    {
      id: 'back-end',
      icon: 'database',
      title: 'APIs and back-end',
      description: 'Connecting the UI to its data, and making the backend changes a feature needs.',
      tags: ['REST APIs', 'GraphQL', 'Laravel', 'Express'],
    },
    {
      id: 'ai-tooling',
      icon: 'gear',
      title: 'AI and tooling',
      description: 'I’ve shipped an AI-powered feature, and I use AI every day to prototype, build and debug.',
      tags: ['AI features', 'Prototyping', 'Developer workflows'],
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
  intro: 'Three roles, each with more ownership than the last: from a small intern team, to client apps, to a large production product.',
  examplesLabel: 'Highlights:',
  /* In order, oldest first: each role builds on the one before it. `icon` names one in components/ui/icons.jsx. */
  stages: [
    {
      id: 'mren',
      icon: 'code',
      title: 'Software Engineer Intern',
      meta: 'Mren · Nov 2020 – Feb 2021',
      summary: 'Built and tested web features with React, TypeScript and Node.js.',
      examples: 'coordinated four intern developers through planning and code reviews, and refactored code for quality and performance.',
    },
    {
      id: 'zvn',
      icon: 'layers',
      title: 'Software Engineer',
      meta: 'ZVN DEV · Mar 2021 – Dec 2022',
      summary: 'Built client-facing web apps and storefronts for a range of clients.',
      examples: 'React, Next.js and GraphQL apps, Shopify storefronts with Liquid templates, and cross-browser fixes in Chrome, Safari and Firefox.',
    },
    {
      id: 'podchaser',
      icon: 'atom',
      title: site.role,
      meta: `${site.company} · Dec 2022 – present`,
      summary: 'Own pages and workflows in a large React and Redux app, from requirements to release.',
      examples: 'charts, search, discovery and filtering on REST APIs, root-cause fixes backed by regression tests, and Laravel changes behind the features I build.',
    },
  ],
  currentRole: { label: 'Current role:', company: site.company, role: site.role },
  resumeLabel: 'View Résumé',
}

export const contact = {
  eyebrow: 'Contact',
  title: 'What are you building?',
  intro: 'I’d love to hear about your team and what you’re working on.',
  linksLabel: 'Ways to reach me',
  links: [
    /* The address is shown and can be copied: an email link alone does nothing for anyone without a mail app set up. */
    { id: 'email', icon: 'mail', label: 'Email', address: 'samanthaponce.dev@gmail.com', href: 'mailto:samanthaponce.dev@gmail.com' },
    { id: 'linkedin', icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/samantha-ponce-0bb6ba1a9/', external: true },
    { id: 'github', icon: 'github', label: 'GitHub', href: 'https://github.com/Samanthaponce5', external: true },
    { id: 'resume', icon: 'document', label: 'Résumé', href: resume.href, external: true },
  ],
  copy: { done: 'Copied', name: 'Copy email address', announce: 'Email address copied.' },
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

/* The cookie question, shown only to visitors from the EU/EEA, the UK and Switzerland (see utils/analytics.js). */
export const consent = {
  label: 'Cookie choice',
  text: 'May I use Google Analytics cookies to count visits and see which sections are read? Nothing that identifies you is collected.',
  /* "Cookie settings", opened from the footer: an Off / On switch. */
  settingsTitle: 'Cookie settings',
  settingsText: 'Google Analytics cookies help me see how visitors use this site. Nothing that identifies you is collected.',
  settingLabel: 'Analytics cookies',
  off: 'Off',
  on: 'On',
  browserNote: 'Off because your browser asks sites not to track you. You can still turn it on here.',
  close: 'Close cookie settings',
  privacy: 'Privacy',
  allow: 'Allow',
  decline: 'No thanks',
}

export const footer = {
  note: `Designed and built by ${site.name}`, // followed by a small spinning heart (Footer.jsx)
  /* How the site itself is made: the engineering a visitor can't see. */
  built: 'Hand-built with React and React Three Fiber: prerendered for a fast first paint, usable by keyboard, with adjustable text size, contrast and motion.',
  privacy: 'Privacy',
  cookieSettings: 'Cookie settings',
  backToTop: 'Back to top',
}
