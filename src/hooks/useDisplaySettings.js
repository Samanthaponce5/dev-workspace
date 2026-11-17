import { useSyncExternalStore } from 'react'
import { DEFAULT_SETTINGS, getAppliedSettings, subscribeToSettings } from '../utils/displaySettings'

// The prerendered HTML is written with the defaults; saved settings take over as the page hydrates.
const getServerSnapshot = () => DEFAULT_SETTINGS

/** The display settings currently applied to the site. Updates when the visitor applies new ones. */
export function useDisplaySettings() {
  return useSyncExternalStore(subscribeToSettings, getAppliedSettings, getServerSnapshot)
}
