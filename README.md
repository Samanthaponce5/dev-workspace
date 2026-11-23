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
Anything marked `PLACEHOLDER` there is stand-in content waiting to be
replaced (currently only the résumé link, see below).

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
    characters/   Mini Samantha and Andy, modelled in code
    settings/     The Display settings button and its panel
  sections/       Hero, Work, About, Experience, Contact
  intro/          The reveal that hands the intro over to the page
  hooks/          useReducedMotion, useIsMobile, useInView…
  content/        content.js, the single source of all copy
  styles/         Design tokens and global styles
  utils/          Small helpers
```

Component styles use CSS Modules (`Component.module.css` next to `Component.jsx`).

## How the page loads

1. **Intro.** `index.html` carries a small overlay with its styles inline:
   five pieces cut from the real SP letters (with rounded joins, so they
   never change shape) drift out, sweep in on curves and lock together, S
   first and then P, with one soft settle. The
   lime dot lands beside them with one soft glow and a few sparks, and a
   tiny duck hops in reply. It is all CSS, so it plays from the first frame
   without any JavaScript, in the visitor's theme (it uses the theme tokens).
2. **Prerendered page.** `npm run build` renders the React app once and writes
   the result into `dist/index.html`, so the text is in the HTML for search
   engines, link previews and visitors without JavaScript. React then attaches
   to that markup instead of building it again.
3. **3D scene.** The scene's bundle is preloaded alongside the main script. It
   mounts behind the intro at its final size, compiles its shaders in the
   background, and signals once it has drawn a complete frame.
4. **Reveal.** Once the logo has assembled and the scene is ready, the logo
   flies along a curve into the navbar, trailing a thin line of light, the
   duck hops to its spot on the shelf, and the page rises into view under a
   glowing arc. Samantha's greeting
   starts as soon as it has cleared.

If WebGL is missing, the device is low-powered, or the scene takes unusually
long, the reveal goes ahead with a still image of the scene in the same place.
A scene that arrives late fades in over the image without moving anything.

Rendering pauses when the hero is off screen or the tab is hidden. Visitors
who prefer reduced motion get the logo already in place, a quick fade
instead of the reveal, and a scene that holds still.

## Themes

The site has a Dark theme (the default) and a Light theme, switched with the
sun/moon button in the navbar. The choice is remembered and restored before
the first paint, like the display settings below.

- Each theme's whole palette is in
  [`src/styles/tokens.css`](src/styles/tokens.css): the page's colours, and
  the `--scene-*` values for the 3D platform, LED strips and jellyfish lamp. The scene reads
  those through
  [`src/components/three/sceneTheme.js`](src/components/three/sceneTheme.js)
  and changes its materials and lights in place, so switching never reloads
  the scene or replays the intro.
- Each theme also has a High contrast version, chosen in Display settings.
- The intro overlay in `index.html` paints before the stylesheet loads, so
  it repeats four Light colours. Keep them in step with `tokens.css`.
- The still image used when the 3D scene cannot run is captured from the
  Dark scene, so in Light its platform keeps the Dark theme's teal.

## Display settings

The button in the bottom corner opens a panel with three choices: text size
(Default or Large), contrast (Default or High) and motion (System or Reduced).
Choices show in the panel's preview first and reach the site on **Apply**;
they are remembered in the browser's local storage.

- Applied settings are data attributes on `<html>` (`data-text-size`,
  `data-contrast`, `data-motion`, and `data-theme` for the theme). The design tokens in
  [`src/styles/tokens.css`](src/styles/tokens.css) respond to the first two,
  so a component that uses the tokens needs no code of its own.
- A few lines of script in `index.html` restore saved settings before the
  first paint. Its storage key and attribute names must match
  [`src/utils/displaySettings.js`](src/utils/displaySettings.js).
- Reduced motion, from the setting or from the visitor's system, swaps the
  intro for a quick fade, holds the 3D scene still and turns off smooth
  scrolling. Components ask `useReducedMotion()`; styles are covered by one
  rule in [`src/styles/global.css`](src/styles/global.css).

## Regenerating the still images

The still images in `public/`, the duck picture and the pieced SP letters
inside the intro, and their measurements are captured from the live site. Run this again after
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
