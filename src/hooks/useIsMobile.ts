import { useEffect, useState } from 'react';

/** Below this width the mobile compact header + on-screen keyboard layout takes over. */
export const MOBILE_BREAKPOINT = 720;

export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    // The lazy useState initializer above already captures the value matching
    // this `query` on first render; the listener only needs to catch changes
    // after that (including a `query` itself changing, since matches is
    // re-derived from the new mql on the next actual viewport change).
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
}
