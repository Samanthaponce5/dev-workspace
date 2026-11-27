/*
 * Google Analytics 4, kept small, out of the way and privacy-respecting
 * (the privacy page, public/privacy.html, says all of this to visitors;
 * keep the two in step):
 *
 *   - It only runs on the live site (ANALYTICS_HOSTS), so local builds and
 *     preview deployments don't count as visits.
 *   - Google's script loads after the intro has finished, so it never
 *     competes with the intro's animation.
 *   - Visitors in the EU/EEA, the UK and Switzerland are asked first (a
 *     small banner, see ConsentBanner.jsx); nothing is loaded unless they
 *     allow it. Their country comes from Cloudflare, which hosts the site.
 *     If it can't be told, nothing is tracked.
 *   - A browser's Do Not Track or Global Privacy Control signal turns it
 *     off, as does a visitor's own choice: ?notrack in the address turns it
 *     off in that browser, ?track forgets the choice.
 *   - Google's advertising features (Google signals, ad personalisation,
 *     ad storage) are off. Nothing personal is ever sent.
 *
 * Events: every button and link has its own plain-English event name, so
 * the Events report reads like a list of what visitors did (the full list
 * is in the README). Links carry theirs in data-track (see trackClicks());
 * others call track() directly. Events sent before analytics has decided
 * whether it may run wait, and are dropped if the answer is no. Whether a
 * visitor is on a phone or a computer is Google's own "Device category".
 */
import { isIntroDone, onIntroDone } from './intro'

export const ANALYTICS_ID = 'G-HMT3FWC1FW'
const ANALYTICS_HOSTS = ['samanthaponce.dev', 'www.samanthaponce.dev']
const CHOICE_KEY = 'analytics-choice' // 'on' (allowed) or 'off' (declined); absent until the visitor chooses

/* Where analytics cookies need consent first: the EU, the rest of the EEA (Iceland, Liechtenstein, Norway), the UK and Switzerland. */
const CONSENT_COUNTRIES = new Set([
  ...['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'],
  ...['IS', 'LI', 'NO'],
  ...['GB', 'CH'],
])

let state = 'pending' // 'pending' until decided, then 'on' or 'off'
let queue = []
let landing = ''
const askListeners = new Set()

const readChoice = () => {
  try {
    return localStorage.getItem(CHOICE_KEY)
  } catch {
    return null
  }
}

const saveChoice = (choice) => {
  try {
    if (choice) localStorage.setItem(CHOICE_KEY, choice)
    else localStorage.removeItem(CHOICE_KEY)
  } catch {
    /* No storage: the choice lasts for this visit only. */
  }
}

/* Reads ?notrack / ?track, remembers the choice, and takes it out of the address bar. Returns the choice for this visit. */
function readAddressChoice() {
  const params = new URLSearchParams(window.location.search)
  const asked = params.has('notrack') ? 'off' : params.has('track') ? 'reset' : null
  if (!asked) return readChoice()
  saveChoice(asked === 'off' ? 'off' : null)
  params.delete('notrack')
  params.delete('track')
  const query = params.toString()
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  return asked === 'off' ? 'off' : null
}

/* The browser's own "don't track me" signals. */
const browserSaysNo = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1'

/* The visitor's country, from Cloudflare (it answers /cdn-cgi/trace on every site it serves). Null if it can't be told. */
async function visitorCountry() {
  try {
    const response = await fetch('/cdn-cgi/trace', { cache: 'no-store' })
    if (!response.ok) return null
    return (await response.text()).match(/^loc=([A-Z]{2})$/m)?.[1] ?? null
  } catch {
    return null
  }
}

/* Turns tracking on: Google's tag with advertising features off, the page view for the address the page opened at, then anything waiting. */
function turnOn() {
  state = 'on'
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments) // Google's tag reads the arguments object itself, not an array
  }
  window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' })
  window.gtag('set', { allow_google_signals: false, allow_ad_personalization_signals: false })
  window.gtag('js', new Date())
  window.gtag('config', ANALYTICS_ID, { page_location: landing })
  queue.forEach(([event, params]) => window.gtag('event', event, params))
  queue = []
  document.head.append(Object.assign(document.createElement('script'), { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}` }))
}

function turnOff() {
  state = 'off'
  queue = []
}

/** Sends an event. Waits while the decision is pending; does nothing when analytics is off. */
export function track(event, params = {}) {
  if (state === 'on') window.gtag('event', event, params)
  else if (state === 'pending') queue.push([event, params])
}

/** Calls `listener` if this visitor needs to be asked. Returns an unsubscribe function. */
export function onConsentNeeded(listener) {
  askListeners.add(listener)
  return () => askListeners.delete(listener)
}

/** The visitor's answer to the banner. */
export function setConsent(allowed) {
  saveChoice(allowed ? 'on' : 'off')
  if (allowed) turnOn()
  else turnOff()
}

/* Decides, once the intro has gone and the browser is idle: track, ask, or don't. */
async function decide(choice) {
  if (choice === 'off' || browserSaysNo()) return turnOff()
  const country = await visitorCountry()
  if (!country) return turnOff()
  if (!CONSENT_COUNTRIES.has(country)) return turnOn()
  if (choice === 'on') return turnOn()
  askListeners.forEach((listener) => listener())
}

let started = false

/** Starts analytics on the live site (call once, in the browser). */
export function startAnalytics() {
  if (started) return
  started = true
  landing = window.location.href
  const choice = readAddressChoice()
  if (!ANALYTICS_HOSTS.includes(window.location.hostname)) return turnOff()

  const go = () => decide(choice)
  const whenIdle = () => (window.requestIdleCallback ? window.requestIdleCallback(go, { timeout: 2000 }) : window.setTimeout(go, 200))
  if (isIntroDone()) whenIdle()
  else onIntroDone(whenIdle)
}

/** Sends the events written on links (data-track, data-track-*) when they are followed. Returns a cleanup function. */
export function trackClicks() {
  const onClick = (event) => {
    const element = event.target.closest?.('[data-track]')
    if (!element) return
    const params = {}
    for (const [key, value] of Object.entries(element.dataset)) {
      if (key.startsWith('track') && key !== 'track') params[key.slice(5).toLowerCase()] = value
    }
    track(element.dataset.track, params)
  }
  document.addEventListener('click', onClick, { capture: true })
  return () => document.removeEventListener('click', onClick, { capture: true })
}
