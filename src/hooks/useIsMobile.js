import { useMediaQuery } from './useMediaQuery'

/* Keep in sync with the 48rem breakpoint used in component styles. */
const MOBILE_QUERY = '(max-width: 47.99rem)'

/** True on phone-sized viewports, where the scene is simplified. */
export function useIsMobile() {
  return useMediaQuery(MOBILE_QUERY)
}
