import { useMediaQuery } from './useMediaQuery'

/* Keep in sync with the 64rem breakpoint where the hero switches to its side-by-side layout. */
const MOBILE_QUERY = '(max-width: 63.99rem)'

/** True on phones and tablets, where the hero stacks and the scene is lighter. */
export function useIsMobile() {
  return useMediaQuery(MOBILE_QUERY)
}
