import { renderToString } from 'react-dom/server'
import App from './App.jsx'

/**
 * Renders the page to an HTML string. Used only at build time, by
 * scripts/prerender.mjs, so the built index.html already contains the
 * page's content before any JavaScript has run.
 */
export function render() {
  return renderToString(<App />)
}
