import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './styles/global.css'
import App from './App.jsx'
import { syncBrowserColor } from './utils/displaySettings'

// A saved Light theme is already on <html> (see index.html); match the browser's toolbar to it.
syncBrowserColor()

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build ships with the page already rendered into #root
// (see scripts/prerender.mjs), so React attaches to that markup. The dev
// server serves an empty #root and renders from scratch.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
