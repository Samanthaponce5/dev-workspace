# Samantha Ponce · Portfolio

Personal portfolio for Samantha Ponce, front-end developer. The hero is a small
3D model of her desk at night; the rest of the page is calm and easy to scan.

Built with [Vite](https://vite.dev), [React](https://react.dev) and
[React Three Fiber](https://r3f.docs.pmnd.rs).

## Requirements

- Node.js 20.19 or newer (22 recommended)
- npm 10 or newer

## Run it locally

```bash
npm install
npm run dev
```

Vite prints a local URL, usually <http://localhost:5173>.

## Other commands

| Command           | What it does                                       |
| ----------------- | -------------------------------------------------- |
| `npm run build`   | Builds the production site into `dist/`            |
| `npm run preview` | Serves the production build locally to check it    |
| `npm run lint`    | Runs ESLint; the project is kept at zero warnings  |

## Editing the content

All text on the site lives in [`src/content/content.js`](src/content/content.js).
Anything marked `PLACEHOLDER` there is stand-in copy waiting to be replaced,
including the contact email and the LinkedIn and GitHub links.

Colours, spacing, type sizes and animation timings are design tokens in
[`src/styles/tokens.css`](src/styles/tokens.css).

## Project structure

```
src/
  components/
    ui/           Reusable building blocks (Button, Section, Heading, Tag, Card…)
    layout/       Nav and Footer
    three/        The 3D desk scene and its props
    characters/   Mini-Samantha and Andy, in 3D and lightweight SVG versions
  sections/       Hero, About, Skills, Experience, Contact
  hooks/          useReducedMotion, useIsMobile, useInView…
  content/        content.js, the single source of all copy
  styles/         Design tokens and global styles
  utils/          Small helpers
```

Component styles use CSS Modules (`Component.module.css` next to `Component.jsx`).

## Dependencies

| Package                                   | Why it is here                                                       |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `three`                                   | The 3D engine behind the desk scene                                  |
| `@react-three/fiber`                      | Lets the scene be written as React components                        |
| `@react-three/drei`                       | Ready-made helpers for fiber (rounded shapes, soft shadows, loaders) |
| `@fontsource-variable/bricolage-grotesque`| Self-hosted heading and body font, no third-party font requests      |
| `@fontsource-variable/jetbrains-mono`     | Self-hosted monospace font for small labels and tags                 |

## Deploy to Vercel

### From the Vercel dashboard

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects Vite automatically. Confirm the settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Select **Deploy**. Every later push to the main branch redeploys.

### From the command line

```bash
npm install --global vercel
vercel          # first run links the project and creates a preview deployment
vercel --prod   # deploys to production
```
