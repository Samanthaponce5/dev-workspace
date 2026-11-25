/*
 * The sections have their own addresses (/work, /about, /experience,
 * /contact), so the address bar reads cleanly and a link to a section
 * can be shared. It is still one page: following a section link scrolls
 * to it without loading anything (see hooks/useSectionRoutes.js), and the
 * host serves the same page at each of these paths (see vercel.json).
 *
 * index.html has its own copy of the home-page test, so the intro can be
 * skipped before anything paints when the page opens at a section.
 */
import { nav } from '../content/content'

export const HOME_PATH = '/'

const SECTION_IDS = new Set(nav.map((item) => item.id))

/** A section's address. */
export const pathOf = (id) => `/${id}`

/** The section a path names, '' for the home page, or null for any other path. */
export function sectionOf(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/index.html') return ''
  const id = path.slice(1)
  return SECTION_IDS.has(id) ? id : null
}
