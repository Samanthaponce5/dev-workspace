# Samantha Ponce · Portfolio

Personal portfolio for Samantha Ponce, front-end developer. The hero is a small
3D model of her desk at night, with a mini Samantha, her dog Andy and a rubber
duck that talks back. The rest of the page is calm and easy to scan.

Built with [Vite](https://vite.dev), [React](https://react.dev) and
[React Three Fiber](https://r3f.docs.pmnd.rs). Everything in the scene is
modelled in code: there are no 3D model files and no photos.

## Requirements

- Node.js 20.19 or newer (22 recommended)
- npm 10 or newer

## Run it locally

```bash
npm install
npm run dev
```

Vite prints a local URL, usually <http://localhost:5173>.

## Commands

| Command           | What it does                                                             |
| ----------------- | ------------------------------------------------------------------------ |
| `npm run dev`     | Starts the development server                                            |
| `npm run build`   | Builds the production site into `dist/`, with the page's HTML prerendered |
| `npm run preview` | Serves the production build locally to check it                          |
| `npm run lint`    | Runs ESLint; the project is kept at zero warnings                        |
| `npm run posters` | Regenerates the still images of the scene (see below)                    |

## Editing the content

All text on the site lives in [`src/content/content.js`](src/content/content.js),
including what the characters say and the text on the monitor and laptop.
Anything marked `PLACEHOLDER` there is stand-in copy waiting to be replaced:
the About intro, the contact email, and the LinkedIn and GitHub links.

The two résumé links point at `/resume.pdf`. Add the file as
`public/resume.pdf`, or change the path in `content.js`.

Colours, spacing, type sizes and animation timings are design tokens in
[`src/styles/tokens.css`](src/styles/tokens.css).

## Project structure

```
index.html        Page shell, meta tags and the intro overlay (inline, so it paints first)
scripts/          Build-time tools: prerender.mjs and capture-posters.mjs
public/           Favicon, the scene's still images, the link-preview image
src/
  components/
    ui/           Reusable building blocks (Button, Section, Heading, Tag, Card…)
    layout/       Nav, mobile menu, logo and footer
    three/        The 3D desk scene: camera, lighting, furniture, props, textures
    characters/   Mini Samantha and Andy, in 3D and as lightweight SVGs
  sections/       Hero, Work, About, Experience, Contact
  intro/          The reveal that hands the intro over to the page
  hooks/          useReducedMotion, useIsMobile, useInView…
  content/        content.js, the single source of all copy
  styles/         Design tokens and global styles
  utils/          Small helpers
```

Component styles use CSS Modules (`Component.module.css` next to `Component.jsx`).

## How the page loads

1. **Intro.** `index.html` carries a small overlay (the SP logo and a tiny
   duck) with its styles and images inline, so it paints before any script
   has arrived.
2. **Prerendered page.** `npm run build` renders the React app once and writes
   the result into `dist/index.html`, so the text is in the HTML for search
   engines, link previews and visitors without JavaScript. React then attaches
   to that markup instead of building it again.
3. **3D scene.** The scene's bundle is preloaded alongside the main script. It
   mounts behind the intro at its final size, compiles its shaders in the
   background, and signals once it has drawn a complete frame.
4. **Reveal.** At that signal the duck hops to its spot on the shelf, the logo
   glides into the navbar, and the greeting starts as soon as the intro clears.

If WebGL is missing, the device is low-powered, or the scene takes unusually
long, the reveal goes ahead with a still image of the scene in the same place.
A scene that arrives late fades in over the image without moving anything.

Rendering pauses when the hero is off screen or the tab is hidden. Visitors
who prefer reduced motion get a quick fade instead of the reveal, and a scene
that holds still.

## Regenerating the still images

The still images in `public/`, the duck and logo pictures inside the intro,
and their measurements are captured from the live scene. Run this again after
changing the scene, the duck or the navbar logo:

```bash
npm run dev        # in one terminal
npm run posters    # in another; needs Google Chrome installed
```

If the dev server is not on the default address, pass it:
`node scripts/capture-posters.mjs http://localhost:5173`.

The link-preview image, `public/og-image.jpg`, is a 1200×630 screenshot of the
hero taken by hand. Retake it if the hero changes noticeably.

## Dependencies

| Package                            | Why it is here                                                   |
| ---------------------------------- | ---------------------------------------------------------------- |
| `react`, `react-dom`               | The UI library, and the build-time prerender                     |
| `three`                            | The 3D engine behind the desk scene                              |
| `@react-three/fiber`               | Lets the scene be written as React components                    |
| `@react-three/drei`                | Helpers for fiber: rounded boxes and speech bubbles anchored in 3D |
| `@fontsource-variable/geist`       | Self-hosted typeface, no third-party font requests               |
| `@fontsource-variable/geist-mono`  | Self-hosted monospace for small labels and tags                  |

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

### The site's address

Link previews need full URLs. On Vercel the build picks up the production
domain automatically. To use a different address (a custom domain, or another
host), set the `SITE_URL` environment variable, for example
`SITE_URL=https://example.com`.

[`vercel.json`](vercel.json) sets long-lived caching for the hashed files in
`/assets`.
